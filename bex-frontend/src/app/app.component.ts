import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly _loggedIn = signal(this.auth.isLoggedIn());
  readonly isLoggedIn = computed(() => this._loggedIn());

  logout(): void {
    this.auth.logout();
    this._loggedIn.set(false);
    this.router.navigate(['/login']);
  }
}