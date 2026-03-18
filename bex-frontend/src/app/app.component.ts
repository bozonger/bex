import {
  Component,
  ChangeDetectionStrategy,
  inject,
  effect
} from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoggedIn = toSignal(this.auth.isLoggedIn$, {
    initialValue: false
  });

  constructor() {
    effect(() => {
      if (!this.isLoggedIn()) {
        this.router.navigateByUrl('/login');
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}