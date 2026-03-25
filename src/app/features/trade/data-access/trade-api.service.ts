import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../auth/data-access/auth.service';
import { CreateTradeRequest, Trade, UpdateTradeRequest } from '../types/trade.models';

@Injectable({
  providedIn: 'root'
})
export class TradeApiService {
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly tradesPath = '/trades';

  list(): Observable<Trade[]> {
    return this.api.get<Trade[]>(this.tradesPath, {
      headers: this.buildAuthHeaders()
    });
  }

  create(payload: CreateTradeRequest): Observable<Trade> {
    return this.api.post<Trade, CreateTradeRequest>(this.tradesPath, payload, {
      headers: this.buildAuthHeaders()
    });
  }

  getById(tradeId: string): Observable<Trade> {
    return this.api.get<Trade>(`${this.tradesPath}/${tradeId}`, {
      headers: this.buildAuthHeaders()
    });
  }

  update(tradeId: string, payload: UpdateTradeRequest): Observable<Trade> {
    return this.api.patch<Trade, UpdateTradeRequest>(`${this.tradesPath}/${tradeId}`, payload, {
      headers: this.buildAuthHeaders()
    });
  }

  delete(tradeId: string): Observable<void> {
    return this.api.delete<void>(`${this.tradesPath}/${tradeId}`, {
      headers: this.buildAuthHeaders()
    });
  }

  private buildAuthHeaders(): HttpHeaders {
    this.authService.restoreSession();
    const accessToken = this.authService.getAccessToken();

    return new HttpHeaders(
      accessToken
        ? {
            Authorization: `Bearer ${accessToken}`
          }
        : {}
    );
  }
}
