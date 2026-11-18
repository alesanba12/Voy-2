// frontend/src/app/core/auth/components/register/register.component.ts

import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { form, FormRoot, required, minLength, maxLength, pattern, FormField } from '@angular/forms/signals';
import { AuthService } from '../../core/auth/auth.service';
import { NewUserDto } from '../../user/user';
import { dateBefore } from '../../shared/validators/date.validators';


const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!.,\\\/;_\-<>]).{8,20}$/;

@Component({
  selector: 'app-register',
  imports: [FormRoot, FormField],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string | null>(null);

  readonly registerModel = signal<NewUserDto>({
    username: '',
    email: '',
    bio: '',
    password: '',
    birthdate: ''
  });

  readonly registerForm = form(
    this.registerModel,
    (path) => {
      required(path.username, { message: 'El nombre de usuario es obligatorio' });
      minLength(path.username, 3, { message: 'Mínimo 3 caracteres' });

      required(path.email, { message: 'El correo electrónico es obligatorio' });
      pattern(path.email, EMAIL_REGEX, { message: 'Formato de correo inválido' });

      required(path.password, { message: 'La contraseña es obligatoria' });
      minLength(path.password, 8, { message: 'Mínimo 8 caracteres' });
      maxLength(path.password, 20, { message: 'Máximo 20 caracteres' });
      pattern(path.password, PASSWORD_REGEX, {
        message: 'Mayús, minús, número y símbolo'
      });

      required(path.birthdate, { message: 'La fecha no puede ser nula' });
      dateBefore(path.birthdate, '18-0-0' ,{
        message: 'Debe ser mayor a 18 años'
      });
    },
    {
      submission: {
        action: async () => {
          this.errorMessage.set(null);

          const formValue = this.registerModel();
          const payload: NewUserDto = {
            username: formValue.username.trim(),
            email: formValue.email.trim(),
            password: formValue.password,
            birthdate: formValue.birthdate,
            bio: 'Nuevo en Voy.'
          };

          try {
            await firstValueFrom(this.authService.register(payload));
            this.router.navigate(['/auth/login'], { queryParams: { registered: 'true' } });
          } catch (err: any) {
            this.errorMessage.set(
              err?.error?.message || 'No se pudo completar el registro. Verificá los datos e intentá nuevamente.'
            );
          }
        }
      }
    }
  );

  openDatePicker(input: HTMLInputElement): void {
    input.focus();
    if ('showPicker' in input && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        // Fallback silencioso si el navegador bloquea showPicker()
      }
    }
  }
}