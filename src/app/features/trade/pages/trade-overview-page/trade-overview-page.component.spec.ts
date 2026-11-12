import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { I18nService } from '../../../../core/services/i18n.service';
import { AuthService } from '../../../auth/data-access/auth.service';
import { JournalTrade } from '../../types/trade.models';
import { TradeOverviewPageComponent } from './trade-overview-page.component';

const trade = (id: string, note: string | null = null): JournalTrade => ({
  tradeId: id,
  tradeNo: id,
  userId: 'user-1',
  symbol: id === '1' ? 'XAUUSD' : 'EURUSD',
  marketType: 'FOREX',
  side: 'BUY',
  entryPrice: '2680.5',
  exitPrice: '2687.2',
  stopLoss: '2672',
  takeProfit: '2701',
  quantity: '0.1',
  openTime: '2026-11-11T07:08:00Z',
  closeTime: '2026-11-12T07:32:00Z',
  status: 'CLOSED',
  thesis: 'Original thesis',
  note,
  createdAt: '2026-11-12T08:00:00Z',
  updatedAt: '2026-11-12T08:00:00Z',
  deletedAt: null,
  exitReason: null,
  source: 'IMPORT_MT5',
  externalPositionId: `position-${id}`,
});

describe('Daily trade journal workbench', () => {
  let fixture: ComponentFixture<TradeOverviewPageComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeOverviewPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: { restoreSession: () => {}, getAccessToken: () => null },
        },
        {
          provide: I18nService,
          useValue: { currentLanguage: signal('vi'), t: (key: string) => key },
        },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TradeOverviewPageComponent);
    fixture.detectChanges();
  });
  afterEach(() => {
    http.verify();
    vi.restoreAllMocks();
  });

  function response(
    rows = [trade('1'), trade('2', 'Existing note')],
    page = 1,
    total = rows.length,
    withoutNote = 1,
  ) {
    return {
      data: rows,
      meta: { page, limit: 5, total, totalPages: Math.ceil(total / 5) },
      summary: { total, withoutNote },
    };
  }
  function load(value = response()) {
    const request = http.expectOne((req) => req.url.endsWith('/trades/journal'));
    request.flush(value);
    fixture.detectChanges();
    return request;
  }
  async function type(selector: string, value: string) {
    const input = fixture.nativeElement.querySelector(selector) as HTMLTextAreaElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }
  function click(selector: string) {
    (fixture.nativeElement.querySelector(selector) as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  it('requests a local-day range and displays CLOSED execution fields read-only', () => {
    const request = load();
    expect(new Date(request.request.params.get('from')!).getHours()).toBe(0);
    expect(new Date(request.request.params.get('before')!).getHours()).toBe(0);
    expect(request.request.params.get('notes')).toBe('all');
    expect(fixture.nativeElement.querySelectorAll('.trade-row')).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('.editor-heading').textContent).toContain('XAUUSD');
    expect(fixture.nativeElement.querySelectorAll('.execution-details input')).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('#journal-thesis').value).toBe('Original thesis');
  });

  it('saves only thesis/note and selects the next trade after successful save', async () => {
    load();
    await type('#journal-note', 'Reviewed');
    click('.button--next');
    click('.button--next');
    const patch = http.expectOne((req) => req.method === 'PATCH');
    expect(patch.request.body).toEqual({ thesis: 'Original thesis', note: 'Reviewed' });
    expect(fixture.nativeElement.querySelector('#journal-note').disabled).toBe(true);
    patch.flush({ ...trade('1'), note: 'Reviewed' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.editor-heading').textContent).toContain('EURUSD');
    expect(fixture.nativeElement.querySelector('#journal-note').value).toBe('Existing note');
  });

  it('keeps the draft and selected trade after a failed save', async () => {
    load();
    await type('#journal-note', 'Keep my draft');
    click('.button--primary');
    http
      .expectOne((req) => req.method === 'PATCH')
      .flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#journal-note').value).toBe('Keep my draft');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'journal.saveError',
    );
    expect(fixture.nativeElement.querySelector('.button--primary').disabled).toBe(false);
  });

  it('sends null when both journal fields are cleared', async () => {
    load(response([trade('1', 'Old note')]));
    await type('#journal-thesis', '');
    await type('#journal-note', '');
    click('.button--primary');
    const patch = http.expectOne((req) => req.method === 'PATCH');
    expect(patch.request.body).toEqual({ thesis: null, note: null });
    patch.flush({ ...trade('1'), thesis: null, note: null });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.button--primary').disabled).toBe(true);
  });

  it('protects unsaved changes when selecting another trade or leaving the route', async () => {
    load();
    await type('#journal-note', 'Unsaved');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    (fixture.nativeElement.querySelectorAll('.trade-row')[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#journal-note').value).toBe('Unsaved');
    expect(fixture.componentInstance.canLeave()).toBe(false);
    expect(confirm).toHaveBeenCalled();
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('refills the missing-note list and uses server summary after saving a note', async () => {
    load();
    click('.note-filters button:last-child');
    const request = load(response([trade('1')], 1, 1));
    expect(request.request.params.get('notes')).toBe('missing');
    await type('#journal-note', 'Done');
    click('.button--primary');
    http.expectOne((req) => req.method === 'PATCH').flush(trade('1', 'Done'));
    load({
      data: [],
      meta: { page: 1, limit: 5, total: 0, totalPages: 0 },
      summary: { total: 2, withoutNote: 0 },
    });
    expect(fixture.nativeElement.textContent).toContain('journal.noMissing');
    expect(fixture.nativeElement.querySelectorAll('.trade-row')).toHaveLength(0);
  });

  it('continues to the newly refilled row after saving the last row of a missing-note page', async () => {
    load();
    click('.note-filters button:last-child');
    load(
      response(
        ['1', '2', '3', '4', '5'].map((id) => trade(id)),
        1,
        6,
        6,
      ),
    );
    (fixture.nativeElement.querySelectorAll('.trade-row')[4] as HTMLButtonElement).click();
    fixture.detectChanges();
    await type('#journal-note', 'Done');
    click('.button--next');
    http.expectOne((req) => req.method === 'PATCH').flush(trade('5', 'Done'));
    load(
      response(
        ['1', '2', '3', '4', '6'].map((id) => trade(id)),
        1,
        5,
        5,
      ),
    );
    expect(fixture.nativeElement.querySelector('.editor-heading').textContent).toContain(
      'position-6',
    );
  });

  it('loads the next page when advancing from its last trade', () => {
    load(response([trade('1')], 1, 6));
    click('.button--next');
    const request = load(response([trade('2')], 2, 6));
    expect(request.request.params.get('page')).toBe('2');
    expect(fixture.nativeElement.querySelector('.editor-heading').textContent).toContain('EURUSD');
    http.expectNone((req) => req.method === 'PATCH');
  });

  it('renders a genuine empty day and supports retrying a failed load', () => {
    http
      .expectOne((req) => req.url.endsWith('/trades/journal'))
      .flush({}, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    click('.message button');
    load({
      data: [],
      meta: { page: 1, limit: 5, total: 0, totalPages: 0 },
      summary: { total: 0, withoutNote: 0 },
    });
    expect(fixture.nativeElement.textContent).toContain('journal.noTrades');
    expect(fixture.nativeElement.querySelector('[routerLink="/app/trades/import"]')).not.toBeNull();
  });

  it('cancels stale date requests so their results cannot replace the selected day', () => {
    const old = http.expectOne((req) => req.url.endsWith('/trades/journal'));
    click('.date-navigation button:first-child');
    expect(old.cancelled).toBe(true);
    load();
    expect(fixture.nativeElement.querySelectorAll('.trade-row')).toHaveLength(2);
  });
});
