import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable } from 'rxjs';
import { LoginCredentials } from '../interfaces/auth.interfaces';
import { environment } from '../../../environments/environment.development';

export interface LoginResponse {
  token: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
private readonly API_URL = environment.apiUrl;

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(tap(res => this.setSession(res)));
  }

  register(credentials: LoginCredentials): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/register`, credentials);
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_expires');
  }

  isLoggedIn(): boolean {
    const expires = localStorage.getItem('jwt_expires');
    return !!expires && new Date(expires) > new Date();
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  private setSession(auth: LoginResponse): void {
    localStorage.setItem('jwt_token', auth.token);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + auth.expiresIn);

    localStorage.setItem('jwt_expires', expiresAt.toISOString());
  }
}