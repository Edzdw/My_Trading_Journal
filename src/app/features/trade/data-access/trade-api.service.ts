import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../auth/data-access/auth.service';
import { CreateTradeRequest, Trade } from '../types/trade.models';

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

  private buildAuthHeaders(): HttpHeaders {
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
