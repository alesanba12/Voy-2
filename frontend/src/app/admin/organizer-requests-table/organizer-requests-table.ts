import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import {
  OrganizerVerificationRes,
  VerificationStatus,
} from '../organizer.request.model';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-organizer-requests-table',
  imports: [DatePipe, FormsModule, LoadingSpinner],
  templateUrl: './organizer-requests-table.html',
  styleUrl: './organizer-requests-table.css',
})
export class OrganizerRequestsTable {
  private readonly adminService = inject(AdminService);

  protected readonly searchEmail = signal('');
  protected readonly statusFilter = signal<VerificationStatus | 'ALL'>('ALL');
  protected readonly currentPage = signal(0);
  protected readonly pageSize = signal(20);

  private readonly queryParams = computed(() => ({
    status: this.statusFilter(),
    page: this.currentPage(),
    size: this.pageSize(),
  }));

  protected readonly verificationsResource = this.adminService.getVerifications(this.queryParams);

  protected readonly feedbackMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);
  protected readonly processingIds = signal<Set<string>>(new Set());

  protected readonly selectedRequest = signal<OrganizerVerificationRes | null>(null);
  protected readonly requestToReject = signal<OrganizerVerificationRes | null>(null);
  protected readonly rejectionReason = signal('');

  protected readonly pageData = computed(() => this.verificationsResource.value());
  protected readonly totalElements = computed(() => this.pageData()?.totalElements ?? 0);
  protected readonly totalPages = computed(() => this.pageData()?.totalPages ?? 0);

  protected readonly filteredRequests = computed(() => {
    const items = this.pageData()?.content ?? [];
    const query = this.searchEmail().trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => item.userEmail.toLowerCase().includes(query));
  });

  protected readonly hasActiveFilters = computed(
    () => this.searchEmail().trim() !== '' || this.statusFilter() !== 'ALL'
  );

  protected onStatusChange(status: VerificationStatus | 'ALL'): void {
    this.statusFilter.set(status);
    this.currentPage.set(0);
  }

  protected clearFilters(): void {
    this.searchEmail.set('');
    this.statusFilter.set('ALL');
    this.currentPage.set(0);
  }

  protected goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
  }

  protected isProcessing(userExternalId: string): boolean {
    return this.processingIds().has(userExternalId);
  }

  private setProcessing(userExternalId: string, active: boolean): void {
    this.processingIds.update((prev) => {
      const next = new Set(prev);
      if (active) {
        next.add(userExternalId);
      } else {
        next.delete(userExternalId);
      }
      return next;
    });
  }

  protected getStatusLabel(status: VerificationStatus): string {
    switch (status) {
      case 'PENDING':
        return 'Pendiente';
      case 'VERIFIED':
        return 'Verificado';
      case 'REJECTED':
        return 'Rechazado';
    }
  }

  protected openDetailModal(item: OrganizerVerificationRes): void {
    this.selectedRequest.set(item);
  }

  protected closeDetailModal(): void {
    this.selectedRequest.set(null);
  }

  protected approveRequest(item: OrganizerVerificationRes): void {
    if (this.isProcessing(item.userExternalId)) return;

    this.setProcessing(item.userExternalId, true);
    this.feedbackMessage.set(null);

    this.adminService.approveVerification(item.userExternalId).subscribe({
      next: () => {
        this.setProcessing(item.userExternalId, false);
        this.closeDetailModal();
        this.feedbackMessage.set({
          text: `Solicitud de ${item.userEmail} aprobada correctamente.`,
          type: 'success',
        });
        this.verificationsResource.reload();
        this.adminService.pendingVerificationsResource.reload();
        this.adminService.metricsResource.reload();
      },
      error: () => {
        this.setProcessing(item.userExternalId, false);
        this.feedbackMessage.set({
          text: `No se pudo aprobar la solicitud de ${item.userEmail}.`,
          type: 'error',
        });
      },
    });
  }

  protected openRejectModal(item: OrganizerVerificationRes): void {
    this.rejectionReason.set('');
    this.requestToReject.set(item);
  }

  protected closeRejectModal(): void {
    this.requestToReject.set(null);
    this.rejectionReason.set('');
  }

  protected confirmReject(): void {
    const target = this.requestToReject();
    const reason = this.rejectionReason().trim();
    if (!target || !reason || this.isProcessing(target.userExternalId)) return;

    this.setProcessing(target.userExternalId, true);
    this.feedbackMessage.set(null);

    this.adminService.rejectVerification(target.userExternalId, { reason }).subscribe({
      next: () => {
        this.setProcessing(target.userExternalId, false);
        this.closeRejectModal();
        this.closeDetailModal();
        this.feedbackMessage.set({
          text: `Solicitud de ${target.userEmail} rechazada.`,
          type: 'success',
        });
        this.verificationsResource.reload();
        this.adminService.pendingVerificationsResource.reload();
        this.adminService.metricsResource.reload();
      },
      error: () => {
        this.setProcessing(target.userExternalId, false);
        this.feedbackMessage.set({
          text: `Ocurrió un error al rechazar la solicitud de ${target.userEmail}.`,
          type: 'error',
        });
      },
    });
  }
}