import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { UserDto } from '../user';
import { UserService } from '../user-service';
import { Router } from '@angular/router';
import { EditModal } from '../edit-modal/edit-modal';
import { PartyCard } from '../../parties/party-card/party-card';
import { PartyRes } from '../../parties/party';

@Component({
  imports: [EditModal,PartyCard],
  selector: 'app-user-profile',
  styleUrl: './user-profile.css',
  templateUrl: './user-profile.html',
})
export class UserProfile implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  private readonly currentUser = signal<UserDto | undefined>(undefined);
  private readonly myParties = signal<PartyRes[]>([]);

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => this.currentUser.set(user),
      error: (err) => console.error('Error al cargar el usuario', err),
    });

    this.userService.listFollowedParties().subscribe({
      next:(parties)=>this.myParties.set(parties),
      error:()=> alert('No hay fiestas cargadas')
    })
  }

  readonly defaulImage = 'https://res.cloudinary.com/dmqsnjyfq/image/upload/v1793632574/voy/perfil/pngegg_xpixlj.png';

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

  //Proximo evento
  readonly nextParty = computed(() => {
    const parties = this.myParties();
    if (!parties || parties.length === 0) return null;

    // Opcional: Si querés ordenarlas por fecha y traer la más cercana a hoy
    const now = new Date();
    const upcoming = parties
      .filter(party => new Date(party.dateTime) >= now)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    return upcoming.length > 0 ? upcoming[0] : null;
  });



}
