import { Component, computed, input, model, OnDestroy, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  imports: [],
  selector: 'app-image-upload',
  styleUrl: './image-upload.css',
  templateUrl: './image-upload.html',
})
export class ImageUpload implements FormValueControl<File | null>, OnDestroy {
  readonly value = model<File | null>(null);
  readonly touched = model<boolean>(false);
  readonly currentUrl = input<string | null>(null); // imagen ya guardada (edición)
  readonly fieldName = input<string>('imagen');

  private readonly objectUrl = signal<string | null>(null);

  // Si hay archivo nuevo, muestra ese; si no, la imagen existente
  readonly previewUrl = computed(() => this.objectUrl() ?? this.currentUrl());

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;

    this.revokeObjectUrl();
    this.objectUrl.set(file ? URL.createObjectURL(file) : null);

    this.value.set(file); // esto es lo que actualiza el form
    this.touched.set(true);
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  private revokeObjectUrl(): void {
    const url = this.objectUrl();
    if (url) URL.revokeObjectURL(url);
  }
}


// import { Component, input, model, output, signal } from '@angular/core';
// import { FormValueControl } from '@angular/forms/signals';

// @Component({
//   imports: [],
//   selector: 'app-image-upload',
//   styleUrl: './image-upload.css',
//   templateUrl: './image-upload.html',
// })
// export class ImageUpload implements FormValueControl<File | null> {
//   readonly value = model<File | null>(null);
//   readonly fieldName = input.required<string>();
//   readonly fileChanged = output<{ fieldName: string; file: File | null }>();

//   readonly previewUrl = signal<string | null>(null);

//   onFileSelected(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       const file = input.files[0];
      
//       this.previewUrl.set(URL.createObjectURL(file));
      
//       this.fileChanged.emit({
//         fieldName: this.fieldName(),
//         file: file
//       });
//     }
//   }
// }
