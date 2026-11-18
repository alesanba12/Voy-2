import { Component, inject, output, signal } from '@angular/core';
import { UserService } from '../user-service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../shared/components/toast/toast-service';

@Component({
  imports: [FormsModule],
  selector: 'app-organizer-modal',
  styleUrl: './organizer-modal.css',
  templateUrl: './organizer-modal.html',
})
export class OrganizerModal {
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  
  // Señales para manejar el estado del formulario con Signals
  readonly dniFrontFile = signal<File | null>(null);
  readonly dniBackFile = signal<File | null>(null);
  readonly additionalInfo = signal<string>('');

  // Evento que avisa al componente padre cuando se envía con éxito
  readonly requestSent = output<void>();
  

  // Capturar archivo del frente del DNI
  onFrontFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.dniFrontFile.set(file);
    }
  }

  // Capturar archivo del dorso del DNI
  onBackFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.dniBackFile.set(file);
    }
  }

  // Envío del formulario
  onSubmit(): void {
    const front = this.dniFrontFile();
    const back = this.dniBackFile();

    if (!front || !back) {
      this.toastService.show('Por favor, subí ambas fotos de tu DNI (frente y dorso).', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('dniFront', front, front.name);
    formData.append('dniBack', back, back.name);
    
    if (this.additionalInfo()) {
      formData.append('additionalInfo', this.additionalInfo());
    }

    // Llamada al servicio encargado de enviar la solicitud al backend
    this.userService.requestVerification(formData).subscribe({
      next: () => {
        console.log('Solicitud enviada con éxito:');
        this.requestSent.emit();
      },
      error: () => {
        console.error('Error al enviar la solicitud de organizador:');
      }
    });
  }
}
