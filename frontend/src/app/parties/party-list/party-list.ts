import { Component, computed, inject, signal } from '@angular/core';
import { PartyClient } from '../party-service';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [],
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
  protected readonly filterTo = signal<string | null>(this.addDays(7));
  protected readonly orderBy = signal<string>('Fecha');

  private readonly filters = computed(() => ({
    id: this.filterById(),
    organizerId: this.filterByOrganizerId(),
    title: this.filterByPartyTitle(),
    city: this.filterByCity(),
    from: this.filterFrom(),
    to: this.filterTo(),
  }));

  private readonly partySource = toSignal(
    this.client.getAll(
      this.toNull(this.filterById()),
      this.toNull(this.filterByOrganizerId()),
      this.toNull(this.filterByPartyTitle()),
      this.toNull(this.filterByCity()),
      this.toNull(this.filterFrom()),
      this.toNull(this.filterTo()),
    ),
  );

  protected readonly parties = computed(() => {
    let parties = this.partySource();

    if (!parties) return [];

    const title = this.filterByPartyTitle()?.toLowerCase();
    if (title) {
      parties = parties.filter((p) => p.title.toLowerCase().includes(title));
    }

    const city = this.filterByCity()?.toLowerCase();
    if (city) {
      parties = parties.filter((p) => p.city.toLowerCase().includes(city));
    }
    const from = this.filterFrom();
    if (from) {
      parties = parties.filter((p) => this.dayOf(p.dateTime) >= from);
    }

    const to = this.filterTo();
    if (to) {
      parties = parties.filter((p) => this.dayOf(p.dateTime) <= to);
    }

    switch (this.orderBy()) {
      case 'Fecha':
        parties = [...parties].sort((p1, p2) => p1.dateTime.localeCompare(p2.dateTime));
        break;
      case 'Precio: mayor a menor':
        parties = [...parties].sort((p1, p2) => p2.price - p1.price);
        break;
      case 'Precio: menor a mayor':
        parties = [...parties].sort((p1, p2) => p1.price - p2.price);
        break;
    }

    return parties;
  });

  protected toNull(s: string | null) {
    return s === '' ? null : s;
  }

  private dayOf(value: Date | string): string {
    return typeof value === 'string'
      ? value.substring(0, 10) // Con esto tomo solo las primeras 10 posiciones del string: "2026-12-31"
      : value.toLocaleDateString('en-CA'); // por si el cliente lo convierte a Date
  }

  private addDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-CA');
  }

  protected readonly ordenamiento = [
    'Fecha',
    'Precio: mayor a menor',
    'Precio: menor a mayor',
  ] as const;
}
// private readonly partySource = toSignal(
//   toObservable(this.filters).pipe(
//     switchMap((f) =>
//       this.client
//         .getAll(
//           this.toNull(f.id),
//           this.toNull(f.organizerId),
//           this.toNull(f.title),
//           this.toNull(f.city),
//           this.toNull(f.from),
//           this.toNull(f.to),
//         )
//         .pipe(catchError(() => of([]))),
//     ),
//   ),
//   { initialValue: [] },
// );}
