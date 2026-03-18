import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SessionRedirectService {
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.auth.isLoggedIn$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        this.router.navigateByUrl('/login');
      }
    });
  }
}
