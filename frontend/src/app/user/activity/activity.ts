import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  imports: [RouterLink],
  selector: 'app-activity',
  styleUrl: './activity.css',
  templateUrl: './activity.html',
})
export class Activity {
  private readonly authService = inject(AuthService);

  protected readonly isOrganizer = computed(() =>
    this.authService.hasAnyRole(['ROLE_ORGANIZATOR', 'ROLE_ADMIN']),
  );
}
