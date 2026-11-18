import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AuthRequest } from '../../core/auth/auth.models';

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly showPassword = signal(false);

  readonly loginModel = signal<AuthRequest>({
    username: '',
    password: '',
  });

  readonly loginForm = form(
    this.loginModel,
    (schemaPath) => {
      required(schemaPath.username, { message: 'El usuario es obligatorio.' });
      required(schemaPath.password, { message: 'La contraseña es obligatoria.' });
    },
    {
      submission: {
        action: async (field) => {
          try {
            await firstValueFrom(this.authService.login(field().value()));

            const rawReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
            // Validación básica para evitar open-redirect a dominios externos
            const targetUrl =
              rawReturnUrl && rawReturnUrl.startsWith('/') && !rawReturnUrl.startsWith('//')
                ? rawReturnUrl
                : '/';

            await this.router.navigateByUrl(targetUrl);
            return;
          } catch (err: any) {
            return {
              kind: 'serverError',
              message: 'Usuario o contraseña incorrectos.',
            };
          }
        },
        onInvalid: (field) => {
          field().errorSummary()[0]?.fieldTree().focusBoundControl();
        },
      },
    }
  );

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}