import { Component, input, output, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-image-upload',
  styleUrl: './image-upload.css',
  templateUrl: './image-upload.html',
})
export class ImageUpload {
  readonly fieldName = input.required<string>();
  readonly fileChanged = output<{ fieldName: string; file: File | null }>();

  readonly previewUrl = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      this.previewUrl.set(URL.createObjectURL(file));
      
      this.fileChanged.emit({
        fieldName: this.fieldName(),
        file: file
      });
    }
  }
}
