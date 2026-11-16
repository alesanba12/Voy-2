import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KpiMetrics } from './kpi-metrics';

describe('KpiMetrics', () => {
  let component: KpiMetrics;
  let fixture: ComponentFixture<KpiMetrics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiMetrics],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiMetrics);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
