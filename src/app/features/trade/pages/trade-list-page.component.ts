import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { I18nService } from '../../../core/services/i18n.service';
import { TradeService } from '../data-access/trade.service';
import { Trade } from '../types/trade.models';
import {
  buildSideDistribution,
  buildSymbolDistribution,
  buildTradesOverTime,
  computeTradeAnalytics,
  filterTradesByRange,
  TradeBarDatum,
  TradeRangeKey
} from '../utils/trade-analytics.util';

@Component({
  selector: 'app-trade-list-page',
  imports: [DatePipe, NgClass, RouterLink],
  providers: [DecimalPipe],
  template: `
    <section class="space-y-6">
      <div class="rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-sm">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">{{ i18n.t('trade.dashboard.title') }}</p>
            <h2 class="mt-2 text-3xl font-semibold text-slate-950">{{ i18n.t('trade.dashboard.subtitle') }}</h2>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {{ i18n.t('trade.dashboard.description') }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2 rounded-full bg-slate-100 p-1 text-sm font-medium text-slate-600">
            @for (range of ranges; track range) {
              <button
                type="button"
                class="rounded-full px-4 py-2 transition"
                [ngClass]="selectedRange() === range ? 'bg-white text-slate-950 shadow-sm' : 'hover:text-slate-900'"
                (click)="onRangeChange(range)">
                {{ i18n.t('trade.range.' + range) }}
              </button>
            }
          </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{{ i18n.t('trade.dashboard.cards.totalTrades') }}</p>
            <p class="mt-3 text-3xl font-semibold text-slate-950">{{ analytics().totalTrades }}</p>
          </article>

          <article class="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{{ i18n.t('trade.dashboard.cards.openTrades') }}</p>
            <p class="mt-3 text-3xl font-semibold text-emerald-900">{{ analytics().openTrades }}</p>
          </article>

          <article class="rounded-3xl border border-blue-200 bg-blue-50 p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{{ i18n.t('trade.dashboard.cards.closedTrades') }}</p>
            <p class="mt-3 text-3xl font-semibold text-blue-900">{{ analytics().closedTrades }}</p>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{{ i18n.t('trade.dashboard.cards.mostTraded') }}</p>
            <p class="mt-3 text-3xl font-semibold text-slate-950">{{ analytics().mostTradedSymbol }}</p>
          </article>

          <article class="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{{ i18n.t('trade.dashboard.cards.estimatedPnl') }}</p>
            <p
              class="mt-3 text-3xl font-semibold"
              [ngClass]="(analytics().estimatedPnl ?? 0) >= 0 ? 'text-emerald-900' : 'text-rose-900'">
              {{ formatPnl(analytics().estimatedPnl) }}
            </p>
            <p class="mt-2 text-xs text-amber-800">
              {{ i18n.t('trade.dashboard.cards.pnlNote', { count: analytics().pnlTradeCount }) }}
            </p>
          </article>
        </div>

        <div class="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr_1fr]">
          <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-lg font-semibold text-slate-950">{{ i18n.t('trade.dashboard.charts.tradesOverTime') }}</h3>
            <p class="text-sm text-slate-500">{{ i18n.t('trade.dashboard.charts.tradesOverTimeDescription') }}</p>

            <div class="mt-6 flex min-h-48 items-end gap-3">
              @for (point of tradesOverTime(); track point.label) {
                <div class="flex flex-1 flex-col items-center gap-2">
                  <div class="flex h-40 w-full items-end">
                    <div
                      class="w-full rounded-t-2xl bg-gradient-to-t from-blue-700 to-sky-400"
                      [style.height.%]="getBarHeight(point.value, tradesOverTime())"></div>
                  </div>
                  <span class="text-xs font-medium text-slate-500">{{ point.label }}</span>
                  <span class="text-xs font-semibold text-slate-700">{{ point.value }}</span>
                </div>
              }
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-lg font-semibold text-slate-950">{{ i18n.t('trade.dashboard.charts.symbolDistribution') }}</h3>
            <p class="text-sm text-slate-500">{{ i18n.t('trade.dashboard.charts.symbolDistributionDescription') }}</p>

            <div class="mt-5 space-y-4">
              @for (item of symbolDistribution(); track item.label) {
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium text-slate-700">{{ item.label }}</span>
                    <span class="text-slate-500">{{ item.value }}</span>
                  </div>
                  <div class="h-3 rounded-full bg-slate-200">
                    <div
                      class="h-3 rounded-full bg-slate-950"
                      [style.width.%]="getBarHeight(item.value, symbolDistribution())"></div>
                  </div>
                </div>
              } @empty {
                <p class="text-sm text-slate-500">{{ i18n.t('trade.dashboard.charts.noSymbolData') }}</p>
              }
            </div>
          </article>

          <article class="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h3 class="text-lg font-semibold text-slate-950">{{ i18n.t('trade.dashboard.charts.sideDistribution') }}</h3>
            <p class="text-sm text-slate-500">{{ i18n.t('trade.dashboard.charts.sideDistributionDescription') }}</p>

            <div class="mt-5 space-y-4">
              @for (item of sideDistribution(); track item.label) {
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-sm">
                    <span class="font-medium text-slate-700">{{ formatSideLabel(item.label) }}</span>
                    <span class="text-slate-500">{{ item.value }}</span>
                  </div>
                  <div class="h-3 rounded-full bg-slate-200">
                    <div
                      class="h-3 rounded-full"
                      [ngClass]="item.label === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'"
                      [style.width.%]="getBarHeight(item.value, sideDistribution())"></div>
                  </div>
                </div>
              } @empty {
                <p class="text-sm text-slate-500">{{ i18n.t('trade.dashboard.charts.noSideData') }}</p>
              }
            </div>
          </article>
        </div>
      </div>

      <div class="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">{{ i18n.t('trade.nav.trades') }}</p>
          <h3 class="mt-2 text-2xl font-semibold text-slate-950">{{ i18n.t('trade.list.title') }}</h3>
          <p class="mt-2 text-sm text-slate-500">{{ i18n.t('trade.list.description') }}</p>
        </div>

        <a
          routerLink="/app/trades/new"
          class="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800">
          {{ i18n.t('trade.list.createTrade') }}
        </a>
      </div>

      @if (errorMessage()) {
        <div class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ errorMessage() }}
        </div>
      }

      @if (isLoading()) {
        <div class="rounded-3xl border border-slate-200 bg-white/70 p-8 text-sm text-slate-500">
          {{ i18n.t('trade.list.loading') }}
        </div>
      } @else if (filteredTrades().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <h3 class="text-lg font-semibold text-slate-900">{{ i18n.t('trade.list.emptyTitle') }}</h3>
          <p class="mt-2 text-sm text-slate-500">{{ i18n.t('trade.list.emptyDescription') }}</p>
        </div>
      } @else {
        <div class="space-y-4">
          <div class="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white/75 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-slate-500">
              Showing
              <span class="font-semibold text-slate-900">{{ startRow() }}</span>
              -
              <span class="font-semibold text-slate-900">{{ endRow() }}</span>
              of
              <span class="font-semibold text-slate-900">{{ totalFilteredTrades() }}</span>
            </p>

            <div class="flex flex-wrap items-center gap-3">
              <label class="text-sm text-slate-500">Rows per page</label>
              <select
                class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
                [value]="pageSize()"
                (change)="onPageSizeChange($event)">
                <option [value]="5">5</option>
                <option [value]="10">10</option>
                <option [value]="20">20</option>
                <option [value]="50">50</option>
              </select>
            </div>
          </div>

          @for (trade of paginatedTrades(); track trade.tradeId) {
            <article class="rounded-3xl border border-slate-200 bg-white/75 p-5 shadow-sm">
              <div class="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div class="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ i18n.t('trade.list.fields.tradeNo') }}</p>
                    <p class="mt-2 text-lg font-semibold text-slate-950">#{{ trade.tradeNo }}</p>
                  </div>

                  <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ i18n.t('trade.list.fields.symbol') }}</p>
                    <p class="mt-2 text-lg font-semibold text-slate-950">{{ trade.symbol }}</p>
                    <p class="text-sm text-slate-500">{{ formatMarketTypeLabel(trade.marketType) }}</p>
                  </div>

                  <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ i18n.t('trade.list.fields.sideStatus') }}</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        [ngClass]="trade.side === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                        {{ formatSideLabel(trade.side) }}
                      </span>
                      <span
                        class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        [ngClass]="trade.status === 'OPEN' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-700'">
                        {{ formatStatusLabel(trade.status) }}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ i18n.t('trade.list.fields.entryQuantity') }}</p>
                    <p class="mt-2 text-base font-semibold text-slate-950">{{ formatNumber(trade.entryPrice) }}</p>
                    <p class="text-sm text-slate-500">{{ i18n.t('trade.list.fields.qty') }} {{ formatNumber(trade.quantity) }}</p>
                  </div>

                  <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ i18n.t('trade.list.fields.openTime') }}</p>
                    <p class="mt-2 text-base font-semibold text-slate-950">{{ trade.openTime | date: 'medium' }}</p>
                  </div>
                </div>

                <div class="flex gap-2 xl:ml-6">
                  <a
                    [routerLink]="['/app/trades', trade.tradeId, 'edit']"
                    class="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    {{ i18n.t('common.actions.edit') }}
                  </a>
                  <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-2xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    [disabled]="deletingTradeId() === trade.tradeId"
                    (click)="deleteTrade(trade)">
                    {{ deletingTradeId() === trade.tradeId ? i18n.t('trade.list.deleteSubmitting') : i18n.t('common.actions.delete') }}
                  </button>
                </div>
              </div>

              <div class="mt-5 grid gap-4 md:grid-cols-3">
                <div class="rounded-2xl bg-slate-50 p-4">
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ i18n.t('trade.list.fields.riskLevels') }}</p>
                  <p class="mt-2 text-sm text-slate-700">SL {{ formatNumber(trade.stopLoss) }}</p>
                  <p class="mt-1 text-sm text-slate-700">TP {{ formatNumber(trade.takeProfit) }}</p>
                </div>

                <div class="rounded-2xl bg-slate-50 p-4">
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ i18n.t('trade.list.fields.exit') }}</p>
                  <p class="mt-2 text-sm text-slate-700">
                    {{ trade.exitPrice ? formatNumber(trade.exitPrice) : i18n.t('trade.list.fields.stillOpen') }}
                  </p>
                </div>

                <div class="rounded-2xl bg-slate-50 p-4">
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ i18n.t('trade.list.fields.lastUpdated') }}</p>
                  <p class="mt-2 text-sm text-slate-700">{{ trade.updatedAt | date: 'medium' }}</p>
                </div>
              </div>

              @if (trade.thesis || trade.note) {
                <div class="mt-4 grid gap-4 md:grid-cols-2">
                  @if (trade.thesis) {
                    <div class="rounded-2xl border border-slate-200 bg-white p-4">
                      <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ i18n.t('trade.list.fields.thesis') }}</p>
                      <p class="mt-2 text-sm leading-6 text-slate-700">{{ trade.thesis }}</p>
                    </div>
                  }

                  @if (trade.note) {
                    <div class="rounded-2xl border border-slate-200 bg-white p-4">
                      <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ i18n.t('trade.list.fields.note') }}</p>
                      <p class="mt-2 text-sm leading-6 text-slate-700">{{ trade.note }}</p>
                    </div>
                  }
                </div>
              }
            </article>
          }

          <div class="flex flex-col gap-3 rounded-[2rem] border border-slate-200 bg-white/75 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <p class="text-sm text-slate-500">
              Page
              <span class="font-semibold text-slate-900">{{ currentPage() }}</span>
              /
              <span class="font-semibold text-slate-900">{{ totalPages() }}</span>
            </p>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                [disabled]="currentPage() === 1"
                (click)="goToPreviousPage()">
                Previous
              </button>

              <button
                type="button"
                class="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                [disabled]="currentPage() === totalPages()"
                (click)="goToNextPage()">
                Next
              </button>
            </div>
          </div>
        </div>
      }
    </section>
  `
})
export class TradeListPageComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly ranges: TradeRangeKey[] = ['1D', '7D', '30D'];
  protected readonly selectedRange = signal<TradeRangeKey>('7D');

  private readonly tradeService = inject(TradeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly decimalPipe = inject(DecimalPipe);

  protected readonly trades = signal<Trade[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly deletingTradeId = signal<string | null>(null);

  protected readonly pageSize = signal(10);
  protected readonly currentPage = signal(1);

  protected readonly filteredTrades = computed(() =>
    filterTradesByRange(this.trades(), this.selectedRange())
  );

  protected readonly totalFilteredTrades = computed(() => this.filteredTrades().length);

  protected readonly totalPages = computed(() => {
    const total = this.totalFilteredTrades();
    const size = this.pageSize();
    return total > 0 ? Math.ceil(total / size) : 1;
  });

  protected readonly paginatedTrades = computed(() => {
    const trades = this.filteredTrades();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    const end = start + size;

    return trades.slice(start, end);
  });

  protected readonly analytics = computed(() => computeTradeAnalytics(this.filteredTrades()));
  protected readonly tradesOverTime = computed(() =>
    buildTradesOverTime(this.filteredTrades(), this.selectedRange())
  );
  protected readonly symbolDistribution = computed(() => buildSymbolDistribution(this.filteredTrades()));
  protected readonly sideDistribution = computed(() => buildSideDistribution(this.filteredTrades()));

  constructor() {
    this.loadTrades();
  }

  protected onRangeChange(range: TradeRangeKey): void {
    this.selectedRange.set(range);
    this.currentPage.set(1);
  }

  protected onPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!Number.isNaN(value) && value > 0) {
      this.pageSize.set(value);
      this.currentPage.set(1);
    }
  }

  protected goToPreviousPage(): void {
    const current = this.currentPage();
    if (current > 1) {
      this.currentPage.set(current - 1);
    }
  }

  protected goToNextPage(): void {
    const current = this.currentPage();
    const total = this.totalPages();
    if (current < total) {
      this.currentPage.set(current + 1);
    }
  }

  protected startRow(): number {
    const total = this.totalFilteredTrades();
    if (total === 0) {
      return 0;
    }

    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  protected endRow(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalFilteredTrades());
  }

  protected deleteTrade(trade: Trade): void {
    const confirmed = window.confirm(
      this.i18n.t('trade.list.deleteConfirm', {
        tradeNo: trade.tradeNo,
        symbol: trade.symbol
      })
    );

    if (!confirmed) {
      return;
    }

    this.deletingTradeId.set(trade.tradeId);

    this.tradeService
      .deleteTrade(trade.tradeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.trades.update((trades) => trades.filter((item) => item.tradeId !== trade.tradeId));

          const totalAfterDelete = this.filteredTrades().length - 1;
          const maxPageAfterDelete = totalAfterDelete > 0
            ? Math.ceil(totalAfterDelete / this.pageSize())
            : 1;

          if (this.currentPage() > maxPageAfterDelete) {
            this.currentPage.set(maxPageAfterDelete);
          }

          this.deletingTradeId.set(null);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message ?? this.i18n.t('trade.list.deleteError'));
          this.deletingTradeId.set(null);
        }
      });
  }

  protected getBarHeight(value: number, data: TradeBarDatum[]): number {
    const maxValue = Math.max(...data.map((item) => item.value), 0);

    if (maxValue === 0) {
      return 0;
    }

    return (value / maxValue) * 100;
  }

  protected formatNumber(value: string | null): string {
    if (!value) {
      return this.i18n.t('common.states.notAvailable');
    }

    const parsedValue = Number(value);
    if (Number.isNaN(parsedValue)) {
      return value;
    }

    return this.decimalPipe.transform(parsedValue, '1.0-8') ?? value;
  }

  protected formatPnl(value: number | null): string {
    if (value === null) {
      return this.i18n.t('common.states.notAvailable');
    }

    return this.decimalPipe.transform(value, '1.2-2') ?? String(value);
  }

  protected formatMarketTypeLabel(marketType: string): string {
    const key = 'trade.form.marketType.' + marketType.toLowerCase();
    const translated = this.i18n.t(key);
    return translated === key ? marketType : translated;
  }

  protected formatSideLabel(side: string): string {
    const key = 'trade.list.side.' + side.toLowerCase();
    const translated = this.i18n.t(key);
    return translated === key ? side : translated;
  }

  protected formatStatusLabel(status: string): string {
    const key = 'trade.list.status.' + status.toLowerCase();
    const translated = this.i18n.t(key);
    return translated === key ? status : translated;
  }

  private loadTrades(): void {
    this.tradeService
      .listTrades()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (trades) => {
          this.trades.set(trades);
          this.currentPage.set(1);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message ?? this.i18n.t('trade.list.loadError'));
          this.isLoading.set(false);
        }
      });
  }
}
