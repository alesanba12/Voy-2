import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { TicketAdminFilters, TicketResponseDto, TicketsService } from './service/tickets-service';


type ConfirmedFilter = '' | 'true' | 'false';

@Component({
  imports: [FormsModule, LoadingSpinner, CurrencyPipe],
  selector: 'app-tickets-table',
  styleUrl: './tickets-table.css',
  templateUrl: './tickets-table.html',
})
export class TicketsTable {
  private readonly ticketsService = inject(TicketsService);

  // Filtros conectados a GET /api/tickets/admin
  readonly searchTitle = signal('');
  readonly searchUser = signal('');
  readonly searchOrganizer = signal('');
  readonly confirmedFilter = signal<ConfirmedFilter>('');

  // Estados de procesamiento y modales
  readonly processingReceiptIds = signal<Set<string>>(new Set());
  readonly ticketToReject = signal<TicketResponseDto | null>(null);
  readonly ticketToConfirm = signal<TicketResponseDto | null>(null);
  readonly feedbackMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  private readonly queryParams = computed<TicketAdminFilters>(() => ({
    title: this.searchTitle(),
    usernameUser: this.searchUser(),
    usernameOrganizer: this.searchOrganizer(),
    isConfirmed: this.confirmedFilter(),
  }));

  readonly ticketsResource = this.ticketsService.getAdminTicketsResource(this.queryParams);

  readonly tickets = computed(() => this.ticketsResource.value() ?? []);

  // Métricas rápidas para la cabecera
  readonly totalCount = computed(() => this.tickets().length);
  readonly pendingCount = computed(
    () => this.tickets().filter((t) => !t.confirmed).length
  );

  readonly hasActiveFilters = computed(
    () =>
      this.searchTitle().trim() !== '' ||
      this.searchUser().trim() !== '' ||
      this.searchOrganizer().trim() !== '' ||
      this.confirmedFilter() !== ''
  );

  clearFilters(): void {
    this.searchTitle.set('');
    this.searchUser.set('');
    this.searchOrganizer.set('');
    this.confirmedFilter.set('');
  }

  isProcessing(receiptId?: string | null): boolean {
    if (!receiptId) return false;
    return this.processingReceiptIds().has(receiptId);
  }

  canManageReceipt(ticket: TicketResponseDto): boolean {
    return !ticket.confirmed && Boolean(ticket.receipt?.externalId);
  }

  openConfirmModal(ticket: TicketResponseDto): void {
    if (!this.canManageReceipt(ticket)) return;
    this.ticketToConfirm.set(ticket);
  }

  closeConfirmModal(): void {
    this.ticketToConfirm.set(null);
  }

  openRejectModal(ticket: TicketResponseDto): void {
    if (!this.canManageReceipt(ticket)) return;
    this.ticketToReject.set(ticket);
  }

  closeRejectModal(): void {
    this.ticketToReject.set(null);
  }

  async confirmPurchaseAction(): Promise<void> {
    const target = this.ticketToConfirm();
    const receiptId = target?.receipt?.externalId;
    if (!target || !receiptId || this.isProcessing(receiptId)) return;

    this.setProcessing(receiptId, true);
    try {
      await this.ticketsService.confirmPurchase(receiptId);
      this.showFeedback(
        `Compra del recibo #${receiptId.slice(0, 8)} confirmada correctamente.`,
        'success'
      );
      this.closeConfirmModal();
      this.ticketsResource.reload();
    } catch {
      this.showFeedback(
        `Error al confirmar el recibo #${receiptId.slice(0, 8)}.`,
        'error'
      );
    } finally {
      this.setProcessing(receiptId, false);
    }
  }

  async rejectPurchaseAction(): Promise<void> {
    const target = this.ticketToReject();
    const receiptId = target?.receipt?.externalId;
    if (!target || !receiptId || this.isProcessing(receiptId)) return;

    this.setProcessing(receiptId, true);
    try {
      await this.ticketsService.rejectPurchase(receiptId);
      this.showFeedback(
        `Compra del recibo #${receiptId.slice(0, 8)} rechazada y tickets eliminados.`,
        'success'
      );
      this.closeRejectModal();
      this.ticketsResource.reload();
    } catch {
      this.showFeedback(
        `Error al rechazar el recibo #${receiptId.slice(0, 8)}. Verifica que siga pendiente.`,
        'error'
      );
    } finally {
      this.setProcessing(receiptId, false);
    }
  }

  formatPaymentMethod(method?: string): string {
    if (!method) return 'Sin método';
    const map: Record<string, string> = {
      CREDIT_CARD: 'Tarjeta de crédito',
      DEBIT_CARD: 'Tarjeta de débito',
      TRANSFER: 'Transferencia',
      MERCADO_PAGO: 'Mercado Pago',
      FREE: 'Gratuito',
    };
    return map[method] ?? method;
  }

  private setProcessing(receiptId: string, active: boolean): void {
    this.processingReceiptIds.update((prev) => {
      const next = new Set(prev);
      active ? next.add(receiptId) : next.delete(receiptId);
      return next;
    });
  }

  private showFeedback(text: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set({ text, type });
    setTimeout(() => this.feedbackMessage.set(null), 4000);
  }
}