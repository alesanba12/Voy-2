import { PartyRes } from "../parties/party";
import { ReceiptResponseDto } from "../receipts/receipts";

export interface Ticket {
        userExternalId: string,
        userEmail: string,
        ticketExternalId: string,
}
export interface TicketDto {
        userEmail: string,
        ticketExternalId: string
        party: PartyRes
}

export type ReceiptStatus = 'APROBADA' | 'PENDIENTE' | 'RECHAZADA';

export interface OrganizerTicketDto {
  idExternal: string;
  userEmail: string;
  party: PartyRes;
  confirmed: boolean;
  checkedIn: boolean;
  receipt: {
    price: number;
    status: ReceiptStatus;
  };
}

export interface TicketReqDto{
        paymentMethod: string,
        quantity: number,
        partyIdExternal: string,
}

export interface TicketAndReceiptDto {
  userExternalId: string;
  userEmail: string;
  party: PartyRes;
  receipt: ReceiptResponseDto;
  ticketsExternalIds: string[];
}

export interface TicketDto {
  ticketExternalId: string;
  userName: string;
  userEmail: string;
  party: PartyRes;
  confirmed: boolean;
  checkedIn: boolean;
  receipt: ReceiptResponseDto;
}