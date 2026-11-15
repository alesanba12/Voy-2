import { Component, inject, input, signal } from '@angular/core';
import { ImageUpload } from '../../shared/components/image-upload/image-upload';
import { UserService } from '../user-service';
import { UserDto } from '../user';

@Component({
  imports: [ImageUpload],
  selector: 'app-edit-modal',
  styleUrl: './edit-modal.css',
  templateUrl: './edit-modal.html',
})
export class EditModal {
  private readonly userService = inject(UserService)

  readonly currentUser = input.required<UserDto>(); //Trae los datos del usuario logeado desde el componente padre

  protected readonly username = signal('');
  protected readonly bio = signal('');
  protected readonly password = signal('');

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      this.username.set(user.username || '');
      this.bio.set(user.bio || '');
    }
  }  

  readonly selectedImageFile = signal<File | null>(null);

  // Captura el archivo emitido por el componente reutilizable
  onFilePicked(event: { fieldName: string; file: File | null }): void {
    if (event.fieldName === 'image') {
      this.selectedImageFile.set(event.file);
    }
  }

  onSubmit(): void {
    const formData = new FormData();

    // Leemos el valor actual de cada signal para armar el FormData
    formData.append('username', this.username());
    formData.append('bio', this.bio());
    formData.append('password', this.password());

    const imageFile = this.selectedImageFile();
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }

    // Llamada al servicio HTTP
    /*
    this.userService.updateUser(formData).subscribe({
      next: (res) => console.log('Perfil actualizado con éxito', res),
      error: (err) => console.error('Error al actualizar', err)
    });
    */
    console.log('FormData listo para enviar:', formData);
  }

}
