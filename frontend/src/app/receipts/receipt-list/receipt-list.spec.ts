import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceiptList } from './receipt-list';

describe('ReceiptList', () => {
  let component: ReceiptList;
  let fixture: ComponentFixture<ReceiptList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptList],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
