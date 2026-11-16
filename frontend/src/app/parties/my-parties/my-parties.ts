import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { EventDatePipe, PartyCard } from '../party-card/party-card';
import { PartySummaryDto } from '../../user/user';
import { UserService } from '../../user/user-service';

@Component({
  imports: [RouterLink, EventDatePipe, CurrencyPipe, PartyCard],
  selector: 'app-my-parties',
  styleUrl: './my-parties.css',
  templateUrl: './my-parties.html',
})
export class MyParties implements OnInit {
  private readonly userService = inject(UserService);

  protected readonly parties = signal<PartySummaryDto[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);

  ngOnInit(): void {
    this.userService
      .listMyParties()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (parties) => this.parties.set(parties),
        error: () => this.hasError.set(true),
      });
  }
}
