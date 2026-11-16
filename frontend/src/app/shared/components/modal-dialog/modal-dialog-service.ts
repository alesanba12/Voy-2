import { Injectable, signal } from '@angular/core';

export type ModalIntent =
  | 'unsaved-changes'     // Gris neutro: descartar edición o salir sin guardar
  | 'session-logout'      // Violeta: cerrar sesión o acciones de cuenta
  | 'cancel-attendance'   // Ámbar: cancelar asistencia o liberar lugar
  | 'destructive-delete'  // Rojo: eliminar evento o acción irreversible
  | 'publish-event';

export type ModalIcon =
  | 'unsaved-draft'
  | 'logout'
  | 'user-remove'
  | 'delete-forever'
  | 'publish-event';

export interface ConfirmModalConfig {
  variant: ModalIntent;
  icon: ModalIcon;
  eyebrow?: string;
  badgeText?: string;       
  referenceCode?: string;   
  title: string;
  description: string;      
  contextBox?: {
    type: 'warning' | 'event' | 'device';
    title: string;
    subtitle?: string;
    rightTag?: string;
    imageUrl?: string;
  };
  cancelLabel: string;
  confirmLabel: string;
  confirmStyle?: 'solid' | 'ghost-accent'; 
}

@Injectable({ providedIn: 'root' })
export class ConfirmModalService {
  private resolver: ((result: boolean) => void) | null = null;

  activeModal = signal<ConfirmModalConfig | null>(null);

  open(config: ConfirmModalConfig): Promise<boolean> {
    this.activeModal.set(config);
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  close(result: boolean): void {
    this.activeModal.set(null);
    if (this.resolver) {
      this.resolver(result);
      this.resolver = null;
    }
  }
}