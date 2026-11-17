import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AuthRequest } from '../../core/auth/auth.models';

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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
            await this.router.navigate(['/']);
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