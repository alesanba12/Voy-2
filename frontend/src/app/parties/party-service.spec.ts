import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PartyRes, PartyFormModel } from './party';
import { PartyClient } from './party-service';

describe('PartyClient', () => {
  let client: PartyClient;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    client = TestBed.inject(PartyClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('sends party updates as multipart form data', () => {
    const image = new File(['image'], 'party.jpg', { type: 'image/jpeg' });
    const party: PartyFormModel = {
      title: 'Evento de prueba',
      description: 'Una descripción completa para probar la edición.',
      city: 'Mar del Plata',
      adress: 'Calle de prueba 123',
      price: 100,
      dateTime: '2027-01-02T18:00:00',
      guestLimit: 100,
      partyAccesibility: true,
      tickets: true,
      tagsList: ['Música', 'Danza'],
      imageUrl: image,
    };

    client.updateParty('party-id', party).subscribe();

    const request = httpTesting.expectOne('/api/parties/party-id');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toBeInstanceOf(FormData);
    const formData = request.request.body as FormData;
    expect(formData.get('tagsList')).toBe('Música');
    expect(formData.getAll('tagsList')).toEqual(['Música', 'Danza']);
    expect(formData.get('image')).toBe(image);
    request.flush({} as PartyRes);
  });
});
