import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../core/auth/services/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceSpy: { login: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = {
      login: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: { returnUrl: '/parties' } }
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('debe crearse correctamente con el formulario inválido por defecto', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm.valid).toBe(false);
  });

  it('debe marcar campos como tocados y no llamar a login si el formulario está vacío', () => {
    component.onSubmit();
    expect(component.loginForm.controls.username.touched).toBe(true);
    expect(component.loginForm.controls.password.touched).toBe(true);
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('debe llamar a authService.login y navegar al returnUrl cuando el formulario es válido', () => {
    authServiceSpy.login.mockReturnValue(of({ token: 'fake-jwt' }));

    component.loginForm.setValue({
      username: 'pepito',
      password: 'Password123!'
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      username: 'pepito',
      password: 'Password123!'
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/parties');
    expect(component.isLoading()).toBe(false);
  });

  it('debe mostrar mensaje de error adecuado si el backend responde 401', () => {
    authServiceSpy.login.mockReturnValue(throwError(() => ({ status: 401 })));

    component.loginForm.setValue({
      username: 'usuario_invalido',
      password: 'bad_password'
    });

    component.onSubmit();

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('Usuario o contraseña incorrectos.');
  });
});
