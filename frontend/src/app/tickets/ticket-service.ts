import { Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrganizerTicketDto, TicketAndReceiptDto, TicketReqDto } from './ticket';

@Injectable({ providedIn: 'root' })
export class TicketClient {
  private readonly http = inject(HttpClient);

  purchase(req: TicketReqDto): Observable<TicketAndReceiptDto> {
    return this.http.post<TicketAndReceiptDto>('/api/tickets', req);
  }

  listOrganizerTickets(): Observable<OrganizerTicketDto[]> {
    return this.http.get<OrganizerTicketDto[]>('/api/tickets/organizer');
  }
}