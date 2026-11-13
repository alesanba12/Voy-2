import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PartyClient } from '../party-service';
import { Party } from '../party';
import { EventDatePipe, PartyCard } from '../party-card/party-card';
import { httpResource } from '@angular/common/http';
import { DateRange } from '../../shared/components/date-filter/date-filter';

@Component({
  imports: [RouterLink, EventDatePipe, PartyCard],
  selector: 'app-party-detail',
  styleUrl: './party-detail.css',
  templateUrl: './party-detail.html',
})
export class PartyDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly client = inject(PartyClient);

  private readonly partyId = this.route.snapshot.paramMap.get('id')!;

  protected readonly party = signal<Party | undefined>(undefined);
  // protected readonly nombreOrganizador = computed(() => this.party()?.organizerName);
  // protected readonly organizador = 

  ngOnInit() {
    this.client.getById(this.partyId).subscribe({
      next: (party) => {
        this.party.set(party);
      },
      error: () => {
        alert('Evento no encontrado, redirigiendo al listado de eventos');
        this.router.navigate(['/catalogo']);
      },
    });
  }

  shareParty() {
    const party = this.route.snapshot;
  }

  protected readonly followParty = signal<boolean>(false);

  protected readonly filterByTags = signal<string>('');

  private readonly ciudad = computed(() => this.party()?.city);
  private readonly fecha = computed(() => this.party()?.dateTime);

  protected readonly partiesResource = httpResource<Party[]>(() => ({
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
    let parties = [...(this.partiesResource.value() ?? [])];
    const party = this.party();
    if (!party) return parties;
    else {
      parties = parties.filter((p) => p.tags.includes(party.tags[0]));
    }
    parties = parties.filter((p) => p.externalId !== this.partyId);
    return parties.slice(0, 4);
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
        // el usuario canceló: no hacemos nada
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
}
