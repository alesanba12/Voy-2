import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { TagsService } from '../../tags/tags.service';
import { PartyClient } from '../party-service';
import { PartyRes } from '../party';
import { PartyForm } from './party-form';

describe('PartyForm', () => {
  const party: PartyRes = {
    externalId: 'party-id',
    title: 'Evento de prueba',
    description: 'Una descripción completa para probar la edición.',
    city: 'Mar del Plata',
    adress: 'Calle de prueba 123',
    price: 100,
    dateTime: '2027-01-02T18:00:00',
    guestLimit: 100,
    partyAccesibility: false,
    tickets: true,
    state: true,
    organizerName: 'organizer@example.com',
    coOrganizerName: [],
    tags: ['Música'],
    imageUrl: 'event-image.jpg',
  };
  const getById = vi.fn();

  beforeEach(async () => {
    getById.mockReturnValue(of(party));

    await TestBed.configureTestingModule({
      imports: [PartyForm],
      providers: [
        provideRouter([{ path: ':id/edit', component: PartyForm }]),
        { provide: PartyClient, useValue: { getById } },
        { provide: TagsService, useValue: { getTagsResource: () => ({ value: () => [] }) } },
      ],
    }).compileComponents();
  });

  it('loads the selected event when navigating to its edit route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/party-id/edit', PartyForm);

    expect(getById).toHaveBeenCalledWith('party-id');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent?.trim())
      .toBe('Editando tu evento');
    expect(harness.routeNativeElement?.querySelector<HTMLInputElement>('#title')?.value)
      .toBe(party.title);
  });
});
