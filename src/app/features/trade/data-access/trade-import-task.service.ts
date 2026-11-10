import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from '../../../core/services/i18n.service';
import { AuthService } from '../../auth/data-access/auth.service';
import { TradeImportConfirmResponse, TradeImportPreviewResponse } from '../types/trade.models';
import { TradeApiService } from './trade-api.service';

type Stage = 'preview' | 'confirm';
type TaskState =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'complete'
  | 'error'
  | 'interrupted'
  | 'unknown';
interface ImportMarker {
  filename: string;
  size: number;
  startedAt: string;
  stage: Stage;
  id: string;
}

@Injectable({ providedIn: 'root' })
export class TradeImportTaskService {
  private readonly api = inject(TradeApiService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private request?: Subscription;
  private owner: string | null = null;
  private marker: ImportMarker | null = null;

  readonly selectedFile = signal<File | null>(null);
  readonly selectedFileName = signal<string | null>(null);
  readonly previewResponse = signal<TradeImportPreviewResponse | null>(null);
  readonly confirmResponse = signal<TradeImportConfirmResponse | null>(null);
  readonly state = signal<TaskState>('idle');
  readonly stage = signal<Stage>('preview');
  readonly progress = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly startedAt = signal<string | null>(null);
  readonly busy = computed(() => this.state() === 'uploading' || this.state() === 'processing');
  readonly isPreviewing = computed(() => this.busy() && this.stage() === 'preview');
  readonly isConfirming = computed(() => this.busy() && this.stage() === 'confirm');
  readonly visible = computed(() => this.state() !== 'idle');
  readonly canConfirm = computed(
    () =>
      this.state() === 'ready' &&
      !!this.selectedFile() &&
      !!this.previewResponse()?.trades.length &&
      !this.previewResponse()?.errors.length,
  );
  readonly successMessage = computed(() =>
    this.state() === 'ready'
      ? this.i18n.t('trade.import.previewSuccess')
      : this.state() === 'complete'
        ? this.i18n.t('trade.import.confirmSuccess')
        : null,
  );
  readonly statusKey = computed(() =>
    this.state() === 'processing'
      ? `importTask.${this.stage() === 'preview' ? 'analysing' : 'importing'}`
      : `importTask.${this.state()}`,
  );
  readonly recoveryMessage = computed(() =>
    this.state() === 'unknown'
      ? this.i18n.t('importTask.unknownHelp')
      : this.state() === 'interrupted'
        ? this.i18n.t('importTask.interruptedHelp')
        : null,
  );

  constructor() {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (this.busy()) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    if (this.browser) window.addEventListener('beforeunload', beforeUnload);
    inject(DestroyRef).onDestroy(() => {
      this.request?.unsubscribe();
      if (this.browser) window.removeEventListener('beforeunload', beforeUnload);
    });
    effect(() => {
      const authenticated = this.auth.isAuthenticated();
      const user = this.auth.currentUser();
      if (!authenticated) this.changeOwner(null);
      else if (user) this.changeOwner(user.userId);
    });
  }

  selectFile(file: File | null): void {
    if (this.busy() || this.state() === 'unknown') return;
    const user = this.auth.currentUser();
    if (user) this.changeOwner(user.userId);
    this.reset();
    this.selectedFile.set(file);
    this.selectedFileName.set(file?.name ?? null);
  }

  preview(): void {
    if (this.busy() || this.state() === 'unknown' || this.state() === 'complete') return;
    this.start('preview');
  }

  confirm(): void {
    if (this.canConfirm()) this.start('confirm');
  }

  reset(): void {
    if (this.busy()) return;
    this.clearMarker();
    this.clearMemory();
  }

  private start(stage: Stage): void {
    const user = this.auth.currentUser();
    if (!user) {
      this.errorMessage.set(this.i18n.t('importTask.sessionRequired'));
      return;
    }
    this.changeOwner(user.userId);
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set(this.i18n.t('trade.import.previewRequired'));
      return;
    }
    this.stage.set(stage);
    this.state.set('uploading');
    this.progress.set(null);
    this.errorMessage.set(null);
    if (stage === 'preview') this.previewResponse.set(null);
    this.confirmResponse.set(null);
    this.marker = {
      filename: file.name,
      size: file.size,
      startedAt: new Date().toISOString(),
      stage,
      id: crypto.randomUUID(),
    };
    this.startedAt.set(this.marker.startedAt);
    this.persistMarker();
    const taskId = this.marker.id;
    this.request = this.api
      .uploadImport<TradeImportPreviewResponse | TradeImportConfirmResponse>(stage, file)
      .subscribe({
        next: (event) => {
          if (this.marker?.id !== taskId) return;
          if (event.type === HttpEventType.UploadProgress) {
            this.progress.set(
              event.total ? Math.min(100, Math.round((event.loaded / event.total) * 100)) : null,
            );
            if (event.total && event.loaded >= event.total) this.state.set('processing');
          }
          if (event instanceof HttpResponse && event.body) {
            if (stage === 'preview') {
              const response = event.body as TradeImportPreviewResponse;
              this.previewResponse.set(response);
              const valid = response.errors.length === 0 && response.trades.length > 0;
              this.state.set(valid ? 'ready' : 'error');
              if (!valid)
                this.errorMessage.set(
                  response.errors.join(' · ') || this.i18n.t('importTask.noRows'),
                );
            } else {
              this.confirmResponse.set(event.body as TradeImportConfirmResponse);
              this.state.set('complete');
            }
            this.clearMarker();
          }
        },
        error: (error: HttpErrorResponse) => {
          if (this.marker?.id !== taskId) return;
          // A missing response or server/proxy error does not prove that a commit failed.
          if (
            stage === 'confirm' &&
            (error.status === 0 || error.status >= 500 || error.status === 408)
          ) {
            this.state.set('unknown');
          } else {
            this.state.set('error');
            const message = error.error?.message;
            this.errorMessage.set(
              Array.isArray(message)
                ? message.join(', ')
                : typeof message === 'string'
                  ? message
                  : this.i18n.t('trade.import.requestError'),
            );
            this.clearMarker();
          }
        },
      });
  }

