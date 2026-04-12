import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { I18nService } from '../../../../core/services/i18n.service';
import { TradeService } from '../../data-access/trade.service';
import { Trade } from '../../types/trade.models';
import {
  buildSideDistribution,
  buildSymbolDistribution,
  buildTradesOverTime,
  computeTradeAnalytics,
  filterTradesByRange,
  TradeBarDatum,
  TradeRangeKey
} from '../../utils/trade-analytics.util';

@Component({
  selector: 'app-trade-list-page',
  imports: [DatePipe, NgClass, RouterLink],
  providers: [DecimalPipe],
  templateUrl: './trade-list-page.component.html'
})

export class TradeListPageComponent implements OnInit {
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

  ngOnInit() {
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
