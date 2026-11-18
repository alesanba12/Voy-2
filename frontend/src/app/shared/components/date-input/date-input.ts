import { Component, computed, input, model, output, signal } from '@angular/core';

@Component({
  selector: 'app-date-input',
  imports : [],
  templateUrl: './date-input.html',
  styleUrl: './date-input.css',
})
export class DateInputComponent {
  // Parámetros configurables
  label = input<string>('FECHA');
  placeholder = input<string>('mm/dd/yyyy');
  required = input<boolean>(false);
  minDate = input<string | null>(null);
  maxDate = input<string | null>(null);

  // Mensajes personalizables
  requiredMessage = input<string>('La fecha no puede ser nula');
  minDateMessage = input<string>('La fecha debe ser posterior a la permitida');
  maxDateMessage = input<string>('La fecha debe ser anterior a la permitida');

  // Estado reactivo bidireccional (Two-way binding con [(value)])
  value = model<string>('');
  touched = signal<boolean>(false);
  submitted = input<boolean>(false);

  // Emisor de validez para que el formulario padre sepa si este campo cumple las reglas
  validChange = output<boolean>();

  // Cálculo reactivo de error
  errorMessage = computed<string | null>(() => {
    const val = this.value().trim();

    if (this.required() && !val) {
      return this.requiredMessage();
    }

    if (val) {
      const selected = new Date(val + 'T00:00:00');
      if (isNaN(selected.getTime())) {
        return 'Fecha inválida';
      }

      const max = this.maxDate();
      if (max) {
        const maxObj = new Date(max + 'T00:00:00');
        // Si maxDate es hoy, exige que sea estrictamente anterior (@Past)
        if (selected >= maxObj) {
          return this.maxDateMessage();
        }
      }

      const min = this.minDate();
      if (min) {
        const minObj = new Date(min + 'T00:00:00');
        if (selected <= minObj) {
          return this.minDateMessage();
        }
      }
    }

    return null;
  });

  showError = computed(() => (this.touched() || this.submitted()) && this.errorMessage() !== null);

  onInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    this.value.set(inputEl.value);
    this.validChange.emit(this.errorMessage() === null);
  }

  onBlur(): void {
    this.touched.set(true);
    this.validChange.emit(this.errorMessage() === null);
  }
}