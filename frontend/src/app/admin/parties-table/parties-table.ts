import { Component, computed, inject, signal } from '@angular/core';
import { AdminPartiesService } from './service/admin-parties-service';
import { PartyFilters, PartyRes } from '../../parties/party';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  selector: 'app-parties-table',
  styleUrl: './parties-table.css',
  templateUrl: './parties-table.html',
})
export class PartiesTable {
  private readonly partiesService = inject(AdminPartiesService);

  // Inputs de filtros (vinculados al formulario)
  readonly filterTitle = signal<string>('');
  readonly filterCity = signal<string>('');
  readonly filterFrom = signal<string>('');
  readonly filterTo = signal<string>('');

  // Signal que dispara el httpResource cuando se envía el formulario
  readonly appliedFilters = signal<PartyFilters>({});

  // Recurso reactivo: se ejecuta al montar y cada vez que cambia appliedFilters()
  readonly partiesResource = this.partiesService.getPartiesResource(this.appliedFilters);

  // Filtros rápidos en memoria (Frontend)
  readonly filterStatus = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  readonly filterVisibility = signal<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');

  // Estados de UI y modales
  readonly actionLoadingId = signal<string | null>(null);
  readonly mutationError = signal<string | null>(null);
  readonly selectedParty = signal<PartyRes | null>(null);
  readonly partyToDelete = signal<PartyRes | null>(null);
  readonly newTagInput = signal<string>('');

  // Alias directos desde el recurso
  readonly parties = computed(() => this.partiesResource.value());
  readonly isLoading = computed(() => this.partiesResource.isLoading());
  readonly errorMessage = computed(() => {
    if (this.mutationError()) return this.mutationError();
    if (this.partiesResource.error()) return 'No se pudieron cargar los eventos. Verifica tu sesión.';
    return null;
  });

  readonly filteredParties = computed(() => {
    const status = this.filterStatus();
    const visibility = this.filterVisibility();

    return this.parties().filter((p) => {
      const matchesStatus =
        status === 'ALL' ||
        (status === 'ACTIVE' && p.state) ||
        (status === 'INACTIVE' && !p.state);

      const matchesVisibility =
        visibility === 'ALL' ||
        (visibility === 'PUBLIC' && p.partyAccesibility) ||
        (visibility === 'PRIVATE' && !p.partyAccesibility);

      return matchesStatus && matchesVisibility;
    });
  });

  readonly hasActiveFilters = computed(() => {
    return (
      this.filterTitle().trim() !== '' ||
      this.filterCity().trim() !== '' ||
      this.filterFrom() !== '' ||
      this.filterTo() !== '' ||
      this.filterStatus() !== 'ALL' ||
      this.filterVisibility() !== 'ALL'
    );
  });

  readonly activeCount = computed(() => this.parties().filter((p) => p.state).length);
  readonly publicCount = computed(() => this.parties().filter((p) => p.partyAccesibility).length);

  // Al enviar el formulario, actualizamos appliedFilters() y httpResource hace el GET solo
  loadParties(): void {
    this.mutationError.set(null);
    const nextFilters: PartyFilters = {
      title: this.filterTitle(),
      city: this.filterCity(),
      from: this.filterFrom(),
      to: this.filterTo(),
    };

    // Si los filtros no cambiaron pero el usuario apretó "Buscar", forzamos recarga
    if (JSON.stringify(this.appliedFilters()) === JSON.stringify(nextFilters)) {
      this.partiesResource.reload();
    } else {
      this.appliedFilters.set(nextFilters);
    }
  }

  resetFilters(): void {
    if (!this.hasActiveFilters()) return;

    this.filterTitle.set('');
    this.filterCity.set('');
    this.filterFrom.set('');
    this.filterTo.set('');
    this.filterStatus.set('ALL');
    this.filterVisibility.set('ALL');
    this.appliedFilters.set({});
  }

  onToggleState(party: PartyRes): void {
    if (this.actionLoadingId()) return;
    this.actionLoadingId.set(party.externalId);

    this.partiesService.togglePartyState(party.externalId).subscribe({
      next: (updatedParty) => {
        // Actualizamos localmente el valor del httpResource sin rehacer el GET completo
        this.partiesResource.update((list) =>
          list.map((item) => (item.externalId === updatedParty.externalId ? updatedParty : item))
        );
        if (this.selectedParty()?.externalId === updatedParty.externalId) {
          this.selectedParty.set(updatedParty);
        }
        this.actionLoadingId.set(null);
      },
      error: () => {
        this.mutationError.set('Error al cambiar el estado del evento.');
        this.actionLoadingId.set(null);
      },
    });
  }

  openDetailModal(party: PartyRes): void {
    this.selectedParty.set(party);
    this.newTagInput.set('');
  }

  closeDetailModal(): void {
    this.selectedParty.set(null);
    this.newTagInput.set('');
  }

  onAddTag(): void {
    const party = this.selectedParty();
    const tag = this.newTagInput().trim();
    if (!party || !tag) return;

    this.partiesService.addTag(party.externalId, tag).subscribe({
      next: (updatedParty) => {
        this.selectedParty.set(updatedParty);
        this.partiesResource.update((list) =>
          list.map((p) => (p.externalId === updatedParty.externalId ? updatedParty : p))
        );
        this.newTagInput.set('');
      },
      error: () => {
        this.mutationError.set('No se pudo agregar la etiqueta (verifica que exista o no esté duplicada).');
      },
    });
  }

  onRemoveTag(tagName: string): void {
    const party = this.selectedParty();
    if (!party) return;

    this.partiesService.removeTag(party.externalId, tagName).subscribe({
      next: () => {
        const updatedTags = party.tags.filter((t) => t !== tagName);
        const updatedParty: PartyRes = { ...party, tags: updatedTags };
        this.selectedParty.set(updatedParty);
        this.partiesResource.update((list) =>
          list.map((p) => (p.externalId === updatedParty.externalId ? updatedParty : p))
        );
      },
      error: () => {
        this.mutationError.set('Error al quitar la etiqueta del evento.');
      },
    });
  }

  confirmDelete(party: PartyRes): void {
    this.partyToDelete.set(party);
  }

  cancelDelete(): void {
    this.partyToDelete.set(null);
  }

  executeDelete(): void {
    const party = this.partyToDelete();
    if (!party) return;

    this.actionLoadingId.set(party.externalId);
    this.partiesService.deleteParty(party.externalId).subscribe({
      next: () => {
        this.partiesResource.update((list) => list.filter((p) => p.externalId !== party.externalId));
        if (this.selectedParty()?.externalId === party.externalId) {
          this.selectedParty.set(null);
        }
        this.partyToDelete.set(null);
        this.actionLoadingId.set(null);
      },
      error: () => {
        this.mutationError.set('No se pudo eliminar el evento.');
        this.partyToDelete.set(null);
        this.actionLoadingId.set(null);
      },
    });
  }
}
