// frontend/src/app/core/auth/services/auth.service.ts

import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthRequest, AuthResponse, JwtPayload, NewUserRequest, UserSession } from '../models/auth.models';

const TOKEN_KEY = 'voy_jwt_session';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = '/api/auth'; // O configurado vía environment


  private readonly _currentUser = signal<UserSession | null>(this.loadSessionFromStorage());
  
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly userRoles = computed(() => this._currentUser()?.roles ?? []);

  //Autenticación contra /api/auth/login
  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.saveTokenAndInitializeSession(res.token);
      })
    );
  }

  //Registro de nuevo usuario contra /api/auth/register
  register(userData: NewUserRequest): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/register`, userData);
  }

  //Cierre de sesión y limpieza de estado
  logout(redirectToLogin: boolean = true): void {
    localStorage.removeItem(TOKEN_KEY);
    this._currentUser.set(null);
    if (redirectToLogin) {
      this.router.navigate(['/auth/login']);
    }
  }

  //Obtiene el token crudo para el interceptor HTTP
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  //Valida si el usuario actual tiene un rol específico
  //@param role Nombre del rol (ej: 'ROLE_ORGANIZATOR' o 'ROLE_ADMIN')
  hasRole(role: string): boolean {
    return this.userRoles().includes(role);
  }

  //Valida si el usuario actual tiene al menos uno de los roles provistos
  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  // --- Métodos privados de soporte ---
  private saveTokenAndInitializeSession(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    const session = this.decodeTokenToSession(token);
    this._currentUser.set(session);
  }

  private loadSessionFromStorage(): UserSession | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const session = this.decodeTokenToSession(token);
    if (!session || Date.now() >= session.expiresAt) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return session;
  }

  private decodeTokenToSession(token: string): UserSession | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      // Decodificación base64url compatible con navegador
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = decodeURIComponent(
        atob(payloadBase64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload: JwtPayload = JSON.parse(payloadJson);

      return {
        userId: payload.userId ?? '',
        username: payload.sub,
        roles: payload.roles ?? [],
        token: token,
        expiresAt: payload.exp * 1000 // Convertir a milisegundos
      };
    } catch {
      return null;
    }
  }
}