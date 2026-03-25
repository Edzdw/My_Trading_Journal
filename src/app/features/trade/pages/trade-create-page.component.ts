import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { I18nService } from '../../../core/services/i18n.service';
import { TradeService } from '../data-access/trade.service';
import { buildTradeForm } from '../utils/trade-form.util';

@Component({
  selector: 'app-trade-create-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">{{ i18n.t('trade.nav.trades') }}</p>
          <h2 class="mt-2 text-3xl font-semibold text-slate-950">{{ i18n.t('trade.create.title') }}</h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {{ i18n.t('trade.create.description') }}
          </p>
        </div>

        <a
          routerLink="/app/trades"
          class="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          {{ i18n.t('common.actions.backToTrades') }}
        </a>
      </div>

      @if (errorMessage()) {
        <div class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ errorMessage() }}
        </div>
      }

      <form
        class="grid gap-6 rounded-3xl border border-slate-200 bg-white/70 p-6 lg:grid-cols-2"
        [formGroup]="tradeForm"
        (ngSubmit)="onSubmit()">
        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">{{ i18n.t('trade.form.fields.symbol') }}</span>
          <input
            type="text"
            formControlName="symbol"
            placeholder="BTCUSDT"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">{{ i18n.t('trade.form.fields.marketType') }}</span>
          <select
            formControlName="marketType"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
            <option value="CRYPTO">{{ i18n.t('trade.form.marketType.crypto') }}</option>
            <option value="FOREX">{{ i18n.t('trade.form.marketType.forex') }}</option>
            <option value="STOCK">{{ i18n.t('trade.form.marketType.stock') }}</option>
            <option value="FUTURES">{{ i18n.t('trade.form.marketType.futures') }}</option>
          </select>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">{{ i18n.t('trade.form.fields.side') }}</span>
          <select
            formControlName="side"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
            <option value="BUY">{{ i18n.t('trade.form.side.buy') }}</option>
            <option value="SELL">{{ i18n.t('trade.form.side.sell') }}</option>
          </select>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">{{ i18n.t('trade.form.fields.openTime') }}</span>
          <input
            type="datetime-local"
            formControlName="openTime"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">{{ i18n.t('trade.form.fields.entryPrice') }}</span>
          <input
            type="text"
            formControlName="entryPrice"
            placeholder="65000.00000000"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">{{ i18n.t('trade.form.fields.stopLoss') }}</span>
          <input
            type="text"
            formControlName="stopLoss"
            placeholder="64000.00000000"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">{{ i18n.t('trade.form.fields.takeProfit') }}</span>
          <input
            type="text"
            formControlName="takeProfit"
            placeholder="69000.00000000"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">{{ i18n.t('trade.form.fields.quantity') }}</span>
          <input
            type="text"
            formControlName="quantity"
            placeholder="0.10000000"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2 lg:col-span-2">
          <span class="text-sm font-medium text-slate-700">{{ i18n.t('trade.form.fields.thesis') }}</span>
          <textarea
            rows="4"
            formControlName="thesis"
            [placeholder]="i18n.t('trade.form.placeholders.thesis')"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"></textarea>
        </label>

        <label class="space-y-2 lg:col-span-2">
          <span class="text-sm font-medium text-slate-700">{{ i18n.t('trade.form.fields.note') }}</span>
          <textarea
            rows="4"
            formControlName="note"
            [placeholder]="i18n.t('trade.form.placeholders.note')"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"></textarea>
        </label>

        <div class="flex justify-end lg:col-span-2">
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
            [disabled]="isSubmitting()">
            {{ isSubmitting() ? i18n.t('trade.create.submitting') : i18n.t('trade.create.submit') }}
          </button>
        </div>
      </form>
    </section>
  `
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
