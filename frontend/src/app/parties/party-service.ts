import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { Party, PartyFormModel } from './party';

@Service()
export class PartyClient {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly apiUrl = '/api/parties';

    getAll(id: string | null, organizerId: string | null, title: string | null, city: string | null, from: string | null, to: string | null){
        return this.http.get<Party[]>(this.apiUrl);
    }

    getById(id: string){
        return this.http.get<Party>(this.apiUrl + '/' + id);
    }

    addParty(newParty: PartyFormModel){
        return this.http.post<Party>(this.apiUrl, newParty);
    }

    deleteParty(id: string){
        return this.http.delete<void>(this.apiUrl + '/' + id);
    }

    updateParty(id: string, editedParty: PartyFormModel){
        return this.http.put<Party>(this.apiUrl + '/' + id, editedParty);
    }

}
