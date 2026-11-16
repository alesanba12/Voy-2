import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagsTable } from './tags-table';

describe('TagsTable', () => {
  let component: TagsTable;
  let fixture: ComponentFixture<TagsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(TagsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
