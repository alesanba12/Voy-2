import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { ModalDialog } from './shared/components/modal-dialog/modal-dialog';
import { Toast } from './shared/components/toast/toast';

@Component({
  imports: [RouterOutlet, Header, Footer, ModalDialog, Toast],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Voy');
  readonly authservice = inject(AuthService);
}
