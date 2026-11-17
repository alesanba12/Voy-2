import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  message: string;
  variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly activeToast = signal<ToastMessage | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  show(message: string, variant: ToastVariant = 'info', durationMs = 4500): void {
    this.clearTimeout();
    this.activeToast.set({ message, variant });

    if (durationMs > 0) {
      this.timeoutId = setTimeout(() => this.dismiss(), durationMs);
    }
  }

  dismiss(): void {
    this.clearTimeout();
    this.activeToast.set(null);
  }

  private clearTimeout(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
