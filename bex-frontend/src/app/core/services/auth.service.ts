import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = environment.apiUrl;

  #token = signal<string | null>(null);
  isAuthenticated = computed(() => !!this.#token());

  getToken(): string | null {
    return this.#token();
  }

  login(username: string, password: string) {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.http.post(this.API_URL + '/login', formData, { responseType: 'text' }).pipe(
      tap(token => this.#token.set(token))
    );
  }

register(data: FormData) {
  return this.http.post(`${this.API_URL}/register`, data, { responseType: 'text' });
}

  logout(): void {
    this.#token.set(null);
    
    this.router.navigate(['/login']);
  }
}
