import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalDialog } from './modal-dialog';

describe('ModalDialog', () => {
  let component: ModalDialog;
  let fixture: ComponentFixture<ModalDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
