import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="navbar">
      <nav class="nav-container">
        <a routerLink="/" class="logo">BEX Editor</a>
        
        <div class="nav-links">
          <a routerLink="/">Home</a>
          
          @if (!authService.isAuthenticated()) {
            <a routerLink="/login">Login</a>
            <a routerLink="/register">Register</a>
          } @else {
            <a routerLink="/report">Write Report</a>
            <button class="logout-btn" (click)="authService.logout()">Logout</button>
          }
        </div>
      </nav>
    </header>

    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: `
    .navbar { background: #333; color: white; padding: 1rem; }
    .nav-container { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
    .logo { font-weight: bold; font-size: 1.5rem; text-decoration: none; color: white; }
    .nav-links { display: flex; gap: 1.5rem; align-items: center; }
    .nav-links a { color: #ccc; text-decoration: none; }
    .nav-links a:hover { color: white; }
    .logout-btn { background: #e53935; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .main-content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  public readonly authService = inject(AuthService);
}