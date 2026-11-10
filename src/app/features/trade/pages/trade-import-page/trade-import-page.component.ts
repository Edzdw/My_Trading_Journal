import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';

import { I18nService } from '../../../../core/services/i18n.service';
import { TradeImportTaskService } from '../../data-access/trade-import-task.service';
import {
  TradeImportPreviewTradeRow
} from '../../types/trade.models';

@Component({
  selector: 'app-trade-import-page',
  imports: [DatePipe],
  providers: [DecimalPipe, DatePipe],
  templateUrl: './trade-import-page.component.html',
  styleUrl: './trade-import-page.component.css'
})
export class TradeImportPageComponent {
  protected readonly i18n = inject(I18nService);

  protected readonly task = inject(TradeImportTaskService);
  private readonly decimalPipe = inject(DecimalPipe);
  private readonly datePipe = inject(DatePipe);
  private readonly fileInputRef = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly selectedFile = this.task.selectedFile;
  protected readonly selectedFileName = this.task.selectedFileName;
  protected readonly previewResponse = this.task.previewResponse;
  protected readonly confirmResponse = this.task.confirmResponse;
  protected readonly isPreviewing = this.task.isPreviewing;
  protected readonly isConfirming = this.task.isConfirming;
  protected readonly errorMessage = this.task.errorMessage;
  protected readonly successMessage = this.task.successMessage;

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
    this.task.selectFile((event.target as HTMLInputElement).files?.[0] ?? null);
    this.currentPage.set(1);
  }

  protected previewImport(): void { this.task.preview(); }
  protected confirmImport(): void { this.task.confirm(); }
  protected resetState(): void {
    if (this.task.busy()) return;
    this.task.reset();
    this.currentPage.set(1);
    this.fileInputRef().nativeElement.value = '';
  }
  protected canConfirmImport(): boolean { return this.task.canConfirm(); }

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

}