  private changeOwner(owner: string | null): void {
    if (this.owner === owner) return;
    this.request?.unsubscribe();
    // Preserve an in-flight marker: cancelling the client cannot cancel the server.
    this.clearMemory();
    this.owner = owner;
    if (!owner || !this.browser) return;
    try {
      const value = JSON.parse(
        localStorage.getItem(this.storageKey()) ?? 'null',
      ) as ImportMarker | null;
      if (
        !value ||
        typeof value.filename !== 'string' ||
        !['preview', 'confirm'].includes(value.stage) ||
        typeof value.startedAt !== 'string' ||
        typeof value.id !== 'string'
      )
        return;
      this.marker = value;
      this.stage.set(value.stage);
      this.selectedFileName.set(value.filename);
      this.startedAt.set(value.startedAt);
      this.state.set(value.stage === 'confirm' ? 'unknown' : 'interrupted');
    } catch {
      /* Storage may be unavailable; live imports remain usable. */
    }
  }

  private clearMemory(): void {
    this.marker = null;
    this.selectedFile.set(null);
    this.selectedFileName.set(null);
    this.previewResponse.set(null);
    this.confirmResponse.set(null);
    this.state.set('idle');
    this.progress.set(null);
    this.errorMessage.set(null);
    this.startedAt.set(null);
  }

  private storageKey(): string {
    return `trade-journal.import-task.${this.owner}`;
  }
  private persistMarker(): void {
    if (!this.browser || !this.owner) return;
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(this.marker));
    } catch {
      /* Best effort. */
    }
  }
  private clearMarker(): void {
    if (this.browser && this.owner && this.marker) {
      try {
        const stored = JSON.parse(
          localStorage.getItem(this.storageKey()) ?? 'null',
        ) as ImportMarker | null;
        if (stored?.id === this.marker.id) localStorage.removeItem(this.storageKey());
      } catch {
        /* Best effort. */
      }
    }
    this.marker = null;
  }
}
