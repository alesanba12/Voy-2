import { Component, computed, HostListener, inject, input, OnInit, signal } from '@angular/core';
import { UserService } from '../user-service';
import { PartySummaryDto, UserDto, UserFollowDto } from '../user';
import { ActivatedRoute, Router } from '@angular/router';
import { PartyCard } from '../../parties/party-card/party-card';
import { PartyRes } from '../../parties/party';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  imports: [PartyCard],
  selector: 'app-organizer-profile',
  styleUrl: './organizer-profile.css',
  templateUrl: './organizer-profile.html',
})
export class OrganizerProfile implements OnInit {
  private readonly userService = inject(UserService);
  private readonly  route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  private readonly currentUser = signal<UserDto | null | undefined>(undefined);
  private readonly myParties = signal<PartySummaryDto[]>([]);
  private readonly myFollowers = signal<UserFollowDto[]>([]);
  readonly nextPartiesCount = computed(() => this.nextParties().length);
  readonly selectParty = computed(() => this.nextParties()[this.currentSlide()]);
  readonly isHost = computed(
    () => this.currentUser()?.username === this.auth.currentUser()?.username,
  );
 

  async ngOnInit(): Promise<void> {
    const externalId = this.route.snapshot.paramMap.get('externalId')??undefined;    
    if (externalId) {
      try {
        this.userService.getAll(undefined,undefined,externalId).subscribe({
          next:(user)=>{
            this.currentUser.set(user[0]);
          }
        })
      } catch (err) {
        console.error('Error al cargar el usuario por email', err);
        this.currentUser.set(undefined);
      }
    } else {
      this.userService.getCurrentUser().subscribe({
        next: (user) => this.currentUser.set(user),
        error: (err) => console.error('Error al cargar el usuario', err),
      });
    }

    this.userService.listMyParties(externalId).subscribe({
      next: (parties) => {
        this.myParties.set(parties)
      },
      error: () => alert('No hay fiestas cargadas'),
    });

    this.userService.listFollowersList(externalId).subscribe({
      next: (followers) => {
        this.myFollowers.set(followers)
      },
      error: () => alert('No hay seguidores'),
    });

  }
  

  goToUserProfile() {
    this.router.navigateByUrl('/profile/userProfile');
  }

  readonly defaulImage = '/user-alt-1-svgrepo-com.svg';

  //Proximos eventos (carrusel)
  readonly nextParties = computed(() => {
    const parties = this.myPartiesList();
    if (parties.length === 0) return [];

    const now = new Date();
    return parties
      .filter((party) => new Date(party.dateTime) >= now)
      .map((party) => this.mapSummaryToPartyRes(party));
  });

  readonly currentSlide = signal<number>(0);

  nextSlide(): void {
    const total = this.nextPartiesCount();
    this.currentSlide.update((i) => (i < total - 1 ? i + 1 : 0));
  }

  prevSlide(): void {
    const total = this.nextPartiesCount();
    this.currentSlide.update((i) => (i > 0 ? i - 1 : total - 1));
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' && this.visible()) {
      this.prevSlide();
    }
    if (event.key === 'ArrowRight' && this.visible()) {
      this.nextSlide();
    }
  }

  readonly visible = signal<boolean>(true);

  
  //Organizer data
  readonly myFollowersList = computed(() => {
    const followers = this.myFollowers();
    if (!followers || followers.length === 0) return [];
    
    return [...followers].sort((a, b) =>
      a.username.localeCompare(b.username, 'es', { sensitivity: 'base' }),
    );
  });

  readonly myPartiesList = computed(() => {
    const parties = this.myParties();
    if (!parties || parties.length === 0) return [];
    
    const upcoming = [...parties].sort(
      (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime(),
    );
    
    return upcoming;
  });
  
  mapSummaryToPartyRes(dto: PartySummaryDto): PartyRes {
    return {
      externalId: dto.externalId,
      title: dto.title,
      description: dto.description,
      city: dto.city,
      adress: dto.adress,
      price: dto.price,
      dateTime: dto.dateTime,
      // Valores por defecto para los campos que no trae el SummaryDto
      guestLimit: 0,
      partyAccesibility: false,
      tickets: dto.price > 0,
      logicState: true,
      // Mapeo del organizador (prioriza username si existe, sino email)
      organizerName: dto.organizer?.username ?? dto.organizer?.email ?? '',
      coOrganizerName: [],
      // Evita nulls pasándolos a array vacío o string vacío
      tags: dto.tags ?? [],
      imageUrl: dto.imageUrl ?? '',
    };
  }
}
