import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizerRequestsTable } from './organizer-requests-table';

describe('OrganizerRequestsTable', () => {
  let component: OrganizerRequestsTable;
  let fixture: ComponentFixture<OrganizerRequestsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerRequestsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizerRequestsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
