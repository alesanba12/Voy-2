import { Component, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { PartyCard } from '../../parties/party-card/party-card';
import { PartySummaryDto, UserFollowDto } from '../user';
import { UserService } from '../user-service';

@Component({
  imports: [RouterLink, PartyCard],
  selector: 'app-following',
  styleUrl: './following.css',
  templateUrl: './following.html',
})
export class Following implements OnInit {
  private readonly userService = inject(UserService);

  protected readonly organizers = signal<UserFollowDto[]>([]);
  protected readonly parties = signal<PartySummaryDto[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasLoadError = signal(false);
  protected readonly actionError = signal<string | null>(null);
  protected readonly pendingOrganizerIds = signal<Set<string>>(new Set());
  protected readonly pendingPartyIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    forkJoin({
      organizers: this.userService.listFollowList(),
      parties: this.userService.listFollowedParties(),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ organizers, parties }) => {
          this.organizers.set(organizers);
          this.parties.set(parties);
        },
        error: () => this.hasLoadError.set(true),
      });
  }

  unfollowOrganizer(id: string): void {
    this.pendingOrganizerIds.update((ids) => new Set(ids).add(id));
    this.userService
      .alterFollowUser(id)
      .pipe(finalize(() => this.removePendingId(this.pendingOrganizerIds, id)))
      .subscribe({
        next: (organizers) => {
          this.organizers.set(organizers);
          this.actionError.set(null);
        },
        error: () => this.actionError.set('No se pudo dejar de seguir al organizador.'),
      });
  }

  unfollowParty(id: string): void {
    this.pendingPartyIds.update((ids) => new Set(ids).add(id));
    this.userService
      .alterFollowParty(id)
      .pipe(finalize(() => this.removePendingId(this.pendingPartyIds, id)))
      .subscribe({
        next: (parties) => {
          this.parties.set(parties);
          this.actionError.set(null);
        },
        error: () => this.actionError.set('No se pudo dejar de seguir el evento.'),
      });
  }

  private removePendingId(pendingIds: WritableSignal<Set<string>>, id: string): void {
    pendingIds.update((ids) => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
  }
}
