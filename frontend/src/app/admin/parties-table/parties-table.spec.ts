import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartiesTable } from './parties-table';

describe('PartiesTable', () => {
  let component: PartiesTable;
  let fixture: ComponentFixture<PartiesTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartiesTable],
    }).compileComponents();

    fixture = TestBed.createComponent(PartiesTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
