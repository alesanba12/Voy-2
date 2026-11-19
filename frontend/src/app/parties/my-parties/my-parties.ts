import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { PartySummaryDto } from '../../user/user';
import { UserService } from '../../user/user-service';
import { TicketClient } from '../../tickets/ticket-service';
import { OrganizerTicketDto } from '../../tickets/ticket';

type PartyFilter = 'all' | 'upcoming' | 'past';

interface PartySalesSummary {
  soldTickets: number;
  totalRevenue: number;
}

@Component({
  imports: [RouterLink],
  selector: 'app-my-parties',
  styleUrl: './my-parties.css',
  templateUrl: './my-parties.html',
})
export class MyParties implements OnInit {
  private readonly userService = inject(UserService);
  private readonly ticketClient = inject(TicketClient);
  protected readonly parties = signal<PartySummaryDto[]>([]);
  private readonly sales = signal<Record<string, PartySalesSummary>>({});
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly activeFilter = signal<PartyFilter>('all');
  protected readonly upcomingParties = computed(() =>
    this.parties().filter((party) => this.isUpcoming(party)),
  );
  protected readonly pastParties = computed(() =>
    this.parties().filter((party) => !this.isUpcoming(party)),
  );
  protected readonly visibleParties = computed(() => {
    const filter = this.activeFilter();
    const parties =
      filter === 'upcoming'
        ? this.upcomingParties()
        : filter === 'past'
          ? this.pastParties()
          : this.parties();
    const query = this.searchTerm().trim().toLocaleLowerCase('es-AR');

    if (!query) {
      return parties;
    }

    return parties.filter((party) =>
      [party.title, party.city, party.adress, ...(party.tags ?? [])]
        .join(' ')
        .toLocaleLowerCase('es-AR')
        .includes(query),
    );
  });

  ngOnInit(): void {
    forkJoin({
      parties: this.userService.listMyParties(),
      tickets: this.ticketClient.listOrganizerTickets(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ parties, tickets }) => {
          this.parties.set(parties);
          this.sales.set(this.summarizeSales(tickets, parties));
        },
        error: () => this.hasError.set(true),
      });
  }

  protected salesFor(partyId: string): PartySalesSummary {
    return this.sales()[partyId] ?? { soldTickets: 0, totalRevenue: 0 };
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private summarizeSales(
    tickets: OrganizerTicketDto[],
    parties: PartySummaryDto[],
  ): Record<string, PartySalesSummary> {
    const summaries: Record<string, PartySalesSummary> = {};
    const partyIds = new Set(parties.map((party) => party.externalId));

    for (const ticket of tickets) {
      if (
        !partyIds.has(ticket.party.externalId) ||
        ticket.receipt.status !== 'APROBADA' ||
        ticket.receipt.price <= 0
      ) {
        continue;
      }

      const partyId = ticket.party.externalId;
      const summary = summaries[partyId] ?? { soldTickets: 0, totalRevenue: 0 };
      summary.soldTickets += 1;
      summary.totalRevenue += ticket.receipt.price;
      summaries[partyId] = summary;
    }

    return summaries;
  }

  protected setFilter(filter: PartyFilter): void {
    this.activeFilter.set(filter);
  }

  protected onSearchInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchTerm.set(event.target.value);
    }
  }

  protected isUpcoming(party: PartySummaryDto): boolean {
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
