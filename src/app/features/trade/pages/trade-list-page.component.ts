import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TradeService } from '../data-access/trade.service';
import { Trade } from '../types/trade.models';

@Component({
  selector: 'app-trade-list-page',
  imports: [DatePipe, NgClass, RouterLink],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">Trades</p>
          <h2 class="mt-2 text-2xl font-semibold text-slate-950">Trade List</h2>
          <p class="mt-1 text-sm text-slate-500">Reads from GET /api/v1/trades and keeps numeric values as strings from the API.</p>
        </div>

        <a
          routerLink="/app/trades/new"
          class="inline-flex items-center justify-center rounded-2xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800">
          Create Trade
        </a>
      </div>

      @if (errorMessage()) {
        <div class="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ errorMessage() }}
        </div>
      }

      @if (isLoading()) {
        <div class="rounded-3xl border border-slate-200 bg-white/70 p-8 text-sm text-slate-500">
          Loading trades...
        </div>
      } @else if (trades().length === 0) {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
          <h3 class="text-lg font-semibold text-slate-900">No trades yet</h3>
          <p class="mt-2 text-sm text-slate-500">Create your first trade entry to start building the journal.</p>
        </div>
      } @else {
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white/70">
          <div class="hidden grid-cols-[0.8fr_1.2fr_0.9fr_0.9fr_1fr_0.9fr_1.2fr] gap-4 border-b border-slate-200 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 lg:grid">
            <span>#</span>
            <span>Symbol</span>
            <span>Side</span>
            <span>Status</span>
            <span>Entry</span>
            <span>Quantity</span>
            <span>Open Time</span>
          </div>

          <div class="divide-y divide-slate-200">
            @for (trade of trades(); track trade.tradeId) {
              <article class="grid gap-4 px-6 py-5 lg:grid-cols-[0.8fr_1.2fr_0.9fr_0.9fr_1fr_0.9fr_1.2fr] lg:items-center">
                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-400 lg:hidden">Trade No</p>
                  <p class="text-sm font-semibold text-slate-900">{{ trade.tradeNo }}</p>
                </div>

                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-400 lg:hidden">Symbol</p>
                  <p class="text-sm font-semibold text-slate-900">{{ trade.symbol }}</p>
                  <p class="text-xs text-slate-500">{{ trade.marketType }}</p>
                </div>

                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-400 lg:hidden">Side</p>
                  <span
                    class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                    [ngClass]="trade.side === 'BUY' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                    {{ trade.side }}
                  </span>
                </div>

                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-400 lg:hidden">Status</p>
                  <span class="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {{ trade.status }}
                  </span>
                </div>

                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-400 lg:hidden">Entry</p>
                  <p class="text-sm text-slate-900">{{ trade.entryPrice }}</p>
                  <p class="text-xs text-slate-500">SL {{ trade.stopLoss }} / TP {{ trade.takeProfit }}</p>
                </div>

                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-400 lg:hidden">Quantity</p>
                  <p class="text-sm text-slate-900">{{ trade.quantity }}</p>
                </div>

                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-slate-400 lg:hidden">Open Time</p>
                  <p class="text-sm text-slate-900">{{ trade.openTime | date: 'medium' }}</p>
                </div>

                @if (trade.thesis || trade.note) {
                  <div class="lg:col-span-7">
                    <div class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      @if (trade.thesis) {
                        <p><span class="font-semibold text-slate-800">Thesis:</span> {{ trade.thesis }}</p>
                      }
                      @if (trade.note) {
                        <p class="mt-1"><span class="font-semibold text-slate-800">Note:</span> {{ trade.note }}</p>
                      }
                    </div>
                  </div>
                }
              </article>
            }
          </div>
        </div>
      }
    </section>
  `
})
export class TradeListPageComponent {
  private readonly tradeService = inject(TradeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly trades = signal<Trade[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.loadTrades();
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
          this.errorMessage.set(error?.error?.message ?? 'Unable to load trades right now.');
          this.isLoading.set(false);
        }
      });
  }
}
