import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const loggedinGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn =>
      isLoggedIn
        ? router.createUrlTree(['/write-report'])
        : true
    )
  );
};