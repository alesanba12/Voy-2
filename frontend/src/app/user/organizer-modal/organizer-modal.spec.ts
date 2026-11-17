import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizerModal } from './organizer-modal';

describe('OrganizerModal', () => {
  let component: OrganizerModal;
  let fixture: ComponentFixture<OrganizerModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerModal],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizerModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
