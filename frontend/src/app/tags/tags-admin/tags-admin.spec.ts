import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagsAdmin } from './tags-admin';

describe('TagsAdmin', () => {
  let component: TagsAdmin;
  let fixture: ComponentFixture<TagsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(TagsAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
