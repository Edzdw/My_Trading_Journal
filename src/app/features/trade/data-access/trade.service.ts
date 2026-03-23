import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CreateTradeRequest, Trade } from '../types/trade.models';
import { TradeApiService } from './trade-api.service';

export interface CreateTradeFormValue {
  symbol: string;
  marketType: string;
  side: string;
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  quantity: string;
  openTime: string;
  thesis: string;
  note: string;
}

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private readonly tradeApi = inject(TradeApiService);

  listTrades(): Observable<Trade[]> {
    return this.tradeApi.list();
  }

  createTrade(formValue: CreateTradeFormValue): Observable<Trade> {
    return this.tradeApi.create(this.mapCreateTradePayload(formValue));
  }

  private mapCreateTradePayload(formValue: CreateTradeFormValue): CreateTradeRequest {
    return {
      symbol: formValue.symbol.trim().toUpperCase(),
      marketType: formValue.marketType as CreateTradeRequest['marketType'],
      side: formValue.side as CreateTradeRequest['side'],
      entryPrice: formValue.entryPrice.trim(),
      stopLoss: formValue.stopLoss.trim(),
      takeProfit: formValue.takeProfit.trim(),
      quantity: formValue.quantity.trim(),
      openTime: new Date(formValue.openTime).toISOString(),
      thesis: this.nullableText(formValue.thesis),
      note: this.nullableText(formValue.note)
    };
  }

  private nullableText(value: string): string | null {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }
}
