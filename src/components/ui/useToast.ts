import { createContext, useContext } from 'react';

export type ToastKind = 'success' | 'error';
export type ToastFn = (message: string, kind?: ToastKind) => void;

export const ToastContext = createContext<ToastFn | null>(null);

/** Show a short notification, e.g. toast('Expense added'). Falls back to a no-op outside the provider. */
export function useToast(): ToastFn {
  return useContext(ToastContext) ?? (() => {});
}
