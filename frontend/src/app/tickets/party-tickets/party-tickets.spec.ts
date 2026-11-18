import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartyTickets } from './party-tickets';

describe('PartyTickets', () => {
  let component: PartyTickets;
  let fixture: ComponentFixture<PartyTickets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartyTickets],
    }).compileComponents();

    fixture = TestBed.createComponent(PartyTickets);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
