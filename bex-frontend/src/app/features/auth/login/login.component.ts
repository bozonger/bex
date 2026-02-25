import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginCredentials } from '../../../core/interfaces/auth.interfaces';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(false);
  errorMessage = signal('');

  readonly loginForm = this.fb.nonNullable.group({
    username: this.fb.nonNullable.control('', { validators: [Validators.required] }),
    password: this.fb.nonNullable.control('', { validators: [Validators.required] })
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const credentials: LoginCredentials = this.loginForm.getRawValue();

    this.authService
      .login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/report']);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.errorMessage.set(this.getErrorMessage(err));
        }
      });
  }

  private getErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (typeof err.error === 'string' && err.error.trim().length > 0) {
        return err.error;
      }

      if (err.error && typeof err.error === 'object' && 'message' in err.error) {
        const msg = (err.error as { message?: unknown }).message;
        if (typeof msg === 'string' && msg.trim().length > 0) return msg;
      }

      return 'Invalid credentials.';
    }

    return 'Invalid credentials.';
  }
}