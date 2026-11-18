import { PartyRes } from "../parties/party";

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
  party: PartyRes;
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
  //receipt: ReceiptResponseDto; // ajustalo a tu ReceiptResponseDTO
  ticketsExternalIds: string[];
}

export interface TicketDto {
  ticketExternalId: string;
  userName: string;
  userEmail: string;
  party: PartyRes;
  confirmed: boolean;
  //receipt: ReceiptResponseDto; // el tipo que uses para el recibo
}