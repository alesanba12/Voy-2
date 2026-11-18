import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Toast } from './toast';
import { ToastService } from './toast-service';

describe('Toast', () => {
  let component: Toast;
  let fixture: ComponentFixture<Toast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toast],
    }).compileComponents();

    fixture = TestBed.createComponent(Toast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the latest message and clears it when dismissed', () => {
    const toastService = TestBed.inject(ToastService);

    toastService.show('First message', 'info', 0);
    toastService.show('Second message', 'error', 0);

    expect(toastService.activeToast()).toEqual({
      message: 'Second message',
      variant: 'error',
    });

    toastService.dismiss();
    expect(toastService.activeToast()).toBeNull();
  });
});
