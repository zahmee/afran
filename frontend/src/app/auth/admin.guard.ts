import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.ensureUser();

  if (auth.isLoggedIn() && auth.user()?.role === 'admin') {
    return true;
  }
  return router.createUrlTree(['/dashboard']);
};
