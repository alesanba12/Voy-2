import { Component, inject, input, Pipe, PipeTransform, forwardRef } from '@angular/core';
import { Party } from '../party';
import { Router } from '@angular/router';

@Component({
  imports: [forwardRef(() => EventDatePipe)],
  selector: 'app-party-card',
  styleUrl: './party-card.css',
  templateUrl: './party-card.html',
})
export class PartyCard {
  public readonly party = input.required<Party>();
  private readonly router = inject(Router);

  
}

@Pipe({ name: 'eventDate' })
export class EventDatePipe implements PipeTransform {
  transform(value: string): string {
    const d = new Date(value);
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const weekday = cap(
      new Intl.DateTimeFormat('es-AR', { weekday: 'short' }).format(d).replace('.', ''),
    );
    const month = cap(new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(d));
    const time = new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);

    return `${weekday}, ${d.getDate()} de ${month} ${d.getFullYear()} - ${time}`;
  }
}