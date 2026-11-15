import { Component, inject, signal } from '@angular/core';
import { TagsService } from '../tags.service';
import { TagDTO } from '../tags';

@Component({
  imports: [],
  selector: 'app-tag-list',
  styleUrl: './tag-list.css',
  templateUrl: './tag-list.html',
})
export class TagList {
  private readonly tagService = inject(TagsService);

  searchName = signal('');
  
  tagsResource = this.tagService.getTagsResource(this.searchName);

  crearEtiqueta(nueva: TagDTO) {
    this.tagService.create(nueva).subscribe(() => {
      this.tagsResource.reload();
    });
  }
}
