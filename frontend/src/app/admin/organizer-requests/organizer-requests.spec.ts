import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizerRequests } from './organizer-requests';

describe('OrganizerRequests', () => {
  let component: OrganizerRequests;
  let fixture: ComponentFixture<OrganizerRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizerRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
