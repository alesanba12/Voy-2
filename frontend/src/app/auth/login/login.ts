import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { form, FormField, required } from '@angular/forms/signals';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly loginModel = signal({
    username: '',
    password: '',
  });

  readonly loginForm = form(this.loginModel, (schema) => {
    required(schema.username, { message: 'El usuario es obligatorio.' });
    required(schema.password, { message: 'La contraseña es obligatoria.' });
  });

  readonly showPassword = signal(false);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (this.loginForm().invalid()) {
      this.loginForm.username().markAsTouched();
      this.loginForm.password().markAsTouched();
      return;
    }

    const credentials = this.loginForm().value();
  }
}