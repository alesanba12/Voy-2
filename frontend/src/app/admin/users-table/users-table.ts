import { Component, computed, inject, signal } from "@angular/core";
import { UserDto } from "../../user/user";
import { UsersTableService } from "./users-table.service";
import { FormsModule } from "@angular/forms";
import { LoadingSpinner } from "../../shared/components/loading-spinner/loading-spinner";

type RoleFilter = 'ALL' | 'ORGANIZER' | 'USER';

@Component({
  imports: [FormsModule, LoadingSpinner],
  selector: 'app-users-table',
  styleUrl: './users-table.css',
  templateUrl: './users-table.html',
})
export class UsersTable {
  private readonly userService = inject(UsersTableService);

  // Filtros conectados al backend
  readonly searchUsername = signal('');
  readonly searchEmail = signal('');

  // Filtro local rápido por rol
  readonly roleFilter = signal<RoleFilter>('ALL');

  // Estado de acciones y modal
  readonly processingIds = signal<Set<string>>(new Set());
  readonly userToDelete = signal<UserDto | null>(null);
  readonly feedbackMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Señal computada que dispara el httpResource cuando cambian username o email
  private readonly queryParams = computed(() => ({
    username: this.searchUsername(),
    email: this.searchEmail(),
  }));

  readonly usersResource = this.userService.getUsersResource(this.queryParams);

  // Lista filtrada por rol sobre los resultados devueltos por la API
  readonly filteredUsers = computed(() => {
    const users = this.usersResource.value() ?? [];
    const role = this.roleFilter();

    if (role === 'ORGANIZER') return users.filter((u) => u.isOrganizer);
    if (role === 'USER') return users.filter((u) => !u.isOrganizer);
    return users;
  });

  // Métricas rápidas para la cabecera de la tarjeta
  readonly totalCount = computed(() => this.usersResource.value()?.length ?? 0);
  readonly organizersCount = computed(
    () => this.usersResource.value()?.filter((u) => u.isOrganizer).length ?? 0
  );

  readonly hasActiveFilters = computed(
    () =>
      this.searchUsername().trim() !== '' ||
      this.searchEmail().trim() !== '' ||
      this.roleFilter() !== 'ALL'
  );

  clearFilters(): void {
    this.searchUsername.set('');
    this.searchEmail.set('');
    this.roleFilter.set('ALL');
  }

  getInitials(username: string): string {
    if (!username) return '?';
    return username.slice(0, 2).toUpperCase();
  }

  isProcessing(id: string): boolean {
    return this.processingIds().has(id);
  }

  openDeleteModal(user: UserDto): void {
    this.userToDelete.set(user);
  }

  closeDeleteModal(): void {
    this.userToDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const target = this.userToDelete();
    if (!target || this.isProcessing(target.externalId)) return;

    this.setProcessing(target.externalId, true);
    try {
      await this.userService.deleteUserByAdmin(target.externalId);
      this.showFeedback(`Usuario @${target.username} eliminado correctamente.`, 'success');
      this.closeDeleteModal();
      this.usersResource.reload();
    } catch {
      this.showFeedback(`Error al eliminar al usuario @${target.username}.`, 'error');
    } finally {
      this.setProcessing(target.externalId, false);
    }
  }

  private setProcessing(id: string, active: boolean): void {
    this.processingIds.update((prev) => {
      const next = new Set(prev);
      active ? next.add(id) : next.delete(id);
      return next;
    });
  }

  private showFeedback(text: string, type: 'success' | 'error'): void {
    this.feedbackMessage.set({ text, type });
    setTimeout(() => this.feedbackMessage.set(null), 4000);
  }
}