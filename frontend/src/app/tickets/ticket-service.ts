import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrganizerTicketDto, TicketAndReceiptDto, TicketReqDto } from './ticket';

@Injectable({ providedIn: 'root' })
export class TicketClient {
  private readonly http = inject(HttpClient);

  purchase(req: TicketReqDto): Observable<TicketAndReceiptDto> {
    return this.http.post<TicketAndReceiptDto>('/api/tickets', req);
  }

  listOrganizerTickets(partyId?: string): Observable<OrganizerTicketDto[]> {
    let params = new HttpParams();
    if (partyId) {
      params = params.set('partyId', partyId);
    }
    return this.http.get<OrganizerTicketDto[]>('/api/tickets/organizer', { params });
  }

  checkInOrganizerTicket(ticketId: string): Observable<OrganizerTicketDto> {
    return this.http.patch<OrganizerTicketDto>(
      `/api/tickets/organizer/${ticketId}/check-in`,
      null,
    );
  }

  return(ticketExternalId: string): Observable<void> {
    return this.http.delete<void>(`/api/tickets/returnTicket/${ticketExternalId}`);
  }

  transfer(ticketExternalId: string, newUserEmail: string): Observable<unknown> {
    return this.http.patch(`/api/tickets/transferTicket/${ticketExternalId}`, null, {
      params: new HttpParams().set('newUserEmail', newUserEmail),
    });
  }
}
