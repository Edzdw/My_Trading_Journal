import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { I18nService } from '../../../../core/services/i18n.service';
import { TradeService } from '../../data-access/trade.service';
import {
  TradeImportConfirmResponse,
  TradeImportPreviewResponse,
  TradeImportPreviewTradeRow
} from '../../types/trade.models';

@Component({
  selector: 'app-trade-import-page',
  imports: [NgClass],
  providers: [DecimalPipe, DatePipe],
  templateUrl: './trade-import-page.component.html'

})
export class TradeImportPageComponent {
  protected readonly i18n = inject(I18nService);

  private readonly tradeService = inject(TradeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly decimalPipe = inject(DecimalPipe);
  private readonly datePipe = inject(DatePipe);
  private readonly fileInputRef = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly selectedFile = signal<File | null>(null);
  protected readonly selectedFileName = signal<string | null>(null);
  protected readonly previewResponse = signal<TradeImportPreviewResponse | null>(null);
  protected readonly confirmResponse = signal<TradeImportConfirmResponse | null>(null);
  protected readonly isPreviewing = signal(false);
  protected readonly isConfirming = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly pageSize = signal(10);
  protected readonly currentPage = signal(1);

  protected readonly totalPreviewTrades = computed(() => this.previewResponse()?.trades.length ?? 0);

  protected readonly totalPages = computed(() => {
    const total = this.totalPreviewTrades();
    const size = this.pageSize();
    return total > 0 ? Math.ceil(total / size) : 1;
  });

  protected readonly paginatedTrades = computed(() => {
    const preview = this.previewResponse();
    if (!preview) {
      return [];
    }

    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    const end = start + size;

    return preview.trades.slice(start, end);
  });

  protected readonly previewColumns = [
    { key: 'externalPositionId', labelKey: 'trade.import.previewTable.fields.externalPositionId' },
    { key: 'symbol', labelKey: 'trade.import.previewTable.fields.symbol' },
    { key: 'side', labelKey: 'trade.import.previewTable.fields.side' },
    { key: 'quantity', labelKey: 'trade.import.previewTable.fields.quantity' },
    { key: 'entryPrice', labelKey: 'trade.import.previewTable.fields.entryPrice' },
    { key: 'stopLoss', labelKey: 'trade.import.previewTable.fields.stopLoss' },
    { key: 'takeProfit', labelKey: 'trade.import.previewTable.fields.takeProfit' },
    { key: 'openTime', labelKey: 'trade.import.previewTable.fields.openTime' },
    { key: 'exitPrice', labelKey: 'trade.import.previewTable.fields.exitPrice' },
    { key: 'closeTime', labelKey: 'trade.import.previewTable.fields.closeTime' },
    { key: 'commission', labelKey: 'trade.import.previewTable.fields.commission' },
    { key: 'swap', labelKey: 'trade.import.previewTable.fields.swap' },
    { key: 'fee', labelKey: 'trade.import.previewTable.fields.fee' },
    { key: 'profit', labelKey: 'trade.import.previewTable.fields.profit' },
    { key: 'closeReason', labelKey: 'trade.import.previewTable.fields.closeReason' },
    { key: 'externalOrderId', labelKey: 'trade.import.previewTable.fields.externalOrderId' },
    { key: 'rawComment', labelKey: 'trade.import.previewTable.fields.rawComment' }
  ];

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile.set(file);
    this.selectedFileName.set(file?.name ?? null);
    this.previewResponse.set(null);
    this.confirmResponse.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.currentPage.set(1);
  }

  protected previewImport(): void {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set(this.i18n.t('trade.import.previewRequired'));
      return;
    }

    this.isPreviewing.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.confirmResponse.set(null);

    this.tradeService
      .previewTradeImport(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.previewResponse.set(response);
          this.currentPage.set(1);
          this.successMessage.set(this.i18n.t('trade.import.previewSuccess'));
          this.isPreviewing.set(false);
        },
        error: (error) => {
          this.errorMessage.set(this.extractErrorMessage(error));
          this.isPreviewing.set(false);
        }
      });
  }

  protected confirmImport(): void {
    const file = this.selectedFile();
    if (!file || !this.previewResponse()) {
      this.errorMessage.set(this.i18n.t('trade.import.previewRequired'));
      return;
    }

    this.isConfirming.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.tradeService
      .confirmTradeImport(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.confirmResponse.set(response);
          this.successMessage.set(this.i18n.t('trade.import.confirmSuccess'));
          this.isConfirming.set(false);
        },
        error: (error) => {
          this.errorMessage.set(this.extractErrorMessage(error));
          this.isConfirming.set(false);
        }
      });
  }

  protected resetState(): void {
    this.selectedFile.set(null);
    this.selectedFileName.set(null);
    this.previewResponse.set(null);
    this.confirmResponse.set(null);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.currentPage.set(1);
    this.fileInputRef().nativeElement.value = '';
  }

  protected canConfirmImport(): boolean {
    return !!this.selectedFile() && !!this.previewResponse() && !this.isPreviewing() && !this.isConfirming();
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

  protected onPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!Number.isNaN(value) && value > 0) {
      this.pageSize.set(value);
      this.currentPage.set(1);
    }
  }

  protected startRow(): number {
    const total = this.totalPreviewTrades();
    if (total === 0) {
      return 0;
    }

    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  protected endRow(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalPreviewTrades());
  }

  protected trackTradeRow(index: number, trade: TradeImportPreviewTradeRow): string {
    return (trade.externalPositionId ?? 'no-position') + '-' + (trade.externalOrderId ?? 'no-order') + '-' + index;
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

  protected formatDateValue(value: string | null): string {
    if (!value) {
      return this.i18n.t('common.states.notAvailable');
    }

    const formatted = this.datePipe.transform(value, 'medium');
    return formatted ?? value;
  }

  protected formatSideLabel(side: string): string {
    const key = 'trade.list.side.' + side.toLowerCase();
    const translated = this.i18n.t(key);
    return translated === key ? side : translated;
  }

  protected formatCloseReason(closeReason: string | null): string {
    if (!closeReason) {
      return this.i18n.t('common.states.notAvailable');
    }

    const key = 'trade.import.closeReason.' + closeReason.toLowerCase();
    const translated = this.i18n.t(key);
    return translated === key ? closeReason : translated;
  }

  protected getProfitClass(value: string | null): string {
    if (!value) {
      return 'text-slate-700 dark:text-slate-300';
    }

    const parsedValue = Number(value);
    if (Number.isNaN(parsedValue)) {
      return 'text-slate-700 dark:text-slate-300';
    }

    return parsedValue >= 0
      ? 'text-emerald-700 dark:text-emerald-300'
      : 'text-rose-700 dark:text-rose-300';
  }

  private extractErrorMessage(error: unknown): string {
    const fallback = this.i18n.t('trade.import.requestError');
    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const response = (error as { error?: unknown }).error;
    if (typeof response === 'string') {
      return response;
    }

    if (response && typeof response === 'object') {
      const message = (response as { message?: unknown }).message;
      if (typeof message === 'string') {
        return message;
      }

      if (Array.isArray(message)) {
        return message.join(', ');
      }
    }

    const directMessage = (error as { message?: unknown }).message;
    return typeof directMessage === 'string' ? directMessage : fallback;
  }
}
