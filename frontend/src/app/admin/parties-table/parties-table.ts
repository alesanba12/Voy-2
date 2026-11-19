import { Component, computed, ElementRef, HostListener, inject, signal } from '@angular/core';
import { AdminPartiesService } from './service/admin-parties-service';
import { PartyAdminFilters, PartyRes } from '../../parties/party';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { TagList } from '../../tags/tag-list/tag-list';

@Component({
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, LoadingSpinner, TagList],
  selector: 'app-parties-table',
  styleUrl: './parties-table.css',
  templateUrl: './parties-table.html',
})
export class PartiesTable {
  private readonly partiesService = inject(AdminPartiesService);
  private readonly elementRef = inject(ElementRef);

  // Inputs de filtros (vinculados al formulario)
  readonly filterTitle = signal<string>('');
  readonly filterCity = signal<string>('');
  readonly filterFrom = signal<string>('');
  readonly filterTo = signal<string>('');

  // Signal que dispara el httpResource cuando se envía el formulario
  readonly appliedFilters = signal<PartyAdminFilters>({});

  // Recurso reactivo: se ejecuta al montar y cada vez que cambia appliedFilters()
  readonly partiesResource = this.partiesService.getPartiesResource(this.appliedFilters);

  // Filtros rápidos en memoria (Frontend)
  readonly filterStatus = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  readonly filterVisibility = signal<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');
  readonly filterTags = signal<string[]>([]);
  readonly tagsDropdownOpen = signal<boolean>(false);
  readonly tagSearchQuery = signal<string>('');

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
    const selectedTags = this.filterTags();
    if (selectedTags.length === 0) return this.parties();

    return this.parties().filter((p) =>
      selectedTags.every((tag) => p.tags.includes(tag))
    );
  });

  readonly hasActiveFilters = computed(() => {
    return (
      this.filterTitle().trim() !== '' ||
      this.filterCity().trim() !== '' ||
      this.filterFrom() !== '' ||
      this.filterTo() !== '' ||
      this.filterStatus() !== 'ALL' ||
      this.filterVisibility() !== 'ALL' ||
      this.filterTags().length > 0
    );
  });

  onStatusFilterChange(value: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.filterStatus.set(value);
    this.loadParties();
  }

  onVisibilityFilterChange(value: 'ALL' | 'PUBLIC' | 'PRIVATE'): void {
    this.filterVisibility.set(value);
    this.loadParties();
  }

  readonly activeCount = computed(() => this.parties().filter((p) => p.logicState).length);
  readonly inactiveCount = computed(() => this.parties().filter((p) => !p.logicState).length);
  readonly publicCount = computed(() => this.parties().filter((p) => p.partyAccesibility).length);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.tagsDropdownOpen()) return;
    const dropdownEl = this.elementRef.nativeElement.querySelector('.tags-dropdown');
    if (dropdownEl && !dropdownEl.contains(event.target as Node)) {
      this.tagsDropdownOpen.set(false);
    }
  }

  toggleTagsDropdown(): void {
    this.tagsDropdownOpen.update((open) => !open);
  }

  loadParties(): void {
    this.mutationError.set(null);
    this.tagsDropdownOpen.set(false);

    const status = this.filterStatus();
    const visibility = this.filterVisibility();

    const nextFilters: PartyAdminFilters = {
      title: this.filterTitle(),
      city: this.filterCity(),
      from: this.filterFrom(),
      to: this.filterTo(),
      logicState: status === 'ALL' ? undefined : status === 'ACTIVE',
      isPublic: visibility === 'ALL' ? undefined : visibility === 'PUBLIC',
    };

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
    this.filterTags.set([]);
    this.tagsDropdownOpen.set(false);
    this.appliedFilters.set({});
  }

  onToggleState(party: PartyRes): void {
    if (this.actionLoadingId()) return;
    this.actionLoadingId.set(party.externalId);
    this.mutationError.set(null);

    this.partiesService.togglePartyState(party.externalId).subscribe({
      next: () => {
        this.actionLoadingId.set(null);
        this.partiesResource.reload();
      },
      error: (err) => {
        this.actionLoadingId.set(null);
        this.mutationError.set(
          err.error?.message || 'No se pudo cambiar el estado del evento.'
        );
      },
    });
  }

  openDetailModal(party: PartyRes): void {
    this.mutationError.set(null);
    this.newTagInput.set('');
    this.selectedParty.set(party);
  }

  closeDetailModal(): void {
    this.selectedParty.set(null);
    this.newTagInput.set('');
  }

  onAddTagToParty(partyId: string): void {
    const tagName = this.newTagInput().trim();
    if (!tagName || this.actionLoadingId()) return;

    this.actionLoadingId.set(partyId);
    this.mutationError.set(null);

    this.partiesService.addTag(partyId, tagName).subscribe({
      next: (updatedParty) => {
        this.actionLoadingId.set(null);
        this.newTagInput.set('');
        this.selectedParty.set(updatedParty);
        this.partiesResource.reload();
      },
      error: (err) => {
        this.actionLoadingId.set(null);
        this.mutationError.set(
          err.error?.message || 'No se pudo asociar la etiqueta al evento.'
        );
      },
    });
  }

  onRemoveTagFromParty(partyId: string, tagName: string): void {
    if (this.actionLoadingId()) return;

    this.actionLoadingId.set(partyId);
    this.mutationError.set(null);

    this.partiesService.removeTag(partyId, tagName).subscribe({
      next: () => {
        this.actionLoadingId.set(null);
        const current = this.selectedParty();
        if (current) {
          const updatedTags = current.tags.filter((t) => t !== tagName);
          this.selectedParty.set({ ...current, tags: updatedTags });
        }
        this.partiesResource.reload();
      },
      error: (err) => {
        this.actionLoadingId.set(null);
        this.mutationError.set(
          err.error?.message || 'No se pudo remover la etiqueta del evento.'
        );
      },
    });
  }

  confirmDeleteParty(party: PartyRes): void {
    this.mutationError.set(null);
    this.partyToDelete.set(party);
  }

  cancelDelete(): void {
    this.partyToDelete.set(null);
  }

  executeDeleteParty(): void {
    const party = this.partyToDelete();
    if (!party || this.actionLoadingId()) return;

    this.actionLoadingId.set(party.externalId);
    this.mutationError.set(null);

    this.partiesService.deleteParty(party.externalId).subscribe({
      next: () => {
        this.actionLoadingId.set(null);
        this.partyToDelete.set(null);
        this.partiesResource.reload();
      },
      error: (err) => {
        this.actionLoadingId.set(null);
        this.mutationError.set(
          err.error?.message || 'No se pudo eliminar el evento.'
        );
      },
    });
  }
}
