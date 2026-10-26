import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartyDetail } from './party-detail';

describe('PartyDetail', () => {
  let component: PartyDetail;
  let fixture: ComponentFixture<PartyDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartyDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PartyDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
