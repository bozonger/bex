import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, Observable } from 'rxjs';
import { LoginCredentials, LoginResponse } from '../interfaces/auth.interfaces';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  private logoutTimer?: ReturnType<typeof setTimeout>;

  private readonly loggedInSubject = new BehaviorSubject<boolean>(
    this.hasValidToken()
  );
  readonly isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor() {
    const expires = localStorage.getItem('jwt_expires');
    if (expires) {
      this.startLogoutTimer(new Date(expires));
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(res => {
          this.setSession(res);
          this.loggedInSubject.next(true);
        })
      );
  }

  register(credentials: LoginCredentials): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/register`, credentials);
  }

  logout(): void {
    console.log('[Auth] logout EXECUTED');
    if (!this.loggedInSubject.value) {
      return;
    }

    localStorage.removeItem('jwt_token');
    localStorage.removeItem('jwt_expires');

    this.clearLogoutTimer();
    this.loggedInSubject.next(false);
  }

  /**
   * ⚠️ Use only in guards or initialization logic,
   * NOT directly in templates.
   */
  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  // ──────────────────────────────
  // Internal helpers
  // ──────────────────────────────

  private setSession(auth: LoginResponse): void {
    localStorage.setItem('jwt_token', auth.token);

    const expiresAt = this.getTokenExpiration(auth.token);

    if (!expiresAt) {
      console.error('[Auth] Could not read token expiration');
      this.logout();
      return;
    }

    localStorage.setItem('jwt_expires', expiresAt.toISOString());
    this.startLogoutTimer(expiresAt);
  }

  private hasValidToken(): boolean {
    const expires = localStorage.getItem('jwt_expires');
    return !!expires && new Date(expires) > new Date();
  }

  private startLogoutTimer(expiresAt: Date): void {
    const expiresInMs = expiresAt.getTime() - Date.now();

    console.log('[Auth] logout scheduled in ms:', expiresInMs);

    if (expiresInMs <= 0) {
      this.logout();
      return;
    }

    this.clearLogoutTimer();

    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, expiresInMs);
  }

  private clearLogoutTimer(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = undefined;
    }
  }

  private getTokenExpiration(token: string): Date | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(base64Url.length + (4 - base64Url.length % 4) % 4, '=');

      const payload = JSON.parse(atob(base64));

      if (!payload.exp) {
        return null;
      }

      console.log('[Auth] JWT exp:', new Date(payload.exp * 1000));

      return new Date(payload.exp * 1000);
    } catch (err) {
      console.error('[Auth] Invalid JWT payload', err);
      return null;
    }
  }
}