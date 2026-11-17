import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap, timer } from 'rxjs';
import { PartyClient } from '../party-service';
import { PartyRes } from '../party';
import { EventDatePipe, PartyCard } from '../party-card/party-card';
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

  // ───────── Evento ─────────
  private readonly partyId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))), {
    initialValue: this.route.snapshot.paramMap.get('id'),
  });

  private readonly partyResource = httpResource<PartyRes>(() => {
    const id = this.partyId();
    return id ? `/api/parties/${id}` : undefined;
  });

  // Party devuelta por add/remove de partners: pisa a la del GET hasta cambiar de evento
  private readonly partyOverride = signal<PartyRes | undefined>(undefined);
  protected readonly party = computed(() => this.partyOverride() ?? this.partyResource.value());

  constructor() {
    // Al navegar a otro evento se reinicia el estado local
    effect(() => {
      this.partyId();
      untracked(() => {
        this.partyOverride.set(undefined);
        this.quantity.set(1);
      });
    });

    effect(() => {
      if (this.partyResource.error()) {
        alert('Evento no encontrado, redirigiendo al listado de eventos');
        this.router.navigate(['/parties/catalogo']);
      }
    });

    // Sin sesión: estas listas fallan y simplemente quedan vacías
    this.userService
      .listFollowedParties()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (list) => this.followedParties.set(list),
        error: () => this.followedParties.set([]),
      });

    this.userService
      .listFollowList()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (list) => this.followedUsers.set(list),
        error: () => this.followedUsers.set([]),
      });
  }

  // ───────── Organizador ─────────
  protected readonly organizador = rxResource({
    params: () => this.party()?.organizerName,
    stream: ({ params: email }) =>
      this.userService
        .getAll(undefined, email)
        .pipe(map((users) => users.find((u) => u.email === email) ?? null)),
  });

  private readonly currentUser = toSignal(
    this.userService.getCurrentUser().pipe(catchError(() => of(null))),
    { initialValue: null },
  );

  // organizerName hoy guarda el email
  protected readonly isOwner = computed(() => {
    const user = this.currentUser();
    const party = this.party();
    return !!user && !!party && user.email === party.organizerName;
  });

  // ───────── Seguir evento (corazón y botón "Unirme") ─────────
  private readonly followedParties = signal<PartySummaryDto[]>([]);
  protected readonly followLoading = signal(false);

  protected readonly followParty = computed(() =>
    this.followedParties().some((p) => p.externalId === this.partyId()),
  );
  protected toggleFollow() {
    const id = this.partyId();
    if (!id || this.isOwner() || this.followLoading()) return;

    this.followLoading.set(true);
    this.userService.alterFollowParty(id).subscribe({
      next: (list) => {
        this.followedParties.set(list);
        this.followLoading.set(false);
      },
      error: (err) => {
        this.followLoading.set(false);
        this.handleFollowError(err);
      },
    });
  }

  // ───────── Seguir organizador ─────────
  private readonly followedUsers = signal<UserFollowDto[]>([]);
  protected readonly followOrganizerLoading = signal(false);

  protected readonly followOrganizer = computed(() => {
    const org = this.organizador.value();
    return !!org && this.followedUsers().some((u) => u.externalId === org.externalId);
  });

  protected toggleFollowOrganizer() {
    const org = this.organizador.value();
    if (!org || this.isOwner() || this.followOrganizerLoading()) return;

    this.followOrganizerLoading.set(true);
    this.userService.alterFollowUser(org.externalId).subscribe({
      next: (list) => {
        this.followedUsers.set(list);
        this.followOrganizerLoading.set(false);
      },
      error: (err) => {
        this.followOrganizerLoading.set(false);
        this.handleFollowError(err);
      },
    });
  }

  private handleFollowError(err: { status?: number }) {
  if (err.status === 401) {
    this.router.navigate(['/login']); // ajustá a tu ruta
  } else {
    alert('No se pudo actualizar el seguimiento. Intentá nuevamente.');
  }
}

  // ───────── Tickets ─────────
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

  // ───────── Partners (coorganizadores) ─────────
  protected readonly adding = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly partnerLoading = signal(false);

  protected readonly partners = rxResource({
    params: () => {
      const emails = this.party()?.coOrganizerName;
      return emails?.length ? emails : undefined;
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

  // timer(300) hace de debounce: rxResource cancela el stream anterior al cambiar el término
  protected readonly searchResults = rxResource({
    params: () => {
      const term = this.searchTerm().trim();
      return term.length >= 2 ? term : undefined;
    },
    stream: ({ params: term }) =>
      timer(300).pipe(
        switchMap(() => this.userService.getAll(term)),
        map((users) => users.filter((u) => this.canBePartner(u))),
      ),
  });

  private canBePartner(user: UserDto) {
    const party = this.party();
    return user.email !== party?.organizerName && !party?.coOrganizerName.includes(user.email);
  }

  protected initials(name: string) {
    return name.slice(0, 2).toUpperCase();
  }

  protected addPartner(user: UserDto) {
    this.updatePartners(
      (id) => this.partyClient.addCoOrganizer(id, user.externalId),
      'No se pudo agregar al partner. Intentá nuevamente.',
      () => {
        this.searchTerm.set('');
        this.adding.set(false);
      },
    );
  }

  protected removePartner(user: UserDto) {
    if (!confirm(`¿Quitar a ${user.username} como partner del evento?`)) return;
    this.updatePartners(
      (id) => this.partyClient.removeCoOrganizer(id, user.externalId),
      'No se pudo quitar al partner. Intentá nuevamente.',
    );
  }

  private updatePartners(
    request: (partyId: string) => ReturnType<PartyClient['addCoOrganizer']>,
    errorMessage: string,
    onSuccess?: () => void,
  ) {
    const id = this.partyId();
    if (!id || this.partnerLoading()) return;

    this.partnerLoading.set(true);
    request(id).subscribe({
      next: (updated) => {
        this.partyOverride.set(updated);
        this.partnerLoading.set(false);
        onSuccess?.();
      },
      error: () => {
        this.partnerLoading.set(false);
        alert(errorMessage);
      },
    });
  }

  // ───────── Recomendaciones ─────────
  protected readonly partiesResource = httpResource<PartyRes[]>(() => {
    const party = this.party();
    if (!party) return undefined; // no pedir hasta conocer ciudad y fecha

    return {
      url: '/api/parties',
      params: this.buildParams({
        city: party.city,
        from: party.dateTime.substring(0, 10),
        to: this.addDaysTo(party.dateTime, 5),
      }),
    };
  });

  protected readonly recomendedparties = computed(() => {
    const party = this.party();
    const candidates = (this.partiesResource.value() ?? []).filter(
      (p) => p.externalId !== this.partyId(),
    );
    if (!party) return [];

    const currentTags = new Set(party.tags);
    const similar = candidates
      .map((p) => ({ party: p, score: p.tags.filter((t) => currentTags.has(t)).length }))
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

  private addDaysTo(dateTime: string, days: number): string {
    const [y, m, d] = dateTime.substring(0, 10).split('-').map(Number);
    const date = new Date(y, m - 1, d); // hora local, sin problemas de zona horaria
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-CA'); // yyyy-MM-dd
  }

  // ───────── Compartir ─────────
  protected readonly copied = signal(false);

  protected async share() {
    const url = window.location.href;
    const title = this.party()?.title ?? 'Evento';

    // En celulares abre el menú nativo (WhatsApp, Instagram, etc.)
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // el usuario canceló: no hace nada
      }
      return;
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
}
