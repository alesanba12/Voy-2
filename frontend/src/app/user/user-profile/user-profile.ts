import { Component, inject, OnInit, signal } from '@angular/core';
import { UserDto } from '../user';
import { UserService } from '../user-service';
import { Router } from '@angular/router';
import { EditModal } from '../edit-modal/edit-modal';

@Component({
  imports: [EditModal],
  selector: 'app-user-profile',
  styleUrl: './user-profile.css',
  templateUrl: './user-profile.html',
})
export class UserProfile implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  private readonly currentUser = signal<UserDto | undefined>(undefined);

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => this.currentUser.set(user),
      error: (err) => console.error('Error al cargar el usuario', err),
    });
  }

  readonly defaulImage = 'assets/default-avatar.png';

  goToOrganizerProfile() {
    this.router.navigateByUrl('/profile/organizerProfile');
  }

  //Ventana modal de editar perfil

  readonly isEditModalOpen = signal(false);

  onProfileUpdated(updatedUser: UserDto): void {
    this.currentUser.set(updatedUser);
    this.userService.notifyProfileUpdated();
    this.isEditModalOpen.set(false);
  }
}
