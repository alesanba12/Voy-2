import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import type { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { finalize } from 'rxjs';
import { PartySummaryDto } from '../../user/user';
import { ToastService } from '../../shared/components/toast/toast-service';
import { OrganizerTicketDto } from '../ticket';
import { TicketClient } from '../ticket-service';

type TicketFilter = 'all' | 'pending' | 'confirmed' | 'checked-in';

@Component({
  selector: 'app-ticket-management-dialog',
  templateUrl: './ticket-management-dialog.html',
  styleUrl: './ticket-management-dialog.css',
})
export class TicketManagementDialog implements OnInit, OnDestroy {
  private readonly ticketClient = inject(TicketClient);
  private readonly toastService = inject(ToastService);
  private codeReader: BrowserMultiFormatReader | null = null;
  private scannerControls: IScannerControls | null = null;
  private destroyed = false;

  @ViewChild('qrVideo') private qrVideo?: ElementRef<HTMLVideoElement>;

  public readonly party = input.required<PartySummaryDto>();
  public readonly closed = output<void>();
  protected readonly tickets = signal<OrganizerTicketDto[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly activeFilter = signal<TicketFilter>('all');
  protected readonly isScanning = signal(false);
  protected readonly scanError = signal<string | null>(null);
  protected readonly manualCode = signal('');
  protected readonly checkingInId = signal<string | null>(null);

  protected readonly visibleTickets = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchTerm().trim().toLocaleLowerCase('es-AR');

    return this.tickets().filter((ticket) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'pending' && !this.isApproved(ticket)) ||
        (filter === 'confirmed' && this.isApproved(ticket) && !ticket.checkedIn) ||
        (filter === 'checked-in' && ticket.checkedIn);
      const matchesQuery =
        !query ||
        ticket.userEmail.toLocaleLowerCase('es-AR').includes(query) ||
        ticket.idExternal.toLocaleLowerCase('es-AR').includes(query);

      return matchesFilter && matchesQuery;
    });
  });

  ngOnInit(): void {
    this.ticketClient
      .listOrganizerTickets(this.party().externalId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (tickets) => this.tickets.set(tickets),
        error: () => this.hasError.set(true),
      });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopScanner();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }

  protected close(): void {
    this.stopScanner();
    this.closed.emit();
  }

  protected closeOnBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected onSearchInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchTerm.set(event.target.value);
    }
  }

  protected setFilter(filter: TicketFilter): void {
    this.activeFilter.set(filter);
  }

  protected onFilterChange(event: Event): void {
    if (!(event.target instanceof HTMLSelectElement)) return;

    const filter = event.target.value;
    if (
      filter === 'all' ||
      filter === 'pending' ||
      filter === 'confirmed' ||
      filter === 'checked-in'
    ) {
      this.activeFilter.set(filter);
    }
  }

  protected statusLabel(ticket: OrganizerTicketDto): string {
    if (!this.isApproved(ticket)) return 'Pendiente';
    return 'Confirmada';
  }

  protected async startScanner(): Promise<void> {
    const video = this.qrVideo?.nativeElement;
    if (!video || this.isScanning()) return;

    this.scanError.set(null);
    this.isScanning.set(true);

    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      if (this.destroyed || !this.isScanning()) return;

      this.codeReader ??= new BrowserMultiFormatReader();
      const controls = await this.codeReader.decodeFromVideoDevice(
        undefined,
        video,
        (result, _error, scannerControls) => {
          if (!result || this.destroyed) return;

          scannerControls.stop();
          this.scannerControls = null;
          this.isScanning.set(false);
          this.validateTicketCode(result.getText());
        },
      );
      if (this.destroyed || !this.isScanning()) {
        controls.stop();
        return;
      }
      this.scannerControls = controls;
    } catch {
      if (!this.destroyed) {
        this.isScanning.set(false);
        this.scanError.set(
          'No se pudo acceder a la cámara. Revisá los permisos o ingresá el código manualmente.',
        );
      }
    }
  }

  protected stopScanner(): void {
    this.scannerControls?.stop();
    this.scannerControls = null;
    this.isScanning.set(false);
  }

  protected onManualCodeInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.manualCode.set(event.target.value);
    }
  }

  protected validateManualCode(): void {
    void this.validateTicketCode(this.manualCode());
  }

  protected exportCsv(): void {
    const rows = [
      ['Código', 'Email', 'Estado de compra', 'Asistencia'],
      ...this.visibleTickets().map((ticket) => [
        ticket.idExternal,
        ticket.userEmail,
        this.isApproved(ticket) ? 'Confirmada' : 'Pendiente',
        ticket.checkedIn ? 'Ingresó' : 'No ingresó',
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((cell) => this.csvCell(cell)).join(',')).join('\r\n')}`;
    const file = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.fileName(this.party().title)}-tickets.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private validateTicketCode(rawCode: string): void {
    const code = rawCode.trim();
    this.manualCode.set('');

    const ticket = this.tickets().find((item) => item.idExternal.toLowerCase() === code.toLowerCase());
    if (!ticket) {
      this.toastService.show('La entrada no pertenece a este evento.', 'error');
      return;
    }
    if (!this.isApproved(ticket)) {
      this.toastService.show('La compra todavía no está confirmada.', 'warning');
      return;
    }
    if (ticket.checkedIn) {
      this.toastService.show('Esta entrada ya fue utilizada.', 'warning');
      return;
    }
    if (this.checkingInId()) return;

    this.checkingInId.set(ticket.idExternal);
    this.ticketClient
      .checkInOrganizerTicket(ticket.idExternal)
      .pipe(finalize(() => this.checkingInId.set(null)))
      .subscribe({
        next: (updatedTicket) => {
          this.tickets.update((tickets) =>
            tickets.map((item) =>
              item.idExternal === updatedTicket.idExternal ? updatedTicket : item,
            ),
          );
          this.toastService.show('Ingreso registrado correctamente.', 'success');
        },
        error: (error: unknown) => {
          const message =
            error instanceof HttpErrorResponse ? error.error?.message : null;
          this.toastService.show(
            message || 'No se pudo validar la entrada. Intentá nuevamente.',
            'error',
          );
        },
      });
  }

  private isApproved(ticket: OrganizerTicketDto): boolean {
    return ticket.confirmed && ticket.receipt.status === 'APROBADA';
  }

  private csvCell(value: string): string {
    const safeValue = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return `"${safeValue.replace(/"/g, '""')}"`;
  }

  private fileName(title: string): string {
    return title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es-AR')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
