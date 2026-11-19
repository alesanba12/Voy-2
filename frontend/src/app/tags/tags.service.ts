import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { Service, Signal, inject } from '@angular/core';
import { DeleteTagReqDTO, TagDTO } from './tags';

@Service()
export class TagsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/tags';

  getTagsResource(nameFilter?: Signal<string>): HttpResourceRef<TagDTO[]> {
    return httpResource<TagDTO[]>(
      () => {
        const name = nameFilter?.().trim();
        return {
          url: this.apiUrl,
          params: name ? { name } : undefined,
        };
      },
      {
        defaultValue: [],
      }
    );
  }

  create(tag: TagDTO) {
    return this.http.post<TagDTO>(this.apiUrl, tag);
  }

  update(oldName: string, tag: TagDTO) {
    const url = `${this.apiUrl}/${encodeURIComponent(oldName)}`;
    return this.http.put<void>(url, tag);
  }

  delete(payload: DeleteTagReqDTO) {
    return this.http.delete<void>(this.apiUrl, { body: payload });
  }
}
