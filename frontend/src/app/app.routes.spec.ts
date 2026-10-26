import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { AuthService } from './core/auth/services/auth.service';
import { signal } from '@angular/core';

describe('Application Routing', () => {
  let router: Router;

  // Mock de AuthService para controlar autenticación y roles en las pruebas de rutas
  const mockIsAuthenticated = signal<boolean>(false);
  const mockUserRoles = signal<string[]>([]);

  const mockAuthService = {
    isAuthenticated: mockIsAuthenticated,
    hasRole: (role: string) => mockUserRoles().includes(role),
    hasAnyRole: (roles: string[]) => roles.some(r => mockUserRoles().includes(r)),
    getToken: () => (mockIsAuthenticated() ? 'fake-jwt-token' : null)
  };

  beforeEach(async () => {
    mockIsAuthenticated.set(false);
    mockUserRoles.set([]);

    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('debe redirigir de "" a "/parties/catalogo"', async () => {
    await router.navigateByUrl('');
    expect(router.url).toBe('/parties/catalogo');
  });

  it('debe navegar a "/auth/login"', async () => {
    await router.navigateByUrl('/auth/login');
    expect(router.url).toBe('/auth/login');
  });

  it('debe redirigir de "/auth" a "/auth/login"', async () => {
    await router.navigateByUrl('/auth');
    expect(router.url).toBe('/auth/login');
  });

  it('debe navegar a "/parties/catalogo" de manera pública (sin sesión)', async () => {
    await router.navigateByUrl('/parties/catalogo');
    expect(router.url).toBe('/parties/catalogo');
  });

  it('debe bloquear "/tickets/my-tickets" si no está autenticado y redirigir a "/auth/login"', async () => {
    mockIsAuthenticated.set(false);
    await router.navigateByUrl('/tickets/my-tickets');
    expect(router.url).toContain('/auth/login');
  });

  it('debe permitir navegar a "/tickets/my-tickets" si el usuario está autenticado', async () => {
    mockIsAuthenticated.set(true);
    await router.navigateByUrl('/tickets/my-tickets');
    expect(router.url).toBe('/tickets/my-tickets');
  });

  it('debe bloquear "/parties/new" si el usuario no tiene rol de organizador/admin', async () => {
    mockIsAuthenticated.set(true);
    mockUserRoles.set(['ROLE_USER']);

    await router.navigateByUrl('/parties/new');
    expect(router.url).toBe('/parties/catalogo');
  });

  it('debe permitir acceder a "/parties/new" si el usuario tiene ROLE_ORGANIZATOR', async () => {
    mockIsAuthenticated.set(true);
    mockUserRoles.set(['ROLE_ORGANIZATOR']);

    await router.navigateByUrl('/parties/new');
    expect(router.url).toBe('/parties/new');
  });

  it('debe navegar a NotFound si la ruta no existe', async () => {
    await router.navigateByUrl('/ruta-inexistente-xyz');
    expect(router.url).toBe('/ruta-inexistente-xyz');
  });
});
