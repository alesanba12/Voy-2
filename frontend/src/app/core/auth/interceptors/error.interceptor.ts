import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 Unauthorized: token expirado o credenciales inválidas (excepto en el login mismo)
      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        authService.logout(false);
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url }
        });
      }

      // 403 Forbidden: rol o permiso insuficiente
      if (error.status === 403) {
        console.warn('Acceso denegado: permisos insuficientes.');
      }

      return throwError(() => error);
    })
  );
};
