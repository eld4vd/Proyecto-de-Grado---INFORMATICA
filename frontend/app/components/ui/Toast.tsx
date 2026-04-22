'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, WarningCircle, Info, Warning } from '@phosphor-icons/react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const icons = {
  success: CheckCircle,
  error: WarningCircle,
  info: Info,
  warning: Warning,
};

const styles = {
  success: {
    bg: 'bg-accent',
    border: 'border-accent-hover',
    text: 'text-accent-contrast',
    icon: 'text-accent-contrast',
  },
  error: {
    bg: 'bg-danger',
    border: 'border-danger-dark',
    text: 'text-content',
    icon: 'text-content',
  },
  info: {
    bg: 'bg-info',
    border: 'border-info-dark',
    text: 'text-content',
    icon: 'text-content',
  },
  warning: {
    bg: 'bg-admin-warning',
    border: 'border-admin-warning-dark',
    text: 'text-black',
    icon: 'text-black',
  },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const Icon = icons[toast.type];
  const style = styles[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`
        flex items-start gap-3 p-4 rounded-xl shadow-2xl border
        ${style.bg} ${style.border} ${style.text}
        min-w-80 max-w-105
      `}
      role="alert"
    >
      <Icon className={`size-5 shrink-0 mt-0.5 ${style.icon}`} />
      
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.message && (
          <p className="text-sm opacity-90 mt-0.5">{toast.message}</p>
        )}
      </div>

      <button
        onClick={onClose}
        className="shrink-0 hover:opacity-70 transition-opacity p-1 -m-1"
        aria-label="Cerrar"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-hide after duration (default 4 seconds)
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-9999 flex flex-col gap-3">
        <AnimatePresence mode="sync">
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => hideToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// Hook helper para mostrar toasts comunes
export function useToastActions() {
  const { showToast } = useToast();

  return {
    success: (title: string, message?: string) => 
      showToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => 
      showToast({ type: 'error', title, message }),
    info: (title: string, message?: string) => 
      showToast({ type: 'info', title, message }),
    warning: (title: string, message?: string) => 
      showToast({ type: 'warning', title, message }),
  };
}
