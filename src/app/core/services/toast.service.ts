import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

const INITIAL_TOAST_STATE: ToastState = {
  message: '',
  type: 'info',
  visible: false
};

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private readonly toastStateSignal = signal<ToastState>(INITIAL_TOAST_STATE);
  readonly toastState = this.toastStateSignal.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 3000): void {
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }

    this.toastStateSignal.set({
      message,
      type,
      visible: true
    });

    this.hideTimeoutId = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide(): void {
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }

    this.toastStateSignal.update((state) => ({
      ...state,
      visible: false
    }));
  }
}