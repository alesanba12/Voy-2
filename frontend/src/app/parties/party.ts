export interface PartyRes {
        "externalId": string,
        "title": string,
        "description": string,
        "city": string,
        "adress": string,
        "price": number,
        "dateTime": string,
        "guestLimit": number,
        "partyAccesibility": boolean,
        "tickets": boolean,
        "logicState": boolean,
        "organizerName": string,///deberia mostrar username no el email, pero por ahora dejo el email como identificador
        "coOrganizerName": string[],
        "tags": string[],
        "imageUrl": string
}
export interface PartyReq {
        "externalId": string,
        "title": string,
        "description": string,
        "city": string,
        "adress": string,
        "price": number,
        "dateTime": string,
        "guestLimit": number,
        "partyAccesibility": boolean,
        "tickets": boolean,
        "tagsList": string[],
        "imageUrl": File | null,
}
export type PartyFormModel = Omit<PartyReq,'externalId' | 'logicState' | 'organizerName' | 'coOrganizerName'>;

export function toFormModel(party: PartyRes): PartyFormModel {
  return {
    title: party.title,
    description: party.description,
    city: party.city,
    adress: party.adress,
    price: party.price,
    dateTime: party.dateTime.slice(0, 16),
    guestLimit: party.guestLimit,
    partyAccesibility: party.partyAccesibility,
    tickets: party.tickets,
    tagsList: [...party.tags],
    imageUrl: null,
  };
}

export interface PartyFilters {
  title?: string;
  city?: string;
  from?: string;
  to?: string;
}

export interface PartyAdminFilters extends PartyFilters {
  logicState?: boolean;
  isPublic?: boolean;
}
