import { Component, inject, signal } from '@angular/core';
import { TagsService } from '../tags.service';

@Component({
  imports: [],
  selector: 'app-tags-admin',
  styleUrl: './tags-admin.css',
  templateUrl: './tags-admin.html',
})
export class TagsAdmin {private readonly tagService = inject(TagsService);

  // httpResource que carga las etiquetas activas
  protected readonly tags = this.tagService.getTagsResource();
  protected readonly newTagName = signal('');
  protected readonly isSubmitting = signal(false);

  protected onAddTag(event: Event): void {
    event.preventDefault();
    const name = this.newTagName().trim();
    if (!name || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.tagService.create({ name }).subscribe({
      next: () => {
        this.newTagName.set('');
        this.tags.reload(); // Refresca la lista reactivamente
        this.isSubmitting.set(false);
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  protected onDeleteTag(name: string): void {
    this.tagService.delete({ name }).subscribe({
      next: () => this.tags.reload()
    });
  }}
