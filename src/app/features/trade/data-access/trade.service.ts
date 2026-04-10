import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Trade,
  TradeImportConfirmResponse,
  TradeImportPreviewResponse
} from '../types/trade.models';
import { TradeApiService } from './trade-api.service';
import {
  mapTradeFormValueToCreateRequest,
  mapTradeFormValueToUpdateRequest,
  TradeFormValue
} from '../utils/trade-form.util';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private readonly tradeApi = inject(TradeApiService);

  listTrades(): Observable<Trade[]> {
    return this.tradeApi.list();
  }

  getTradeById(tradeId: string): Observable<Trade> {
    return this.tradeApi.getById(tradeId);
  }

  createTrade(formValue: TradeFormValue): Observable<Trade> {
    return this.tradeApi.create(mapTradeFormValueToCreateRequest(formValue));
  }

  updateTrade(tradeId: string, formValue: TradeFormValue): Observable<Trade> {
    return this.tradeApi.update(tradeId, mapTradeFormValueToUpdateRequest(formValue));
  }

  deleteTrade(tradeId: string): Observable<void> {
    return this.tradeApi.delete(tradeId);
  }

  previewTradeImport(file: File): Observable<TradeImportPreviewResponse> {
    return this.tradeApi.previewImport(file);
  }

  confirmTradeImport(file: File): Observable<TradeImportConfirmResponse> {
    return this.tradeApi.confirmImport(file);
  }
}
