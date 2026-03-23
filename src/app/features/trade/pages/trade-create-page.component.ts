import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CreateTradeFormValue, TradeService } from '../data-access/trade.service';
import { TradeMarketType, TradeSide } from '../types/trade.models';

@Component({
  selector: 'app-trade-create-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">Trades</p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-950">Create Trade</h2>
          <p class="mt-1 text-sm text-slate-500">Submits to POST /api/v1/trades and redirects back to the trade list on success.</p>
        </div>

        <a
          routerLink="/app/trades"
          class="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Back to Trades
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
          <span class="text-sm font-medium text-slate-700">Symbol</span>
          <input
            type="text"
            formControlName="symbol"
            placeholder="BTCUSDT"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Market Type</span>
          <select
            formControlName="marketType"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
            @for (marketType of marketTypes; track marketType) {
              <option [value]="marketType">{{ marketType }}</option>
            }
          </select>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Side</span>
          <select
            formControlName="side"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
            @for (side of sides; track side) {
              <option [value]="side">{{ side }}</option>
            }
          </select>
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Open Time</span>
          <input
            type="datetime-local"
            formControlName="openTime"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Entry Price</span>
          <input
            type="text"
            formControlName="entryPrice"
            placeholder="65000.00000000"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Stop Loss</span>
          <input
            type="text"
            formControlName="stopLoss"
            placeholder="64000.00000000"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Take Profit</span>
          <input
            type="text"
            formControlName="takeProfit"
            placeholder="69000.00000000"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2">
          <span class="text-sm font-medium text-slate-700">Quantity</span>
          <input
            type="text"
            formControlName="quantity"
            placeholder="0.10000000"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
        </label>

        <label class="space-y-2 lg:col-span-2">
          <span class="text-sm font-medium text-slate-700">Thesis</span>
          <textarea
            rows="4"
            formControlName="thesis"
            placeholder="Breakout above resistance with volume confirmation"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"></textarea>
        </label>

        <label class="space-y-2 lg:col-span-2">
          <span class="text-sm font-medium text-slate-700">Note</span>
          <textarea
            rows="4"
            formControlName="note"
            placeholder="Updated take profit after momentum confirmation"
            class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"></textarea>
        </label>

        <div class="flex justify-end lg:col-span-2">
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-300"
            [disabled]="isSubmitting()">
            {{ isSubmitting() ? 'Saving trade...' : 'Save Trade' }}
          </button>
        </div>
      </form>
    </section>
  `
})
export class TradeCreatePageComponent {
  protected readonly marketTypes: TradeMarketType[] = ['CRYPTO', 'FOREX', 'STOCK', 'FUTURES'];
  protected readonly sides: TradeSide[] = ['BUY', 'SELL'];

  private readonly formBuilder = inject(FormBuilder);
  private readonly tradeService = inject(TradeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly tradeForm = this.formBuilder.nonNullable.group({
    symbol: ['', [Validators.required]],
    marketType: ['CRYPTO' as TradeMarketType, [Validators.required]],
    side: ['BUY' as TradeSide, [Validators.required]],
    entryPrice: ['', [Validators.required]],
    stopLoss: ['', [Validators.required]],
    takeProfit: ['', [Validators.required]],
    quantity: ['', [Validators.required]],
    openTime: ['', [Validators.required]],
    thesis: [''],
    note: ['']
  });

  protected onSubmit(): void {
    if (this.tradeForm.invalid) {
      this.tradeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.tradeService
      .createTrade(this.tradeForm.getRawValue() as CreateTradeFormValue)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          void this.router.navigate(['/app/trades']);
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(error?.error?.message ?? 'Unable to create the trade right now.');
        }
      });
  }
}
