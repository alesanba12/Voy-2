import { Component, inject, OnInit, signal } from '@angular/core';
import { UserDto} from '../user';
import { UserService } from '../user-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { EditModal } from '../edit-modal/edit-modal';

@Component({
  imports: [EditModal],
  selector: 'app-user-profile',
  styleUrl: './user-profile.css',
  templateUrl: './user-profile.html',
})
export class UserProfile {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router)

  private readonly currentUser=toSignal<UserDto | undefined>(this.userService.getCurrentUser(),{
    initialValue: undefined
  })
  
  readonly defaulImage = 'assets/default-avatar.png';

  goToOrganizerProfile(){
    this.router.navigateByUrl('/profile/organizerProfile')
  }

  //Ventana modal de editar perfil

  readonly isEditModalOpen = signal(false);
  



 

}

