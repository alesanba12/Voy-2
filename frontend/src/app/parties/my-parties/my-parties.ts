import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { PartySummaryDto } from '../../user/user';
import { UserService } from '../../user/user-service';

type PartyFilter = 'all' | 'upcoming' | 'past';

@Component({
  imports: [RouterLink],
  selector: 'app-my-parties',
  styleUrl: './my-parties.css',
  templateUrl: './my-parties.html',
})
export class MyParties implements OnInit {
  private readonly userService = inject(UserService);
  protected readonly parties = signal<PartySummaryDto[]>([]);
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
    this.userService
      .listMyParties()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (parties) => this.parties.set(parties),
        error: () => this.hasError.set(true),
      });
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
