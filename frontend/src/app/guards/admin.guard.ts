import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('vio_token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const role = authService.getRole();
  if (role !== 'ADMIN') {
    router.navigate(['/']);
    return false;
  }

  return true;
};