import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { I18nService } from '../../../../core/services/i18n.service';
import { TradeService } from '../../data-access/trade.service';
import { buildTradeForm } from '../../utils/trade-form.util';

@Component({
  selector: 'app-trade-create-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './trade-create-page.component.html'
})
export class TradeCreatePageComponent {
  protected readonly i18n = inject(I18nService);

  private readonly formBuilder = inject(FormBuilder);
  private readonly tradeService = inject(TradeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly tradeForm = buildTradeForm(this.formBuilder);

  protected onSubmit(): void {
    if (this.tradeForm.invalid) {
      this.tradeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.tradeService
      .createTrade(this.tradeForm.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          void this.router.navigate(['/app/trades']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error?.error?.message ?? this.i18n.t('trade.create.error'));
        }
      });
  }
}
