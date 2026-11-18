import { Service } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { PartyFilters, PartyRes } from '../../../parties/party';

@Service()
export class AdminPartiesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/parties'; 


  getPartiesResource(filters: () => PartyFilters) {
    return httpResource<PartyRes[]>(
      () => {
        const current = filters();
        const params: Record<string, string> = {};

        if (current.title?.trim()) params['title'] = current.title.trim();
        if (current.city?.trim()) params['city'] = current.city.trim();
        if (current.from) params['from'] = current.from;
        if (current.to) params['to'] = current.to;

        return {
          url: this.apiUrl,
          params,
        };
      },
      { defaultValue: [] }
    );
  }

  getPartyById(id: string) {
    return this.http.get<PartyRes>(`${this.apiUrl}/${id}`);
  }

  togglePartyState(id: string) {
    return this.http.patch<PartyRes>(`${this.apiUrl}/${id}/state`, {});
  }

  addTag(id: string, tagName: string) {
    return this.http.post<PartyRes>(`${this.apiUrl}/${id}/tag`, { name: tagName });
  }

  removeTag(id: string, tagName: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}/tag`, {
      body: { name: tagName },
    });
  }

  deleteParty(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
