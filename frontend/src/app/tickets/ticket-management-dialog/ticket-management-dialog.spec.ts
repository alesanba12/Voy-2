import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PartyRes } from '../../parties/party';
import { PartySummaryDto } from '../../user/user';
import { ToastService } from '../../shared/components/toast/toast-service';
import { OrganizerTicketDto } from '../ticket';
import { TicketClient } from '../ticket-service';
import { TicketManagementDialog } from './ticket-management-dialog';

describe('TicketManagementDialog', () => {
  let fixture: ComponentFixture<TicketManagementDialog>;
  let ticketClient: {
    listOrganizerTickets: ReturnType<typeof vi.fn>;
    checkInOrganizerTicket: ReturnType<typeof vi.fn>;
  };
  let toastService: { show: ReturnType<typeof vi.fn> };
  let ticket: OrganizerTicketDto;
  const partyId = 'party-123';
  const ticketId = 'ticket-456';

  beforeEach(async () => {
    const party: PartySummaryDto = {
      externalId: partyId,
      title: 'Evento de prueba',
      description: '',
      city: '',
      price: 250,
      adress: '',
      dateTime: '2026-12-01T20:00:00',
      organizer: {
        externalId: 'organizer-789',
        username: 'organizer',
        email: 'organizer@example.com',
        bio: '',
        isOrganizer: true,
        imageUrl: null,
      },
      imageUrl: null,
      tags: [],
    };
    const ticketParty: PartyRes = {
      externalId: partyId,
      title: party.title,
      description: party.description,
      city: party.city,
      adress: party.adress,
      price: party.price,
      dateTime: party.dateTime,
      guestLimit: 100,
      partyAccesibility: false,
      tickets: true,
      state: true,
      organizerName: 'organizer@example.com',
      coOrganizerName: [],
      tags: [],
      imageUrl: '',
    };
    ticket = {
      idExternal: ticketId,
      userEmail: 'guest@example.com',
      party: ticketParty,
      confirmed: true,
      checkedIn: false,
      receipt: { price: 250, status: 'APROBADA' },
    };
    ticketClient = {
      listOrganizerTickets: vi.fn().mockReturnValue(of([ticket])),
      checkInOrganizerTicket: vi.fn().mockReturnValue(of({ ...ticket, checkedIn: true })),
    };
    toastService = { show: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TicketManagementDialog],
      providers: [
        { provide: TicketClient, useValue: ticketClient },
        { provide: ToastService, useValue: toastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketManagementDialog);
    fixture.componentRef.setInput('party', party);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads the tickets scoped to the selected event', () => {
    expect(ticketClient.listOrganizerTickets).toHaveBeenCalledWith(partyId);
    expect(fixture.nativeElement.textContent).toContain('guest@example.com');
  });

  it('marks a confirmed ticket as checked in', () => {
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('.check-in-button');
    button.click();
    fixture.detectChanges();

    expect(ticketClient.checkInOrganizerTicket).toHaveBeenCalledWith(ticketId);
    expect(toastService.show).toHaveBeenCalledWith(
      'Ingreso registrado correctamente.',
      'success',
    );
    expect(fixture.nativeElement.textContent).toContain('Ingresó');
  });
});
