import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

type Primitive = string | number | boolean;
type QueryParams = Record<string, Primitive | ReadonlyArray<Primitive> | null | undefined>;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiBaseUrl;

  get<T>(path: string, options?: { params?: QueryParams; headers?: HttpHeaders }): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), {
      params: this.buildParams(options?.params),
      headers: options?.headers
    });
  }

  post<TResponse, TBody>(
    path: string,
    body: TBody,
    options?: { params?: QueryParams; headers?: HttpHeaders }
  ): Observable<TResponse> {
    return this.http.post<TResponse>(this.buildUrl(path), body, {
      params: this.buildParams(options?.params),
      headers: options?.headers
    });
  }

  private buildUrl(path: string): string {
    return `${this.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private buildParams(params?: QueryParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) {
        continue;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          httpParams = httpParams.append(key, String(item));
        });
        continue;
      }

      httpParams = httpParams.set(key, String(value));
    }

    return httpParams;
  }
}
