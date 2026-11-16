import { Component, effect, input, output, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-image-upload',
  styleUrl: './image-upload.css',
  templateUrl: './image-upload.html',
})
export class ImageUpload {
  readonly fieldName = input.required<string>();

  // NUEVO: opcional, no rompe a quienes no lo pasan
  readonly currentUrl = input<string | null>(null);

  readonly fileChanged = output<{ fieldName: string; file: File | null }>();

  readonly previewUrl = signal<string | null>(null);

  constructor() {
    // Si llega una URL existente (modo edición) y no hay preview local, la mostramos
    effect(() => {
      const url = this.currentUrl();
      if (url && !this.previewUrl()) {
        this.previewUrl.set(url);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.previewUrl.set(URL.createObjectURL(file));

      this.fileChanged.emit({
        fieldName: this.fieldName(),
        file: file,
      });
    }
  }
}