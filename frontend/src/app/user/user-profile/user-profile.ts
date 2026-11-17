import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PartySummaryDto, UserDto } from '../user';
import { UserService } from '../user-service';
import { Router } from '@angular/router';
import { EditModal } from '../edit-modal/edit-modal';
import { PartyCard } from '../../parties/party-card/party-card';
import { OrganizerModal } from '../organizer-modal/organizer-modal';
import { ToastService } from '../../shared/components/toast/toast-service';

@Component({
  imports: [EditModal, PartyCard, OrganizerModal],
  selector: 'app-user-profile',
  styleUrl: './user-profile.css',
  templateUrl: './user-profile.html',
})
export class UserProfile implements OnInit {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  private readonly currentUser = signal<UserDto | undefined>(undefined);
  private readonly myParties = signal<PartySummaryDto[]>([]);

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => this.currentUser.set(user),
      error: (err) => console.error('Error al cargar el usuario', err),
    });

    this.userService.listFollowedParties().subscribe({
      next:(parties)=>this.myParties.set(parties),
      error: () => {
        this.myParties.set([]);
        this.toastService.show('No se pudieron cargar tus fiestas. Intentá nuevamente.', 'error');
      },
    })
  }

  readonly defaulImage = '/user-alt-1-svgrepo-com.svg';
  goToOrganizerProfile() {
    this.router.navigateByUrl('/profile/organizerProfile');
  }

  //Ventana modal de editar perfil

  readonly isEditModalOpen = signal(false);
  readonly isOrganizerModalOpen = signal(false);

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
