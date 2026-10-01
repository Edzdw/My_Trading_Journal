import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { I18nService } from '../../../../core/services/i18n.service';
import { TradeService } from '../../data-access/trade.service';
import { Trade } from '../../types/trade.models';

import { computeTradeAnalytics } from '../../utils/trade-analytics.util';

type TradeRangeKey = '1D' | '7D' | '30D' | 'ALL';

type TradeSortBy = 'openTime' | 'closeTime' | 'symbol' | 'profit' | 'entryPrice' | 'exitPrice';

type TradeSortOrder = 'asc' | 'desc';

type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

type TradeSide = 'BUY' | 'SELL';

type DropdownKey =
  | 'symbol'
  | 'source'
  | 'status'
  | 'side'
  | 'sortBy'
  | 'sortOrder'
  | 'pageSize'
  | null;

@Component({
  selector: 'app-trade-list-page',

  imports: [DatePipe, RouterLink],

  templateUrl: './trade-list-page.component.html',

  styleUrl: './trade-list-page.component.css',
})
export class TradeListPageComponent implements OnInit {
  protected readonly i18n = inject(I18nService);

  private readonly tradeService = inject(TradeService);

  private readonly destroyRef = inject(DestroyRef);


  // =========================================================
  // LIST DATA
  // =========================================================

  protected readonly trades = signal<Trade[]>([]);

