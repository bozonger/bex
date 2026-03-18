import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { LoginCredentials } from '../../../core/interfaces/auth.interfaces';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  isLoading = signal(false);
  errorMessage = signal('');

  readonly registerForm = this.fb.nonNullable.group<{
    username: FormControl<string>;
    password: FormControl<string>;
  }>({
    username: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(3)]
    }),
    password: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  onRegister(): void {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const credentials: LoginCredentials = this.registerForm.getRawValue();

    this.auth
      .register(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/login']);
        },
        error: (err: unknown) => {
          this.isLoading.set(false);
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

      if (err.status === 0) return 'No connection to the server.';
      if (err.status === 409) return 'User already exists.';
      if (err.status === 400) return 'Invalid input.';
      return err.message || 'Registration failed.';
    }

    return 'Registration failed.';
  }
}