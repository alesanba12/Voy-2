import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { toDataURL } from 'qrcode';
import { UserService } from '../../user/user-service';
import { TicketClient } from '../ticket-service';
import { TicketDto } from '../ticket';
import { ConfirmModalService } from '../../shared/components/modal-dialog/modal-dialog-service';
import { ToastService } from '../../shared/components/toast/toast-service';

@Component({
  imports: [RouterLink],
  selector: 'app-party-tickets',
  styleUrl: './party-tickets.css',
  templateUrl: './party-tickets.html',
})
export class PartyTickets implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly ticketClient = inject(TicketClient);
  private readonly modalService = inject(ConfirmModalService);
  private readonly toastService = inject(ToastService);

  protected readonly tickets = signal<TicketDto[]>([]);
  protected readonly qrCodes = signal<Record<string, string>>({});
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly returningId = signal<string | null>(null);
  protected readonly transferTicketId = signal<string | null>(null);
  protected readonly transferEmail = signal('');
  protected readonly transferLoading = signal(false);

  // Todas las entradas son del mismo evento, así que alcanza con la primera
  protected readonly party = computed(() => this.tickets()[0]?.party);

  ngOnInit(): void {
    const partyId = this.route.snapshot.paramMap.get('id');

    this.userService
      .listMyTickets()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (all) => {
          const tickets = all.filter((t) => t.party.externalId === partyId);
          this.tickets.set(tickets);
          void this.generateQrCodes(tickets);
        },
        error: () => this.hasError.set(true),
      });
  }

  // El QR contiene solo el id del ticket; quien escanea lo valida contra el back
  private async generateQrCodes(tickets: TicketDto[]) {
    const entries = await Promise.all(
      tickets.map(
        async (t) =>
          [
            t.ticketExternalId,
            await toDataURL(t.ticketExternalId, { margin: 1, width: 180 }),
          ] as const,
      ),
    );
    this.qrCodes.set(Object.fromEntries(entries));
  }

  protected isFree(ticket: TicketDto): boolean {
    return ticket.receipt.price === 0;
  }

  protected formatPrice(price: number): string {
    return price === 0
      ? 'Gratis'
      : new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          maximumFractionDigits: 0,
        }).format(price);
  }

  protected shortCode(id: string): string {
    return id.slice(0, 8).toUpperCase();
  }

  protected async returnTicket(ticket: TicketDto) {
    if (this.returningId()) return;

    const confirmed = await this.modalService.open({
      variant: 'destructive-delete',
      icon: 'user-remove', // cambialo por el ícono que corresponda en tu modal
      title: 'Devolver entrada',
      description: `¿Devolver la entrada #${this.shortCode(ticket.ticketExternalId)}? Esta acción no se puede deshacer.`,
      cancelLabel: 'Cancelar',
      confirmLabel: 'Devolver',
    });
    if (!confirmed) return;

    const id = ticket.ticketExternalId;
    this.returningId.set(id);

    this.ticketClient.return(id).subscribe({
      next: () => {
        this.returningId.set(null);
        this.tickets.update((list) => list.filter((t) => t.ticketExternalId !== id));
        this.toastService.show('Entrada devuelta.', 'success');
        // Si era la última, no queda nada que mostrar acá
        if (this.tickets().length === 0) this.router.navigate(['/tickets']);
      },
      error: (err: unknown) => {
        this.returningId.set(null);
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.router.navigate(['/login']);
          return;
        }
        const msg = err instanceof HttpErrorResponse ? err.error?.message : null;
        this.toastService.show(
          msg || 'No se pudo devolver la entrada. Intentá nuevamente.',
          'error',
        );
      },
    });
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

  protected scanTicket(ticket: TicketDto) {
    // TODO: definir qué hace "escanear" (ver nota abajo)
    console.log('Escanear', ticket.ticketExternalId);
  }

  protected canTransfer(ticket: TicketDto): boolean {
    return ticket.confirmed;
  }

  // Devolver: gratis y con más de 24 hs de margen (misma regla que el back)
  protected canReturn(ticket: TicketDto): boolean {
    const msLeft = new Date(ticket.party.dateTime).getTime() - Date.now();
    return ticket.receipt.price === 0 && msLeft >= 24 * 60 * 60 * 1000;
  }

  protected openTransfer(ticket: TicketDto) {
    this.transferEmail.set('');
    this.transferTicketId.set(ticket.ticketExternalId);
  }

  protected cancelTransfer() {
    if (this.transferLoading()) return;
    this.transferTicketId.set(null);
  }

  protected transferTicket(ticket: TicketDto) {
    const email = this.transferEmail().trim().toLowerCase();
    if (!email || this.transferLoading()) return;

    if (email === ticket.userEmail.toLowerCase()) {
      this.toastService.show('La entrada ya es tuya.', 'error');
      return;
    }

    this.transferLoading.set(true);
    this.ticketClient
      .transfer(ticket.ticketExternalId, email)
      .pipe(finalize(() => this.transferLoading.set(false)))
      .subscribe({
        next: () => {
          this.transferTicketId.set(null);
          this.removeTicket(ticket.ticketExternalId);
          this.toastService.show(`Entrada transferida a ${email}.`, 'success');
        },
        error: (err: unknown) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            this.router.navigate(['/login']);
            return;
          }
          // El back valida que el usuario exista y manda el motivo en "message"
          const msg = err instanceof HttpErrorResponse ? err.error?.message : null;
          this.toastService.show(msg || 'No se pudo transferir la entrada.', 'error');
        },
      });
  }

  // Saca la entrada de la lista; si era la última, vuelve a Mis tickets
  private removeTicket(id: string) {
    this.tickets.update((list) => list.filter((t) => t.ticketExternalId !== id));
    if (this.tickets().length === 0) this.router.navigate(['/tickets']);
  }
}
