import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { I18nService } from '../../../../core/services/i18n.service';
import { TradeService } from '../../data-access/trade.service';
import { JournalTrade } from '../../types/trade.models';
import { journalDate, journalDayRange, moveJournalDate } from '../../utils/trade-journal.util';

@Component({
  selector: 'app-trade-overview-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './trade-overview-page.component.html',
  styleUrl: './trade-overview-page.component.css',
})
export class TradeOverviewPageComponent implements OnInit {
  protected readonly i18n = inject(I18nService);
  private readonly tradeService = inject(TradeService);
  private readonly destroyRef = inject(DestroyRef);
  private listRequest?: Subscription;
  private readonly editorElement = viewChild<ElementRef<HTMLElement>>('editorPanel');

  protected readonly day = signal(journalDate());
  protected readonly notesFilter = signal<'all' | 'missing'>('all');
  protected readonly trades = signal<JournalTrade[]>([]);
  protected readonly selected = signal<JournalTrade | null>(null);
  protected readonly thesis = signal('');
  protected readonly note = signal('');
  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly saveError = signal<string | null>(null);
  protected readonly statusMessage = signal<string | null>(null);
  protected readonly summary = signal({ total: 0, withoutNote: 0 });
  protected readonly meta = signal({ page: 1, limit: 5, total: 0, totalPages: 0 });
  protected readonly timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  protected readonly dirty = computed(() => {
    const trade = this.selected();
    return (
      !!trade && (this.thesis() !== (trade.thesis ?? '') || this.note() !== (trade.note ?? ''))
    );
  });
  protected readonly locale = computed(() =>
    this.i18n.currentLanguage() === 'vi' ? 'vi-VN' : 'en-US',
  );

  ngOnInit(): void {
    this.loadTrades(1);
  }

