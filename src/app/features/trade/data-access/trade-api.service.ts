import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../auth/data-access/auth.service';

import {
  CreateTradeRequest,
  Trade,
  TradeJournalQuery,
  TradeJournalResponse,
  TradeImportConfirmResponse,
  TradeImportPreviewResponse,
  TradeListResponse,
  TradeListQuery,
  UpdateTradeRequest,
} from '../types/trade.models';

export interface TradeOptionsResponse {
  symbols: string[];
  sources: string[];
}

@Injectable({
  providedIn: 'root',
})
export class TradeApiService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly tradesPath = '/trades';

  list(
    query?: TradeListQuery,
  ): Observable<TradeListResponse> {
    return this.api.get<TradeListResponse>(
      this.tradesPath,
      {
        params: query
          ? { ...query }
          : undefined,

        headers: this.buildAuthHeaders(),
      },
    );
  }

  journal(query: TradeJournalQuery): Observable<TradeJournalResponse> {
    return this.api.get<TradeJournalResponse>(`${this.tradesPath}/journal`, {
      params: { ...query }, headers: this.buildAuthHeaders(),
    });
  }

  getOptions(): Observable<TradeOptionsResponse> {
    return this.api.get<TradeOptionsResponse>(
      `${this.tradesPath}/options`,
      {
        headers: this.buildAuthHeaders(),
      },
    );
  }

  create(
    payload: CreateTradeRequest,
  ): Observable<Trade> {
    return this.api.post<
      Trade,
      CreateTradeRequest
    >(
      this.tradesPath,
      payload,
      {
        headers: this.buildAuthHeaders(),
      },
    );
  }

  previewImport(
    file: File,
  ): Observable<TradeImportPreviewResponse> {
    return this.api.post<
      TradeImportPreviewResponse,
      FormData
    >(
      `${this.tradesPath}/import/preview`,
      this.buildImportFormData(file),
      {
        headers: this.buildAuthHeaders(),
      },
    );
  }

  confirmImport(
    file: File,
  ): Observable<TradeImportConfirmResponse> {
    return this.api.post<
      TradeImportConfirmResponse,
      FormData
    >(
      `${this.tradesPath}/import/confirm`,
      this.buildImportFormData(file),
      {
        headers: this.buildAuthHeaders(),
      },
    );
  }

  getById(
    tradeId: string,
  ): Observable<Trade> {
    return this.api.get<Trade>(
      `${this.tradesPath}/${tradeId}`,
      {
        headers: this.buildAuthHeaders(),
      },
    );
  }

  update(
    tradeId: string,
    payload: UpdateTradeRequest,
  ): Observable<Trade> {
    return this.api.patch<
      Trade,
      UpdateTradeRequest
    >(
      `${this.tradesPath}/${tradeId}`,
      payload,
      {
        headers: this.buildAuthHeaders(),
      },
    );
  }


  delete(
    tradeId: string,
  ): Observable<void> {
    return this.api.delete<void>(
      `${this.tradesPath}/${tradeId}`,
      {
        headers: this.buildAuthHeaders(),
      },
    );
  }

  uploadImport<T>(stage: 'preview' | 'confirm', file: File): Observable<HttpEvent<T>> {
    return this.http.post<T>(`${environment.apiBaseUrl}${this.tradesPath}/import/${stage}`,
      this.buildImportFormData(file), {
        headers: this.buildAuthHeaders(), observe: 'events', reportProgress: true,
      });
  }

  private buildImportFormData(
    file: File,
  ): FormData {
    const formData = new FormData();

    formData.append('file', file);

    return formData;
  }

  private buildAuthHeaders(): HttpHeaders {
    this.authService.restoreSession();

    const accessToken =
      this.authService.getAccessToken();

    return new HttpHeaders(
      accessToken
        ? {
            Authorization:
              `Bearer ${accessToken}`,
          }
        : {},
    );
  }
}