import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../../core/services/api.service';
import { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '../types/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly api = inject(ApiService);
  private readonly authPath = '/auth';

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse, LoginRequest>(`${this.authPath}/login`, payload);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse, RegisterRequest>(`${this.authPath}/register`, payload);
  }

  logout(refreshToken: string): Observable<void> {
    return this.api.post<void, { refreshToken: string }>(`${this.authPath}/logout`, { refreshToken });
  }

  profile(accessToken: string): Observable<UserProfile> {
    return this.api.get<UserProfile>(`${this.authPath}/profile`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${accessToken}`
      })
    });
  }
}
