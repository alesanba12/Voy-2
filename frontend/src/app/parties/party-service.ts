import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { PartyRes, PartyFormModel } from './party';

@Service()
export class PartyClient {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = '/api/parties';

  getAll(
    id: string | null,
    organizerId: string | null,
    title: string | null,
    city: string | null,
    from: string | null,
    to: string | null,
  ) {
    return this.http.get<PartyRes[]>(this.apiUrl);
  }

  getById(id: string) {
    return this.http.get<PartyRes>(this.apiUrl + '/' + id);
  }

  addParty(newParty: PartyFormModel) {
    const data = new FormData();
    data.append('title', newParty.title);
    data.append('description', newParty.description);
    data.append('city', newParty.city);
    data.append('adress', newParty.adress);
    data.append('price', String(newParty.price));
    data.append('dateTime', newParty.dateTime);
    data.append('guestLimit', String(newParty.guestLimit));
    data.append('partyAccesibility', String(newParty.partyAccesibility));
    newParty.tagsList.forEach((tag) => data.append('tagsList', tag));

    if (newParty.imageUrl) {
      data.append('image', newParty.imageUrl);
    }

    return this.http.post<PartyRes>(this.apiUrl + '/public', data);
  }

  deleteParty(id: string) {
    return this.http.delete<void>(this.apiUrl + '/' + id);
  }

  updateParty(id: string, editedParty: PartyFormModel) {
    return this.http.put<PartyRes>(this.apiUrl + '/' + id, editedParty);
  }
}
