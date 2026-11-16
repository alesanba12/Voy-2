

import { Component, HostListener, inject } from '@angular/core';
import { ConfirmModalService } from './modal-dialog-service';

@Component({
  imports: [],
  selector: 'app-modal-dialog',
  styleUrl: './modal-dialog.css',
  templateUrl: './modal-dialog.html',
})
export class ModalDialog {
 protected readonly modalService = inject(ConfirmModalService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalService.activeModal()) {
      this.modalService.close(false);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.modalService.close(false);
    }
  }
}