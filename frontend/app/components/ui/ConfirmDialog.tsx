'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Warning, SignOut } from '@phosphor-icons/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  const iconColors = {
    danger: 'text-danger bg-danger/10',
    warning: 'text-warning-alt bg-warning-alt/10',
    info: 'text-accent bg-accent/10',
  };

  const buttonColors = {
    danger: 'bg-danger hover:bg-danger-hover text-white',
    warning: 'bg-warning-alt hover:bg-warning-alt-dark text-accent-contrast',
    info: 'bg-accent hover:bg-accent-hover text-accent-contrast',
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            ref={dialogRef}
            tabIndex={-1}
            className="relative z-10 w-full max-w-md mx-4 bg-surface-raised border border-line-med shadow-2xl"
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between p-4 border-b border-line-med">
              <h2 className="text-lg font-semibold text-content">{title}</h2>
              <button
                onClick={onClose}
                className="rounded p-1.5 text-content-secondary transition-colors hover:bg-line-med hover:text-content"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`rounded-full p-3 ${iconColors[type]}`}>
                  {type === 'danger' ? <SignOut size={24} /> : <Warning size={24} />}
                </div>
                <div className="flex-1">
                  <p className="leading-relaxed text-content-bright">{message}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-line-med bg-surface p-4">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="border border-line-hard px-4 py-2.5 text-sm font-medium text-content-bright transition-colors hover:bg-line-med hover:text-content disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${buttonColors[type]}`}
              >
                {isLoading ? (
                  <>
                    <div className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <span>Cerrando...</span>
                  </>
                ) : (
                  <>
                    <SignOut size={16} />
                    <span>{confirmText}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
