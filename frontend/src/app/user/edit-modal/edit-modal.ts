import { Component, inject, input, output, signal } from '@angular/core';
import { UserService } from '../user-service';
import { UserDto} from '../user';
import { ImageUpload } from '../../shared/components/image-upload/image-upload';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule,ImageUpload],
  selector: 'app-edit-modal',
  styleUrl: './edit-modal.css',
  templateUrl: './edit-modal.html',
})
export class EditModal {
  private readonly userService = inject(UserService)

  readonly currentUser = input.required<UserDto>(); //Trae los datos del usuario logeado desde el componente padre
  readonly userUpdated = output<UserDto>();

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

  // onSubmit(): void {
  //   const formData = new FormData();

  //   // Leemos el valor actual de cada signal para armar el FormData
  //   formData.append('username', this.username());
  //   formData.append('bio', this.bio());
  //   formData.append('password', this.password());

  //   const imageFile = this.selectedImageFile();
  //   if (imageFile) {
  //     formData.append('image', imageFile, imageFile.name);
  //   }

  //   // Llamada al servicio HTTP   
  //   this.userService. updateUser(formData).subscribe({
  //     next: (user) =>{
  //       const conf = confirm('Quiere confirmar los cambios?')
  //       if(conf){
  //         console.log('Perfil actualizado con éxito')
  //         this.userUpdated.emit(user);
  //       }
  //     } ,
  //     error: (err) => console.error('Error al actualizar', err)
  //   });//chequqer que este bien configurado esto
    
  //   console.log('FormData listo para enviar:', formData);
  // }

  onSubmit(): void {
    const formData = new FormData();

    formData.append('username', this.username());
    formData.append('bio', this.bio());

    // Solo mandamos la contraseña si el usuario escribió una nueva
    const pwd = this.password();
    if (pwd && pwd.trim().length > 0) {
      formData.append('password', pwd);
    }

    // Adjuntamos la imagen si se seleccionó una
    const imageFile = this.selectedImageFile();
    if (imageFile) {
      formData.append('image', imageFile, imageFile.name);
    }

    this.userService.updateUser(formData).subscribe({
      next: (user) => {
        console.log('¡Perfil actualizado con éxito en el servidor!', user);
        this.userUpdated.emit(user);
      },
      error: (err) => {
        // Mirá la consola del navegador para ver el detalle exacto que devuelve Spring Boot
        console.error('Error detallado del backend al actualizar:', err);
      }
    });
  }

}