  @HostListener('window:beforeunload', ['$event'])
  protected beforeUnload(event: BeforeUnloadEvent): void {
    if (this.dirty() || this.isSaving()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  canLeave(): boolean {
    return !this.isSaving() && (!this.dirty() || window.confirm(this.i18n.t('journal.discard')));
  }

  protected today(): string {
    return journalDate();
  }

  protected changeDay(value: string): void {
    if (!journalDayRange(value) || value > this.today() || value === this.day() || !this.canLeave())
      return;
    this.day.set(value);
    this.loadTrades(1);
  }

  protected shiftDay(days: number): void {
    this.changeDay(moveJournalDate(this.day(), days));
  }

  protected changeFilter(value: 'all' | 'missing'): void {
    if (value === this.notesFilter() || !this.canLeave()) return;
    this.notesFilter.set(value);
    this.loadTrades(1);
  }

  protected changePage(page: number): void {
    if (page < 1 || page > this.meta().totalPages || this.isLoading() || !this.canLeave()) return;
    this.loadTrades(page);
  }

  protected selectTrade(trade: JournalTrade): void {
    if (this.isLoading() || this.isSaving()) return;
    if (this.selected()?.tradeId !== trade.tradeId) {
      if (!this.canLeave()) return;
      this.setSelected(trade);
      this.statusMessage.set(null);
    }
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 700px)').matches
    ) {
      this.editorElement()?.nativeElement.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  }

  protected retry(): void {
    if (!this.isLoading() && this.canLeave()) this.loadTrades(this.meta().page);
  }

  protected hasNote(trade: JournalTrade): boolean {
    return !!trade.note?.trim();
  }

  protected formatNumber(value: string | null): string {
    if (value === null || value === '' || !Number.isFinite(Number(value))) return '—';
    return new Intl.NumberFormat(this.locale(), { maximumFractionDigits: 8 }).format(Number(value));
  }

  protected duration(trade: JournalTrade): string {
    if (!trade.closeTime) return '—';
    const milliseconds = Date.parse(trade.closeTime) - Date.parse(trade.openTime);
    if (!Number.isFinite(milliseconds) || milliseconds < 0) return '—';
    const minutes = Math.floor(milliseconds / 60000);
    if (minutes < 1) return this.i18n.t('journal.lessMinute');
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const remaining = minutes % 60;
    return [
      days ? `${days}${this.i18n.t('journal.dayUnit')}` : '',
      hours ? `${hours}${this.i18n.t('journal.hourUnit')}` : '',
      remaining ? `${remaining}${this.i18n.t('journal.minuteUnit')}` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected addPrompt(kind: 'good' | 'improve'): void {
    if (this.isSaving()) return;
    const prompt = this.i18n.t(`journal.${kind}`) + ': ';
    this.note.update((value) => value + (value.trim() ? '\n\n' : '') + prompt);
    this.statusMessage.set(null);
  }

  protected save(advance = false): void {
    const trade = this.selected();
    if (!trade || this.isSaving() || this.isLoading()) return;
    if (!this.dirty()) {
      if (advance) this.nextTrade();
      return;
    }
    this.isSaving.set(true);
    this.saveError.set(null);
    this.statusMessage.set(null);
    const index = this.trades().findIndex((item) => item.tradeId === trade.tradeId);
    const nextId = this.trades()[index + 1]?.tradeId;
    this.tradeService
      .updateTradeJournal(trade.tradeId, { thesis: this.thesis(), note: this.note() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          const updated = { ...trade, ...result };
          this.isSaving.set(false);
          this.summary.update((summary) => ({
            ...summary,
            withoutNote: Math.max(
              0,
              summary.withoutNote + Number(!this.hasNote(updated)) - Number(!this.hasNote(trade)),
            ),
          }));
          this.trades.update((trades) =>
            trades.map((item) => (item.tradeId === updated.tradeId ? updated : item)),
          );
          this.setSelected(updated);
          this.statusMessage.set(this.i18n.t('journal.saved'));
          if (this.notesFilter() === 'missing' && this.hasNote(updated)) {
            // Refill/clamp the filtered page on the server after the row leaves this list.
            this.loadTrades(this.meta().page, nextId, true, index);
          } else if (advance) this.nextTrade();
        },
        error: () => {
          this.isSaving.set(false);
          this.saveError.set(this.i18n.t('journal.saveError'));
        },
      });
  }

  private nextTrade(): void {
    const index = this.trades().findIndex((trade) => trade.tradeId === this.selected()?.tradeId);
    const next = this.trades()[index + 1];
    if (next) this.setSelected(next);
    else if (this.meta().page < this.meta().totalPages)
      this.loadTrades(this.meta().page + 1, undefined, true);
    else this.statusMessage.set(this.i18n.t('journal.lastTrade'));
  }

  private setSelected(trade: JournalTrade | null): void {
    this.selected.set(trade);
    this.thesis.set(trade?.thesis ?? '');
    this.note.set(trade?.note ?? '');
    this.saveError.set(null);
  }

  private loadTrades(
    page: number,
    preferredId?: string,
    keepStatus = false,
    preferredIndex = 0,
  ): void {
    const range = journalDayRange(this.day());
    if (!range) return;
    this.listRequest?.unsubscribe();
    this.isLoading.set(true);
    this.errorMessage.set(null);
    if (!keepStatus) this.statusMessage.set(null);
    this.setSelected(null);
    this.trades.set([]);
    this.listRequest = this.tradeService
      .getTradeJournal({ ...range, page, limit: 5, notes: this.notesFilter() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.trades.set(response.data);
          this.meta.set(response.meta);
          this.summary.set(response.summary);
          this.setSelected(
            response.data.find((trade) => trade.tradeId === preferredId) ??
              response.data[Math.min(preferredIndex, response.data.length - 1)] ??
              null,
          );
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set(this.i18n.t('journal.loadError'));
          this.summary.set({ total: 0, withoutNote: 0 });
          this.meta.set({ page: 1, limit: 5, total: 0, totalPages: 0 });
          this.isLoading.set(false);
        },
      });
  }
}
