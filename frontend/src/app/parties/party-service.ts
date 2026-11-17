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

  private toFormData(party: PartyFormModel): FormData {
    const data = new FormData();
    data.append('title', party.title);
    data.append('description', party.description);
    data.append('city', party.city);
    data.append('adress', party.adress);
    data.append('price', String(party.price));
    data.append('dateTime', party.dateTime);
    data.append('guestLimit', String(party.guestLimit));
    data.append('partyAccesibility', String(party.partyAccesibility));
    data.append('tickets', String(party.tickets));
    party.tagsList.forEach((tag) => data.append('tagsList', tag));

    if (party.imageUrl) {
      data.append('image', party.imageUrl);
    }

    return data;
  }

  addParty(newParty: PartyFormModel) {
    return this.http.post<PartyRes>(this.apiUrl + '/public', this.toFormData(newParty));
  }

  deleteParty(id: string) {
    return this.http.delete<void>(this.apiUrl + '/' + id);
  }

  updateParty(id: string, editedParty: PartyFormModel) {
    return this.http.put<PartyRes>(this.apiUrl + '/' + id, this.toFormData(editedParty));
  }

  addCoOrganizer(partyId: string, otherUserExtId: string) {
    return this.http.patch<PartyRes>(`${this.apiUrl}/${partyId}/coOrganizers/add`, null, {
      params: { otherUserExtId },
    });
  }

  removeCoOrganizer(partyId: string, otherUserExtId: string) {
    return this.http.patch<PartyRes>(`${this.apiUrl}/${partyId}/coOrganizers/remove`, null, {
      params: { otherUserExtId },
    });
  }
}
