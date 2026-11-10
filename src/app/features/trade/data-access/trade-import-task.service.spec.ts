import { HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { AuthService } from '../../auth/data-access/auth.service';
import { TradeImportPageComponent } from '../pages/trade-import-page/trade-import-page.component';
import { AppImportStatusComponent } from '../../../shared/components/app-import-status/app-import-status.component';
import { TradeImportTaskService } from './trade-import-task.service';

const user = signal<{ userId: string } | null>({ userId: 'import-test-user' });
const authenticated = signal(true);
const markerKey = 'trade-journal.import-task.import-test-user';
const preview = { summary: {}, trades: [{ externalPositionId: '123' }], warnings: [], errors: [] };
const result = { summary: { importedRows: 1, skippedRows: 0 }, warnings: [], errors: [] };

describe('Import task lifecycle', () => {
  let task: TradeImportTaskService;
  let http: HttpTestingController;

  beforeEach(async () => {
    const data = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
      removeItem: (key: string) => {
        data.delete(key);
      },
    });
    user.set({ userId: 'import-test-user' });
    authenticated.set(true);
    await TestBed.configureTestingModule({
      imports: [TradeImportPageComponent, AppImportStatusComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            currentUser: user,
            isAuthenticated: authenticated,
            restoreSession: () => undefined,
            getAccessToken: () => null,
          },
        },
      ],
    }).compileComponents();
    task = TestBed.inject(TradeImportTaskService);
    http = TestBed.inject(HttpTestingController);
    TestBed.tick();
  });
  afterEach(() => {
    http?.verify();
    vi.unstubAllGlobals();
  });

  function selectAndPreview() {
    task.selectFile(new File(['<html></html>'], 'report.html', { type: 'text/html' }));
    task.preview();
    return http.expectOne((r) => r.url.endsWith('/import/preview'));
  }
  function ready() {
    selectAndPreview().flush(preview);
  }

  it('keeps the request and result when the import page is destroyed', () => {
    const page = TestBed.createComponent(TradeImportPageComponent);
    page.detectChanges();
    const request = selectAndPreview();
    page.destroy();
    expect(request.cancelled).toBe(false);
    const status = TestBed.createComponent(AppImportStatusComponent);
    status.detectChanges();
    expect(status.nativeElement.textContent).toContain('report.html');
    request.event({ type: HttpEventType.UploadProgress, loaded: 5, total: 10 });
    status.detectChanges();
    expect(status.nativeElement.textContent).toContain('50%');
    request.event({ type: HttpEventType.UploadProgress, loaded: 10, total: 10 });
    expect(task.state()).toBe('processing');
    request.flush(preview);
    const returnedPage = TestBed.createComponent(TradeImportPageComponent);
    expect(task.previewResponse()).toEqual(preview);
    expect(task.state()).toBe('ready');
    returnedPage.destroy();
    status.destroy();
  });

  it('blocks reset, replacement, and duplicate requests while busy', () => {
    const request = selectAndPreview();
    task.reset();
    task.selectFile(new File(['other'], 'other.html'));
    task.preview();
    task.confirm();
    expect(task.selectedFileName()).toBe('report.html');
    expect(task.busy()).toBe(true);
    http.expectNone((r) => r.url.endsWith('/import/confirm'));
    request.flush(preview);
  });

  it('does not allow confirmation of a preview containing errors', () => {
    selectAndPreview().flush({ ...preview, errors: ['Invalid report'] });
    task.confirm();
    expect(task.canConfirm()).toBe(false);
    expect(task.state()).toBe('error');
    http.expectNone((r) => r.url.endsWith('/import/confirm'));
  });

  it('retains an unconfirmed marker on network loss and never retries confirmation', () => {
    ready();
    task.confirm();
    http.expectOne((r) => r.url.endsWith('/import/confirm')).error(new ProgressEvent('error'));
    expect(task.state()).toBe('unknown');
    expect(JSON.parse(localStorage.getItem(markerKey)!).stage).toBe('confirm');
    task.confirm();
    task.preview();
    task.selectFile(new File(['x'], 'other.html'));
    expect(task.selectedFileName()).toBe('report.html');
    http.expectNone((r) => r.url.includes('/import/'));
  });

  it('treats a proxy/server failure after confirmation as an unknown result', () => {
    ready();
    task.confirm();
    http
      .expectOne((r) => r.url.endsWith('/import/confirm'))
      .flush({}, { status: 502, statusText: 'Bad Gateway' });
    expect(task.state()).toBe('unknown');
  });

  it('preserves completed counts and prevents accidental repeat confirmation', () => {
    ready();
    task.confirm();
    task.confirm();
    http.expectOne((r) => r.url.endsWith('/import/confirm')).flush(result);
    expect(task.confirmResponse()).toEqual(result);
    expect(task.state()).toBe('complete');
    expect(localStorage.getItem(markerKey)).toBeNull();
    task.confirm();
    task.preview();
    http.expectNone((r) => r.url.includes('/import/'));
  });

  it('records preview interruption without storing the report or tokens', () => {
    const request = selectAndPreview();
    const stored = JSON.parse(localStorage.getItem(markerKey)!);
    expect(Object.keys(stored).sort()).toEqual(['filename', 'id', 'size', 'stage', 'startedAt']);
    request.error(new ProgressEvent('error'));
    expect(task.state()).toBe('error');
    expect(task.busy()).toBe(false);
    expect(localStorage.getItem(markerKey)).toBeNull();
  });

  it('restores an interrupted confirmation for the same user without issuing requests', () => {
    localStorage.setItem(
      markerKey,
      JSON.stringify({
        filename: 'previous.html',
        size: 10,
        startedAt: new Date().toISOString(),
        stage: 'confirm',
        id: 'old-task',
      }),
    );
    user.set({ userId: 'another-user' });
    TestBed.tick();
    expect(task.visible()).toBe(false);
    user.set({ userId: 'import-test-user' });
    TestBed.tick();
    expect(task.state()).toBe('unknown');
    expect(task.selectedFile()).toBeNull();
    expect(task.selectedFileName()).toBe('previous.html');
    http.expectNone((r) => r.url.includes('/import/'));
  });

  it('asks to reselect the file when a previous preview was interrupted', () => {
    localStorage.setItem(
      markerKey,
      JSON.stringify({
        filename: 'previous.html',
        size: 10,
        startedAt: new Date().toISOString(),
        stage: 'preview',
        id: 'old-task',
      }),
    );
    user.set({ userId: 'another-user' });
    TestBed.tick();
    user.set({ userId: 'import-test-user' });
    TestBed.tick();
    expect(task.state()).toBe('interrupted');
    expect(task.canConfirm()).toBe(false);
    task.selectFile(new File(['new'], 'new.html'));
    expect(task.selectedFileName()).toBe('new.html');
    expect(localStorage.getItem(markerKey)).toBeNull();
  });

  it('warns before unloading only while a request is in flight', () => {
    const request = selectAndPreview();
    const active = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(active);
    expect(active.defaultPrevented).toBe(true);
    request.flush(preview);
    const finished = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(finished);
    expect(finished.defaultPrevented).toBe(false);
  });

  it('clears live state on logout while keeping a recovery marker', () => {
    const request = selectAndPreview();
    authenticated.set(false);
    user.set(null);
    TestBed.tick();
    expect(request.cancelled).toBe(true);
    expect(task.selectedFile()).toBeNull();
    expect(task.visible()).toBe(false);
    expect(localStorage.getItem(markerKey)).not.toBeNull();
  });
});
