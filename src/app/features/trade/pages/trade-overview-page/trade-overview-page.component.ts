import { NgClass } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  selector: 'app-trade-overview-page',
  standalone: true,
  imports: [NgClass],
  templateUrl: './trade-overview-page.component.html'
})
export class TradeOverviewPageComponent implements OnInit {
  protected readonly i18n = inject(I18nService);
  protected readonly ranges: TradeRangeKey[] = ['1D', '7D', '30D'];
  protected readonly selectedRange = signal<TradeRangeKey>('7D');

  private readonly tradeService = inject(TradeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly trades = signal<Trade[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly filteredTrades = computed(() =>
    filterTradesByRange(this.trades(), this.selectedRange())
  );

  protected readonly analytics = computed(() => computeTradeAnalytics(this.filteredTrades()));
  protected readonly tradesOverTime = computed(() =>
    buildTradesOverTime(this.filteredTrades(), this.selectedRange())
  );
  protected readonly symbolDistribution = computed(() => buildSymbolDistribution(this.filteredTrades()));
  protected readonly sideDistribution = computed(() => buildSideDistribution(this.filteredTrades()));

  ngOnInit(): void {
    this.loadTrades();
  }

  protected onRangeChange(range: TradeRangeKey): void {
    this.selectedRange.set(range);
  }

  protected getBarHeight(value: number, data: TradeBarDatum[]): number {
    const maxValue = Math.max(...data.map((item) => item.value), 0);
    if (maxValue === 0) {
      return 0;
    }
    return (value / maxValue) * 100;
  }

  protected formatSideLabel(side: string): string {
    const key = 'trade.list.side.' + side.toLowerCase();
    const translated = this.i18n.t(key);
    return translated === key ? side : translated;
  }

  private loadTrades(): void {
    this.tradeService
      .listTrades()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (trades) => {
          this.trades.set(trades);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message ?? this.i18n.t('trade.list.loadError'));
          this.isLoading.set(false);
        }
      });
  }
}