import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { I18nService } from '../../../../core/services/i18n.service';
import { TradeService } from '../../data-access/trade.service';
import { buildTradeForm } from '../../utils/trade-form.util';

@Component({
  selector: 'app-trade-edit-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './trade-edit-page.component.html'
})
export class TradeEditPageComponent {
  protected readonly i18n = inject(I18nService);

  private readonly formBuilder = inject(FormBuilder);
  private readonly tradeService = inject(TradeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly tradeId = this.route.snapshot.paramMap.get('tradeId') ?? '';

  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly tradeForm = buildTradeForm(this.formBuilder);

  constructor() {
    this.loadTrade();
  }

  protected onSubmit(): void {
    if (this.tradeForm.invalid || !this.tradeId) {
      this.tradeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.tradeService
      .updateTrade(this.tradeId, this.tradeForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          void this.router.navigate(['/app/trades']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error?.error?.message ?? this.i18n.t('trade.edit.error'));
        }
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
          this.tradeForm.reset(buildTradeForm(this.formBuilder, trade).getRawValue());
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message ?? this.i18n.t('trade.edit.loadError'));
          this.isLoading.set(false);
        }
      });
  }
}
