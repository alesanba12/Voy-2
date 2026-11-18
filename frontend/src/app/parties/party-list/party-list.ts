import { Component, computed, inject, signal } from '@angular/core';
import { PartyClient } from '../party-service';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { PartyRes } from '../party';
import { debounceTime } from 'rxjs';
import { PartyCard } from '../party-card/party-card';
import { DateFilterComponent, DateRange } from '../../shared/components/date-filter/date-filter';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  imports: [PartyCard, DateFilterComponent, LoadingSpinner],
  selector: 'app-party-list',
  styleUrl: './party-list.css',
  templateUrl: './party-list.html',
})
export class PartyList {
  private readonly client = inject(PartyClient);
  private readonly router = inject(Router);

  protected readonly filterById = signal<string | null>(null);
  protected readonly filterByOrganizerId = signal<string | null>(null);
  protected readonly filterByPartyTitle = signal<string | null>(null);
  protected readonly filterByCity = signal<string | null>(null);
  protected readonly filterFrom = signal<string>(this.addDays(0));
  protected readonly filterTo = signal<string | null>(this.addDays(6));
  protected readonly filterByTags = signal<string>('');
  protected readonly orderBy = signal<string>('Fecha');

  protected readonly partiesResource = httpResource<PartyRes[]>(() => ({
    url: '/api/parties',
    params: this.buildParams({
      partyId: this.filterById(),
      organizerId: this.filterByOrganizerId(),
      title: this.debouncedTitle(),
      city: this.debouncedCity(),
      from: this.filterFrom(),
      to: this.filterTo(),
    }),
  }));

  protected readonly parties = computed(() => {
    let parties = [...(this.partiesResource.value() ?? [])];

    const tag = this.filterByTags();
    if (tag) {
      parties = parties.filter((p) => p.tags.includes(tag));
    }

    switch (this.orderBy()) {
      case 'Precio: mayor a menor':
        parties.sort((a, b) => b.price - a.price);
        break;
      case 'Precio: menor a mayor':
        parties.sort((a, b) => a.price - b.price);
        break;
      case 'Fecha':
        parties.sort((a, b) => a.dateTime.localeCompare(b.dateTime));
        break;
    }
    return parties;
  });

  protected readonly emptyState = computed(() => {
    const title = this.filterByPartyTitle()?.trim();
    const city = this.filterByCity()?.trim();
    const tag = this.filterByTags();
    let context = 'con los filtros seleccionados';

    if (title && city) {
      context = `para “${title}” en ${city}`;
    } else if (title) {
      context = `para “${title}”`;
    } else if (city) {
      context = `en ${city}`;
    } else if (tag) {
      context = `de ${tag}`;
    }

    return {
      title: `No encontramos eventos ${context}`,
      description:
        title || city || tag
          ? 'Probá cambiar alguno de los filtros o ampliar el rango de fechas.'
          : 'Todavía no hay eventos publicados para las fechas seleccionadas. Probá ampliar el rango de fechas.',
    };
  });

  protected onDateChange(range: DateRange) {
    this.filterFrom.set(range.from);
    this.filterTo.set(range.to);
    // No hace falta llamar a la API: httpResource lee estos signals
    // y se vuelve a ejecutar solo cuando cambian.
  }

  // Saca los filtros vacíos para que no viajen como "title=" en la URL
  private buildParams(filters: Record<string, string | null>) {
    return Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== null && v !== ''),
    ) as Record<string, string>;
  }

  private addDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-CA');
  }

  protected readonly tags = [
    'Gastronómico',
    'Fiesta',
    'Música',
    'Teatro',
    'Arte y cultura',
    'Deporte',
  ];

  protected readonly ordenamiento = [
    'Fecha',
    'Precio: mayor a menor',
    'Precio: menor a mayor',
  ] as const;

  private readonly debouncedTitle = toSignal(
    toObservable(this.filterByPartyTitle).pipe(debounceTime(300)),
    { initialValue: null },
  );

  private readonly debouncedCity = toSignal(
    toObservable(this.filterByCity).pipe(debounceTime(300)),
    { initialValue: null },
  );
}
