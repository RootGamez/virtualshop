import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
  variant: 'success' | 'error';
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, variant: Toast['variant']) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

/** Feedback visual global para acciones del CMS (spec §12). */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant) => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toastSuccess = (message: string) => useToastStore.getState().push(message, 'success');
export const toastError = (message: string) => useToastStore.getState().push(message, 'error');
