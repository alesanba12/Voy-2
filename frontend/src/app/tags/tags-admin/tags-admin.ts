import { Component, computed, inject, signal } from '@angular/core';
import { TagsService } from '../tags.service';

@Component({
  imports: [],
  selector: 'app-tags-admin',
  styleUrl: './tags-admin.css',
  templateUrl: './tags-admin.html',
})
export class TagsAdmin {
  private readonly tagService = inject(TagsService);

  // httpResource que carga las etiquetas activas
  protected readonly tags = this.tagService.getTagsResource();
  protected readonly newTagName = signal('');
  protected readonly isSubmitting = signal(false);

  // Estado del modal de reemplazo
  protected readonly tagPendingDeletion = signal<string | null>(null);
  protected readonly selectedReplacementTag = signal<string>('');
  protected readonly isDeleting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Lista de etiquetas elegibles como reemplazo
  protected readonly availableReplacements = computed(() => {
    const current = this.tagPendingDeletion();
    const allTags = this.tags.value() ?? [];
    return allTags.filter((t) => t.name !== current);
  });

  protected onAddTag(event: Event): void {
    event.preventDefault();
    const name = this.newTagName().trim();
    if (!name || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.tagService.create({ name }).subscribe({
      next: () => {
        this.newTagName.set('');
        this.tags.reload();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Error al crear la etiqueta');
        this.isSubmitting.set(false);
      },
    });
  }

  protected onDeleteTag(name: string): void {
    if (this.isDeleting()) return;

    this.isDeleting.set(true);
    this.errorMessage.set(null);
    this.tagService.delete({ tagName: name }).subscribe({
      next: () => {
        this.tags.reload();
        this.isDeleting.set(false);
      },
      error: (err) => {
        this.isDeleting.set(false);
        // Si el backend responde 403 (dejaría eventos sin etiquetas)
        if (err.status === 403) {
          this.tagPendingDeletion.set(name);
          const firstAvailable = this.availableReplacements()[0]?.name ?? '';
          this.selectedReplacementTag.set(firstAvailable);
        } else {
          this.errorMessage.set(err.error?.message || 'Error al eliminar la etiqueta');
        }
      },
    });
  }

  protected onConfirmReplacement(): void {
    const tagName = this.tagPendingDeletion();
    const replacementTagName = this.selectedReplacementTag();
    if (!tagName || !replacementTagName || this.isDeleting()) return;

    this.isDeleting.set(true);
    this.errorMessage.set(null);
    this.tagService.delete({ tagName, replacementTagName }).subscribe({
      next: () => {
        this.tagPendingDeletion.set(null);
        this.selectedReplacementTag.set('');
        this.tags.reload();
        this.isDeleting.set(false);
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.errorMessage.set(err.error?.message || 'Error al reasignar y eliminar la etiqueta');
      },
    });
  }

  protected onCancelModal(): void {
    this.tagPendingDeletion.set(null);
    this.selectedReplacementTag.set('');
  }
}
