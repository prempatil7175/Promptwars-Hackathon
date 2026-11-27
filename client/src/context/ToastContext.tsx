import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastMessage, ToastVariant } from '../types';

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  addToast: (toast: ToastInput) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VARIANT_STYLES: Record<
  ToastVariant,
  { border: string; iconColor: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  info: {
    border: 'border-[#D8DCE8] bg-white/95 dark:border-[#2E314A] dark:bg-[#1B1D2E]/95',
    iconColor: 'text-[#5A45F5] dark:text-[#8B93C9]',
    Icon: Info,
  },
  success: {
    border: 'border-emerald-200 bg-white/95 dark:border-emerald-500/40 dark:bg-[#1B1D2E]/95',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  warning: {
    border: 'border-amber-200 bg-white/95 dark:border-amber-500/40 dark:bg-[#1B1D2E]/95',
    iconColor: 'text-amber-700 dark:text-amber-300',
    Icon: AlertTriangle,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, variant = 'info' }: ToastInput) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, description, variant }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 4200);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, dismissToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 left-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-full sm:max-w-sm"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const { border, iconColor, Icon } = VARIANT_STYLES[toast.variant];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_8px_24px_-10px_rgba(18,20,31,0.2)] backdrop-blur-md dark:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)] ${border}`}
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#131420] dark:text-white">{toast.title}</p>
                  {toast.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-[#5E6478] dark:text-[#B0B5C9]">
                      {toast.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-md p-0.5 text-[#5E6478] transition hover:bg-[#EEF0F7] hover:text-[#131420] dark:text-[#B0B5C9] dark:hover:bg-[#23263B] dark:hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
