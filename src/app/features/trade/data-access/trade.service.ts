import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Trade,
  TradeImportConfirmResponse,
  TradeImportPreviewResponse,
  TradeListResponse,
  TradeListQuery,
  TradeExitReason,
} from '../types/trade.models';

import {
  mapTradeFormValueToCreateRequest,
  mapTradeJournalValueToUpdateRequest,
  mapTradeFormValueToUpdateRequest,
  TradeFormValue,
} from '../utils/trade-form.util';

import { TradeApiService, TradeOptionsResponse } from './trade-api.service';

@Injectable({
  providedIn: 'root',
})
export class TradeService {
  private readonly tradeApi = inject(TradeApiService);

  listTrades(query?: TradeListQuery): Observable<TradeListResponse> {
    return this.tradeApi.list(query);
  }

  getTradeOptions(): Observable<TradeOptionsResponse> {
    return this.tradeApi.getOptions();
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

  updateTradeJournal(
    tradeId: string,
    formValue: Pick<TradeFormValue, 'thesis' | 'note'>,
  ): Observable<Trade> {
    return this.tradeApi.update(tradeId, mapTradeJournalValueToUpdateRequest(formValue));
  }

  closeTrade(tradeId: string, exitReason: TradeExitReason, exitPrice?: string): Observable<Trade> {
    return this.tradeApi.update(tradeId, {
      status: 'CLOSED',
      exitReason,
      ...(exitPrice !== undefined ? { exitPrice } : {}),
    });
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
