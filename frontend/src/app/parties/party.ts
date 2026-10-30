export interface Party {
        "id": string,
        "title": string,
        "description": string,
        "city": string,
        "adress": string,
        "price": number,
        "dateTime": string,
        "guestLimit": number,
        "partyAccesibility": boolean,
        "state": boolean,
        "organizerName": string,///deberia mostrar username no el email, pero por ahora dejo el email como identificador
        "coOrganizerName": string[],
        "tags": string[]
}

export type PartyFormModel = Omit<Party,'id'>;