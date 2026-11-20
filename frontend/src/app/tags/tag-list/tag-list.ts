import { Component, computed, inject, input, model } from '@angular/core';
import { TagsService } from '../tags.service';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.html',
  styleUrl: './tag-list.css',
  imports: []
})
export class TagList {
  private readonly tagsService = inject(TagsService);

  readonly tagsResource = this.tagsService.getTagsResource();
  readonly selectedTags = model<string[]>([]);
  readonly searchQuery = input<string>('');

  readonly visibleTags = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const allTags = this.tagsResource.value() ?? [];
    if (!query) return allTags;
    return allTags.filter((tag) => tag.name.toLowerCase().includes(query));
  });

  toggleTag(tagName: string): void {
    this.selectedTags.update((current) =>
      current.includes(tagName)
        ? current.filter((t) => t !== tagName)
        : [...current, tagName]
    );
  }

  isSelected(tagName: string): boolean {
    return this.selectedTags().includes(tagName);
  }
}