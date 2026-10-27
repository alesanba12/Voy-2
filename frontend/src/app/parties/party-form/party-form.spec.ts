import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartyForm } from './party-form';

describe('PartyForm', () => {
  let component: PartyForm;
  let fixture: ComponentFixture<PartyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartyForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PartyForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
