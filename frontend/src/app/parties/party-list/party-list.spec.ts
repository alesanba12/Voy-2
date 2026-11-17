import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PartyList } from './party-list';

describe('PartyList', () => {
  let component: PartyList;
  let fixture: ComponentFixture<PartyList>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartyList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PartyList);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpTesting.expectOne((request) => request.url === '/api/parties').flush([]);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a contextual empty state for the active filters', () => {
    const heading = () => fixture.nativeElement.querySelector('.empty-state h2')?.textContent.trim();

    expect(heading()).toBe('No encontramos eventos con los filtros seleccionados');

    component['filterByCity'].set('Mar del Plata');
    fixture.detectChanges();
    expect(heading()).toBe('No encontramos eventos en Mar del Plata');

    component['filterByPartyTitle'].set('Tango');
    fixture.detectChanges();
    expect(heading()).toBe('No encontramos eventos para “Tango” en Mar del Plata');

    component['filterByPartyTitle'].set(null);
    component['filterByCity'].set(null);
    component['filterByTags'].set('Música');
    fixture.detectChanges();
    expect(heading()).toBe('No encontramos eventos de Música');
  });
});
