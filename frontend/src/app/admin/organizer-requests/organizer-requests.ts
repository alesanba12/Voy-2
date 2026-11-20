import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-organizer-requests',
  imports: [DatePipe],
  templateUrl: './organizer-requests.html',
  styleUrl: './organizer-requests.css'
})
export class OrganizerRequests {
  private readonly adminService = inject(AdminService);

  protected readonly requestsResource = this.adminService.getPendingVerifications();
  protected readonly processingId = signal<string | null>(null);

  // Control del rechazo en línea para cumplir @NotBlank de OrganizerRejectReqDTO
  protected readonly rejectingId = signal<string | null>(null);
  protected readonly rejectReason = signal('');

  protected readonly requests = computed(() => this.requestsResource.value() ?? []);

  protected getInitials(email?: string | null): string {
    if (!email?.trim()) return '?';
    const localPart = email.split('@')[0];
    const parts = localPart.split(/[._-]/).filter(Boolean);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return localPart.slice(0, 2).toUpperCase();
  }

  protected onApprove(userExternalId: string): void {
    if (this.processingId()) return;
    this.processingId.set(userExternalId);

    this.adminService.approveVerification(userExternalId).subscribe({
      next: () => {
        this.requestsResource.reload();
        this.adminService.metricsResource.reload();
        this.processingId.set(null);
      },
      error: () => this.processingId.set(null)
    });
  }

  protected startReject(userExternalId: string): void {
    this.rejectingId.set(userExternalId);
    this.rejectReason.set('');
  }

  protected cancelReject(): void {
    this.rejectingId.set(null);
    this.rejectReason.set('');
  }

  protected confirmReject(userExternalId: string): void {
    const reason = this.rejectReason().trim();
    if (!reason || this.processingId()) return;

    this.processingId.set(userExternalId);

    this.adminService.rejectVerification(userExternalId, { reason }).subscribe({
      next: () => {
        this.rejectingId.set(null);
        this.rejectReason.set('');
        this.requestsResource.reload();
        this.adminService.metricsResource.reload();
        this.processingId.set(null);
      },
      error: () => this.processingId.set(null)
    });
  }
}