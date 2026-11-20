import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { Service, Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type ReceiptStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | string;

export interface PartySummaryDto {
  externalId: string;
  title: string;
  description: string;
  city: string;
  adress: string;
  price: number;
  dateTime: string;
  guestLimit: number;
  partyAccesibility: boolean;
  logicState: boolean;
  tickets: boolean;
  organizerName: string;
  imageUrl: string | null;
  coOrganizerName: string[];
  tags: string[];
}

export interface ReceiptSummaryDto {
  externalId: string;
  price: number;
  quantity: number;
  paymentMethod: string;
  finalPrice: number;
  paymentDate: string;
  status: ReceiptStatus;
  user?: {
    externalId: string;
    username: string;
    email: string;
  };
}

export interface TicketResponseDto {
  idExternal: string;
  userExternalId: string;
  userEmail: string;
  party: PartySummaryDto;
  confirmed: boolean;
  checkedIn: boolean;
  receipt: ReceiptSummaryDto | null;
}

export interface TicketAdminFilters {
  title: string;
  usernameUser: string;
  usernameOrganizer: string;
  isConfirmed: '' | 'true' | 'false';
}

@Service()
export class TicketsService {
    private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/tickets';

  getAdminTicketsResource(filters: Signal<TicketAdminFilters>) {
    return httpResource<TicketResponseDto[]>(() => {
      const { title, usernameUser, usernameOrganizer, isConfirmed } = filters();
      let params = new HttpParams();

      if (title.trim()) {
        params = params.set('title', title.trim());
      }
      if (usernameUser.trim()) {
        params = params.set('usernameUser', usernameUser.trim());
      }
      if (usernameOrganizer.trim()) {
        params = params.set('usernameOrganizer', usernameOrganizer.trim());
      }
      if (isConfirmed !== '') {
        params = params.set('isConfirmed', isConfirmed);
      }

      const queryString = params.toString();
      return queryString ? `${this.apiUrl}/admin?${queryString}` : `${this.apiUrl}/admin`;
    });
  }

  confirmPurchase(receiptExtId: string): Promise<unknown> {
    return firstValueFrom(
      this.http.patch(`${this.apiUrl}/confirmTickets/${receiptExtId}`, {})
    );
  }

  rejectPurchase(receiptId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.apiUrl}/rejectPurchase/${receiptId}`)
    );
  }
}

