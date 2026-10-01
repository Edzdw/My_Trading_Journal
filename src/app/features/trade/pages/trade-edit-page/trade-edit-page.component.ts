import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { I18nService } from '../../../../core/services/i18n.service';
import { TradeService } from '../../data-access/trade.service';
import { buildTradeForm } from '../../utils/trade-form.util';
import type {
  Trade,
  TradeExitReason,
  TradeStatus,
} from '../../types/trade.models';

@Component({
  selector: 'app-trade-edit-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './trade-edit-page.component.html',
  styleUrl: './trade-edit-page.component.css',
})
export class TradeEditPageComponent {
  protected readonly i18n = inject(I18nService);

  private readonly formBuilder = inject(FormBuilder);
  private readonly tradeService = inject(TradeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly tradeId =
    this.route.snapshot.paramMap.get('tradeId') ?? '';

  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly tradeStatus = signal<TradeStatus | null>(null);
  protected readonly trade = signal<Trade | null>(null);

  protected readonly isCloseDialogOpen = signal(false);
  protected readonly closeExitReason =
    signal<TradeExitReason | null>(null);
  protected readonly closeExitPrice = signal('');

  protected readonly tradeForm = buildTradeForm(this.formBuilder);

  constructor() {
    this.loadTrade();
  }

  protected onSubmit(): void {
    if (
      this.tradeForm.invalid ||
      !this.tradeId ||
      !this.trade() ||
      this.isSubmitting()
    ) {
      this.tradeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.tradeForm.getRawValue();
    const updateRequest = this.tradeStatus() === 'CLOSED'
      ? this.tradeService.updateTradeJournal(this.tradeId, {
          thesis: formValue.thesis,
          note: formValue.note,
        })
      : this.tradeService.updateTrade(this.tradeId, formValue);

    updateRequest
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          void this.router.navigate(['/app/trades/list']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(
            error?.error?.message ?? this.i18n.t('trade.edit.error'),
          );
        },
      });
  }

  private loadTrade(): void {
    if (!this.tradeId) {
      this.errorMessage.set(this.i18n.t('trade.edit.missingId'));
      this.isLoading.set(false);
      return;
    }

    this.tradeService
      .getTradeById(this.tradeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (trade) => {
          this.trade.set(trade);
          this.tradeStatus.set(trade.status);

          this.tradeForm.reset(
            buildTradeForm(this.formBuilder, trade).getRawValue(),
          );
          this.setExecutionControlsDisabled(trade.status === 'CLOSED');

          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(
            error?.error?.message ??
              this.i18n.t('trade.edit.loadError'),
          );
          this.isLoading.set(false);
        },
      });
  }

  private setExecutionControlsDisabled(disabled: boolean): void {
    const controls = [
      this.tradeForm.controls.symbol,
      this.tradeForm.controls.marketType,
      this.tradeForm.controls.side,
      this.tradeForm.controls.openTime,
      this.tradeForm.controls.entryPrice,
      this.tradeForm.controls.quantity,
      this.tradeForm.controls.stopLoss,
      this.tradeForm.controls.takeProfit,
    ];

    for (const control of controls) {
      if (disabled) {
        control.disable({ emitEvent: false });
      } else {
        control.enable({ emitEvent: false });
      }
    }
  }

  protected openCloseDialog(): void {
    if (
      !this.tradeId ||
      this.tradeStatus() !== 'OPEN' ||
      this.isSubmitting()
    ) {
      return;
    }

    this.closeExitReason.set(null);
    this.closeExitPrice.set('');
    this.isCloseDialogOpen.set(true);
  }

  protected closeCloseDialog(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isCloseDialogOpen.set(false);
  }

  protected selectCloseReason(reason: TradeExitReason): void {
    this.closeExitReason.set(reason);

    if (reason !== 'MANUAL') {
      this.closeExitPrice.set('');
    }
  }

  protected confirmCloseTrade(): void {
    if (
      !this.tradeId ||
      this.tradeStatus() !== 'OPEN' ||
      this.isSubmitting()
    ) {
      return;
    }

    const exitReason = this.closeExitReason();

    if (!exitReason) {
      return;
    }

    const exitPrice = this.closeExitPrice().trim();

    if (exitReason === 'MANUAL' && !exitPrice) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.tradeService
      .closeTrade(
        this.tradeId,
        exitReason,
        exitReason === 'MANUAL' ? exitPrice : undefined,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isCloseDialogOpen.set(false);

          void this.router.navigate(['/app/trades/list']);
        },
        error: (error) => {
          this.isSubmitting.set(false);

          this.errorMessage.set(
            error?.error?.message ?? this.i18n.t('trade.edit.error'),
          );
        },
      });
  }
}