import {
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PartyClient } from '../party-service';
import { PartyRes } from '../party';
import { EventDatePipe, PartyCard } from '../party-card/party-card';
import { httpResource } from '@angular/common/http';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap, timer } from 'rxjs';
import { UserService } from '../../user/user-service';
import { PartySummaryDto, UserDto, UserFollowDto } from '../../user/user';

@Component({
  imports: [RouterLink, EventDatePipe, PartyCard],
  selector: 'app-party-detail',
  styleUrl: './party-detail.css',
  templateUrl: './party-detail.html',
})
export class PartyDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly partyClient = inject(PartyClient);
  private readonly userService = inject(UserService);

  protected readonly organizador = rxResource({
    params: () => this.party()?.organizerName,
    stream: ({ params: email }) =>
      this.userService
        .getAll(undefined, email)
        .pipe(map((users) => users.find((u) => u.email === email) ?? null)),
  });

  private readonly partyId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))), {
    initialValue: this.route.snapshot.paramMap.get('id'),
  });

  private readonly partyResource = httpResource<PartyRes>(() => {
    const id = this.partyId();
    return id ? `/api/parties/${id}` : undefined;
  });

  private readonly partyOverride = signal<PartyRes | undefined>(undefined);
  protected readonly party = computed(() => this.partyOverride() ?? this.partyResource.value());

  constructor() {
    effect(() => {
      this.partyId();
      untracked(() => this.partyOverride.set(undefined));
    });
    this.userService
      .listFollowedParties()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (list) => this.followedParties.set(list),
        error: () => this.followedParties.set([]), // sin sesión: nada seguido
      });
    this.userService
      .listFollowList()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (list) => this.followedUsers.set(list),
        error: () => this.followedUsers.set([]),
      });
  }

  private readonly ciudad = computed(() => this.party()?.city);
  private readonly fecha = computed(() => this.party()?.dateTime);

  protected readonly partiesResource = httpResource<PartyRes[]>(() => ({
    url: '/api/parties',
    params: this.buildParams({
      partyId: null,
      organizerId: null,
      title: null,
      city: this.ciudad() ?? null,
      from: this.fecha()?.substring(0, 10) ?? null,
      to: this.addDaysTo(this.fecha(), 5) ?? null,
    }),
  }));

  protected readonly recomendedparties = computed(() => {
    const parties = this.partiesResource.value() ?? [];
    const party = this.party();
    const candidates = parties.filter((p) => p.externalId !== this.partyId());

    if (!party) return candidates.slice(0, 4);

    const currentTags = new Set(party.tags);

    const similar = candidates
      .map((p) => ({
        party: p,
        score: p.tags.filter((tag) => currentTags.has(tag)).length,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.party);

    // Si faltan para llegar a 4, se completa con las que no coinciden en tags
    const rest = candidates.filter((p) => !similar.includes(p));

    return [...similar, ...rest].slice(0, 4);
  });

  // Saca los filtros vacíos para que no viajen como "title=" en la URL
  private buildParams(filters: Record<string, string | null>) {
    return Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== null && v !== ''),
    ) as Record<string, string>;
  }
  private addDaysTo(dateTime: string | undefined, days: number): string | null {
    if (!dateTime) return null;
    const [y, m, d] = dateTime.substring(0, 10).split('-').map(Number);
    const date = new Date(y, m - 1, d); // hora local, sin problemas de zona horaria
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-CA'); // yyyy-MM-dd
  }

  protected readonly copied = signal(false);

  protected async share() {
    const url = window.location.href;
    const title = this.party()?.title ?? 'Evento';

    // En celulares abre el menú nativo (WhatsApp, Instagram, etc.)
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // el usuario canceló: no hace nada
        return;
      }
    }

    // En computadoras: copia al portapapeles
    await this.copyToClipboard(url);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  private async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Respaldo para navegadores viejos o contextos sin permiso
      const input = document.createElement('textarea');
      input.value = text;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
  }

  protected readonly MIN_TICKETS = 1;
  protected readonly MAX_TICKETS = 5;
  protected readonly quantity = signal(1);

  protected readonly maxQuantity = computed(() =>
    Math.min(this.MAX_TICKETS, this.party()?.guestLimit ?? this.MAX_TICKETS),
  );

  protected readonly total = computed(() => (this.party()?.price ?? 0) * this.quantity());

  protected changeQuantity(delta: number) {
    const next = Math.trunc(this.quantity() + delta);
    this.quantity.set(Math.min(this.maxQuantity(), Math.max(this.MIN_TICKETS, next)));
  }

  protected buy() {}

  // Lista de eventos que sigue el usuario logueado
  private readonly followedParties = signal<PartySummaryDto[]>([]);

  // Se recalcula solo cuando cambia la lista o el evento actual (incluye navegar entre sugerencias)
  protected readonly followParty = computed(() =>
    this.followedParties().some((p) => p.externalId === this.partyId()),
  );

  protected readonly followLoading = signal(false);

  protected toggleFollow() {
    const id = this.partyId();
    if (!id || this.followLoading()) return;

    this.followLoading.set(true);
    this.userService.alterFollowParty(id).subscribe({
      next: (followed) => {
        this.followedParties.set(followed);
        this.followLoading.set(false);
      },
      error: (err) => {
        this.followLoading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']); // ajustá a tu ruta de login
        } else {
          alert('No se pudo actualizar el seguimiento. Intentá nuevamente.');
        }
      },
    });
  }

  private readonly followedUsers = signal<UserFollowDto[]>([]);

  protected readonly followOrganizer = computed(() => {
    const org = this.organizador.value();
    return !!org && this.followedUsers().some((u) => u.externalId === org.externalId);
  });

  protected readonly followOrganizerLoading = signal(false);

  protected toggleFollowOrganizer() {
    const org = this.organizador.value();
    if (!org || this.followOrganizerLoading()) return;

    this.followOrganizerLoading.set(true);
    this.userService.alterFollowUser(org.externalId).subscribe({
      next: (list) => {
        this.followedUsers.set(list);
        this.followOrganizerLoading.set(false);
      },
      error: (err) => {
        this.followOrganizerLoading.set(false);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']); // ajustá a tu ruta
        } else {
          alert('No se pudo actualizar el seguimiento. Intentá nuevamente.');
        }
      },
    });
  }

  // Usuario logueado (null si no hay sesión)
  private readonly currentUser = toSignal(
    this.userService.getCurrentUser().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  // Solo el creador ve el panel. organizerName hoy guarda el email.
  protected readonly isOwner = computed(() => {
    const user = this.currentUser();
    const p = this.party();
    return !!user && !!p && user.email === p.organizerName;
  });

  protected readonly partners = rxResource({
    params: () => {
      const list = this.party()?.coOrganizerName;
      return list?.length ? list : undefined;
    },
    stream: ({ params: emails }) =>
      forkJoin(
        emails.map((email) =>
          this.userService
            .getAll(undefined, email)
            .pipe(map((users) => users.find((u) => u.email === email) ?? null)),
        ),
      ).pipe(map((users) => users.filter((u): u is UserDto => u !== null))),
  });

  protected readonly adding = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly partnerLoading = signal(false);

  // El timer(300) funciona como debounce: rxResource cancela el stream anterior al cambiar el término
  protected readonly searchResults = rxResource({
    params: () => {
      const term = this.searchTerm().trim();
      return term.length >= 2 ? term : undefined;
    },
    stream: ({ params: term }) =>
      timer(300).pipe(
        switchMap(() => this.userService.getAll(term)),
        map((users) =>
          users.filter(
            (u) =>
              u.email !== this.party()?.organizerName && // no el creador
              !(this.party()?.coOrganizerName ?? []).includes(u.email), // no los ya agregados
          ),
        ),
      ),
  });

  protected initials(name: string) {
    return name.slice(0, 2).toUpperCase();
  }

  protected addPartner(user: UserDto) {
    const id = this.partyId();
    if (!id || this.partnerLoading()) return;

    this.partnerLoading.set(true);
    this.partyClient.addCoOrganizer(id, user.externalId).subscribe({
      next: (updated) => {
        this.partyOverride.set(updated);
        this.searchTerm.set('');
        this.adding.set(false);
        this.partnerLoading.set(false);
      },
      error: () => {
        this.partnerLoading.set(false);
        alert('No se pudo agregar al partner. Intentá nuevamente.');
      },
    });
  }

  protected removePartner(user: UserDto) {
    const id = this.partyId();
    if (!id || this.partnerLoading()) return;
    if (!confirm(`¿Quitar a ${user.username} como partner del evento?`)) return;

    this.partnerLoading.set(true);
    this.partyClient.removeCoOrganizer(id, user.externalId).subscribe({
      next: (updated) => {
        this.partyOverride.set(updated);
        this.partnerLoading.set(false);
      },
      error: () => {
        this.partnerLoading.set(false);
        alert('No se pudo quitar al partner. Intentá nuevamente.');
      },
    });
  }
}