  protected readonly meta = signal({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  protected readonly isLoading = signal(true);

  protected readonly isLoadingOptions = signal(true);

  protected readonly errorMessage = signal<string | null>(null);

  protected readonly deletingTradeId = signal<string | null>(null);

  // =========================================================
  // FILTER OPTIONS
  // =========================================================

  protected readonly symbols = signal<string[]>([]);

  protected readonly sources = signal<string[]>([]);

  protected readonly showAdvancedFilters = signal(true);

  protected readonly openDropdown = signal<DropdownKey>(null);

  // =========================================================
  // PAGINATION
  // =========================================================

  protected readonly pageSize = signal(10);

  protected readonly currentPage = signal(1);

  protected readonly totalFilteredTrades = computed(() => this.meta().total);

  protected readonly totalPages = computed(() => Math.max(this.meta().totalPages, 1));

  protected readonly paginatedTrades = computed(() => this.trades());

  // =========================================================
  // QUICK DATE RANGE
  // =========================================================

  protected readonly ranges: TradeRangeKey[] = ['1D', '7D', '30D', 'ALL'];

  protected readonly selectedRange = signal<TradeRangeKey | null>('7D');

  protected readonly from = signal('');

  protected readonly to = signal('');

  // =========================================================
  // FILTERS
  // =========================================================

  protected readonly search = signal('');

  protected readonly status = signal<TradeStatus | ''>('');

  protected readonly side = signal<TradeSide | ''>('');

  protected readonly symbol = signal('');

  protected readonly source = signal('');

  // =========================================================
  // SORT
  // =========================================================

  protected readonly sortBy = signal<TradeSortBy>('openTime');

  protected readonly sortOrder = signal<TradeSortOrder>('desc');

  // =========================================================
  // SUMMARY
  // =========================================================

  protected readonly analytics = computed(() => computeTradeAnalytics(this.trades()));

  // =========================================================
  // LIFECYCLE
  // =========================================================

  ngOnInit(): void {
    this.applyRange('7D', false);

    this.loadTradeOptions();

    this.loadTrades(1);
  }

  // =========================================================
  // CLOSE DROPDOWNS
  // =========================================================

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (target.closest('.custom-select')) {
      return;
    }

    this.openDropdown.set(null);
  }

  protected toggleDropdown(dropdown: Exclude<DropdownKey, null>, event?: MouseEvent): void {
    event?.stopPropagation();

    this.openDropdown.update((current) => (current === dropdown ? null : dropdown));
  }

  protected closeDropdown(): void {
    this.openDropdown.set(null);
  }

  // =========================================================
  // OPTIONS
  // =========================================================

  private loadTradeOptions(): void {
    this.isLoadingOptions.set(true);

    this.tradeService
      .getTradeOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.symbols.set(response.symbols);

          this.sources.set(response.sources);

          this.isLoadingOptions.set(false);
        },

        error: (error) => {
          console.error('Load trade options failed:', error);

          this.symbols.set([]);
          this.sources.set([]);

          this.isLoadingOptions.set(false);
        },
      });
  }

  // =========================================================
  // RANGE
  // =========================================================

  protected onRangeChange(range: TradeRangeKey): void {
    this.applyRange(range, true);
  }

  private applyRange(range: TradeRangeKey, reload: boolean): void {
    this.selectedRange.set(range);

    if (range === 'ALL') {
      this.from.set('');
      this.to.set('');

      if (reload) {
        this.applyFilters();
      }

      return;
    }

    const today = new Date();
    const fromDate = new Date(today);

    switch (range) {
      case '1D':
        fromDate.setDate(today.getDate());
        break;

      case '7D':
        fromDate.setDate(today.getDate() - 6);
        break;

      case '30D':
        fromDate.setDate(today.getDate() - 29);
        break;
    }

    this.from.set(this.formatDateForInput(fromDate));
    this.to.set(this.formatDateForInput(today));

    if (reload) {
      this.applyFilters();
    }
  }

  // =========================================================
  // SEARCH
  // =========================================================

  protected onSearchInput(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  // =========================================================
  // SYMBOL
  // =========================================================
  protected readonly symbolSearch = signal('');

  protected selectSymbol(value: string): void {
    this.symbol.set(value);
    this.symbolSearch.set('');
    this.closeDropdown();
    this.applyFilters();
  }

  protected symbolLabel(): string {
    if (this.isLoadingOptions()) {
      return 'Loading...';
    }

    return this.symbol() || 'All symbols';
  }

  protected readonly filteredSymbols = computed(() => {
    const keyword = this.symbolSearch().trim().toLowerCase();

    if (!keyword) {
      return this.symbols();
    }

    return this.symbols().filter((symbol) => symbol.toLowerCase().includes(keyword));
  });

  protected onSymbolSearch(event: Event): void {
    this.symbolSearch.set((event.target as HTMLInputElement).value);
  }
  // =========================================================
  // SOURCE
  // =========================================================

  protected selectSource(value: string): void {
    this.source.set(value);
    this.closeDropdown();
    this.applyFilters();
  }

  protected sourceLabel(): string {
    if (this.isLoadingOptions()) {
      return 'Loading...';
    }

    return this.source() || 'All sources';
  }

  // =========================================================
  // STATUS
  // =========================================================

  protected selectStatus(value: TradeStatus | ''): void {
    this.status.set(value);
    this.closeDropdown();
    this.applyFilters();
  }

  protected statusLabel(): string {
    return this.status() ? this.formatStatusLabel(this.status()) : 'All statuses';
  }

  // =========================================================
  // SIDE
  // =========================================================

  protected selectSide(value: TradeSide | ''): void {
    this.side.set(value);
    this.closeDropdown();
    this.applyFilters();
  }

  protected sideLabel(): string {
    return this.side() ? this.formatSideLabel(this.side()) : 'All sides';
  }

  // =========================================================
  // DATE
  // =========================================================

  protected onFromChange(event: Event): void {
    this.from.set((event.target as HTMLInputElement).value);

    this.selectedRange.set(null);
  }

  protected onToChange(event: Event): void {
    this.to.set((event.target as HTMLInputElement).value);

    this.selectedRange.set(null);
  }

  // =========================================================
  // SORT
  // =========================================================

  protected selectSortBy(value: TradeSortBy): void {
    this.sortBy.set(value);
    this.closeDropdown();
  }

  protected sortByLabel(): string {
    switch (this.sortBy()) {
      case 'openTime':
        return 'Open time';

      case 'closeTime':
        return 'Close time';

      case 'symbol':
        return 'Symbol';

      case 'entryPrice':
        return 'Entry price';

      case 'exitPrice':
        return 'Exit price';

      case 'profit':
        return 'Profit';

      default:
        return 'Open time';
    }
  }

  protected selectSortOrder(value: TradeSortOrder): void {
    this.sortOrder.set(value);
    this.closeDropdown();
  }

  protected sortOrderLabel(): string {
    return this.sortOrder() === 'asc' ? 'Ascending' : 'Descending';
  }

  // =========================================================
  // PAGE SIZE
  // =========================================================

  protected selectPageSize(value: number): void {
    this.pageSize.set(value);
    this.currentPage.set(1);

    this.closeDropdown();

    this.loadTrades(1);
  }

  // =========================================================
  // ADVANCED
  // =========================================================

  protected toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update((visible) => !visible);

    this.closeDropdown();
  }

  // =========================================================
  // APPLY / CLEAR
  // =========================================================

  protected applyFilters(): void {
    this.currentPage.set(1);

    this.loadTrades(1);
  }

  protected clearFilters(): void {
    this.search.set('');
    this.status.set('');
    this.side.set('');
    this.symbol.set('');
    this.source.set('');

    this.from.set('');
    this.to.set('');

    this.selectedRange.set(null);

    this.sortBy.set('openTime');
    this.sortOrder.set('desc');

    this.currentPage.set(1);

    this.closeDropdown();

    this.loadTrades(1);
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  protected goToPreviousPage(): void {
    const current = this.currentPage();

    if (current <= 1) {
      return;
    }

    this.loadTrades(current - 1);
  }

  protected goToNextPage(): void {
    const current = this.currentPage();

    const total = this.totalPages();

    if (current >= total) {
      return;
    }

    this.loadTrades(current + 1);
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

  // =========================================================
  // DELETE
  // =========================================================

  protected deleteTrade(trade: Trade): void {
    const confirmed = window.confirm(`Delete trade #${trade.tradeNo} (${trade.symbol})?`);

    if (!confirmed) {
      return;
    }

    this.deletingTradeId.set(trade.tradeId);

    this.errorMessage.set(null);

    this.tradeService
      .deleteTrade(trade.tradeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const remainingTotal = Math.max(this.meta().total - 1, 0);

          const nextTotalPages =
            remainingTotal > 0 ? Math.ceil(remainingTotal / this.pageSize()) : 1;

          const targetPage = Math.min(this.currentPage(), nextTotalPages);

          this.deletingTradeId.set(null);

          this.loadTrades(targetPage);

          this.loadTradeOptions();
        },

        error: (error) => {
          console.error('Delete trade failed:', error);

          this.deletingTradeId.set(null);

          this.errorMessage.set('Unable to delete this trade. Please try again.');
        },
      });
  }

  // =========================================================
  // FORMATTERS
  // =========================================================

  protected formatNumber(value: string | null): string {
    if (value === null || value === '') {
      return '—';
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return value;
    }

    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 5,
    }).format(numericValue);
  }

  protected formatMarketTypeLabel(marketType: string): string {
    switch (marketType) {
      case 'CRYPTO':
        return 'Crypto';

      case 'FOREX':
        return 'Forex';

      case 'STOCK':
        return 'Stock';

      case 'FUTURES':
        return 'Futures';

      default:
        return marketType;
    }
  }

  protected formatSideLabel(side: string): string {
    return side === 'BUY' ? 'Buy' : 'Sell';
  }

  protected formatStatusLabel(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'Open';

      case 'CLOSED':
        return 'Closed';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;
    }
  }

  // =========================================================
  // QUERY
  // =========================================================

  private buildQuery(page: number) {
    return {
      page,
      limit: this.pageSize(),

      search: this.search().trim() || undefined,

      sortBy: this.sortBy(),

      sortOrder: this.sortOrder(),

      status: this.status() || undefined,

      side: this.side() || undefined,

      symbol: this.symbol().trim().toUpperCase() || undefined,

      source: this.source().trim().toUpperCase() || undefined,

      from: this.from() || undefined,

      to: this.to() || undefined,
    };
  }

  // =========================================================
  // LOAD
  // =========================================================

  private loadTrades(page: number): void {
    this.isLoading.set(true);

    this.errorMessage.set(null);

    this.currentPage.set(page);

    const query = this.buildQuery(page);

    this.tradeService
      .listTrades(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.trades.set(response.data);

          this.meta.set(response.meta);

          this.currentPage.set(response.meta.page);

          this.pageSize.set(response.meta.limit);

          this.isLoading.set(false);
        },

        error: (error) => {
          console.error('Load trades failed:', error);

          this.trades.set([]);

          this.isLoading.set(false);

          this.errorMessage.set('Unable to load trades. Please try again.');
        },
      });
  }

  // =========================================================
  // DATE
  // =========================================================

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
