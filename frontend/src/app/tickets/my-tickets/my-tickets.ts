import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { UserService } from '../../user/user-service';
import { TicketClient } from '../ticket-service';
import { PartyRes } from '../../parties/party';
import { TicketDto } from '../ticket';

type TicketFilter = 'all' | 'upcoming' | 'past';

interface TicketGroup {
  party: PartyRes;
  tickets: { id: string; confirmed: boolean }[];
}

@Component({
  imports: [RouterLink],
  selector: 'app-my-tickets',
  styleUrls: ['./my-tickets.css'],
  templateUrl: './my-tickets.html',
})
export class MyTickets implements OnInit {
  private readonly userService = inject(UserService);
  protected readonly tickets = signal<TicketDto[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly activeFilter = signal<TicketFilter>('all');

  // Un grupo por evento, con todos los tickets que el usuario tiene para él
  protected readonly groups = computed(() => {
    const byParty = new Map<string, TicketGroup>();
    for (const ticket of this.tickets()) {
      const entry = { id: ticket.ticketExternalId, confirmed: ticket.confirmed };
      const group = byParty.get(ticket.party.externalId);
      if (group) {
        group.tickets.push(entry);
      } else {
        byParty.set(ticket.party.externalId, { party: ticket.party, tickets: [entry] });
      }
    }
    return [...byParty.values()].sort(
      (a, b) => new Date(a.party.dateTime).getTime() - new Date(b.party.dateTime).getTime(),
    );
  });

  protected shortCode(id: string | undefined): string {
    return id ? id.slice(0, 8).toUpperCase() : '—';
  }

  protected readonly upcomingTickets = computed(() =>
    this.upcomingGroups().reduce((count, group) => count + group.tickets.length, 0),
  );
  protected readonly pastTickets = computed(() =>
    this.pastGroups().reduce((count, group) => count + group.tickets.length, 0),
  );
  protected readonly upcomingGroups = computed(() =>
    this.groups().filter((g) => this.isUpcoming(g.party)),
  );
  protected readonly pastGroups = computed(() =>
    this.groups().filter((g) => !this.isUpcoming(g.party)),
  );
  protected readonly totalTickets = computed(() => this.tickets().length);

  protected readonly visibleGroups = computed(() => {
    const filter = this.activeFilter();
    const groups =
      filter === 'upcoming'
        ? this.upcomingGroups()
        : filter === 'past'
          ? this.pastGroups()
          : this.groups();
    const query = this.searchTerm().trim().toLocaleLowerCase('es-AR');

    if (!query) {
      return groups;
    }

    return groups.filter(({ party }) =>
      [party.title, party.city, party.adress, ...(party.tags ?? [])]
        .join(' ')
        .toLocaleLowerCase('es-AR')
        .includes(query),
    );
  });

  ngOnInit(): void {
    this.userService
      .listMyTickets()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (tickets) => {
          console.log(tickets[0]);
          this.tickets.set(tickets);
        },
        error: () => this.hasError.set(true),
      });
  }

  protected setFilter(filter: TicketFilter): void {
    this.activeFilter.set(filter);
  }

  protected onSearchInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchTerm.set(event.target.value);
    }
  }

  protected isUpcoming(party: PartyRes): boolean {
    return new Date(party.dateTime).getTime() >= Date.now();
  }

  protected formatDate(dateTime: string): string {
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(dateTime));
  }

  protected onImageError(event: Event): void {
    if (event.target instanceof HTMLImageElement) {
      event.target.src = 'Show.webp';
    }
  }
}
