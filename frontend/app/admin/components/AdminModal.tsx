'use client';

import { ReactNode, useEffect } from 'react';
import { X, Warning, CircleNotch } from '@phosphor-icons/react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: AdminModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-4 overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Cerrar modal"
      />
      
      {/* Modal */}
      <div className={`relative w-full ${sizeClasses[size]} bg-[#0f1419] border border-[#1e293b] shadow-xl overscroll-contain`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <h2 id="modal-title" className="text-lg font-semibold text-white text-balance">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
            aria-label="Cerrar modal"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Modal de confirmación para eliminar
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
  itemName?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = '¿Eliminar registro?',
  message,
  itemName,
}: DeleteConfirmModalProps) {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div className="size-12 mx-auto mb-4 bg-admin-danger/10 flex items-center justify-center">
          <Warning size={24} className="text-admin-danger" aria-hidden="true" />
        </div>
        
        <p className="text-gray-400 mb-2">
          {message || 'Esta acción no se puede deshacer.'}
        </p>
        
        {itemName && (
          <p className="text-white font-medium mb-6">
            "{itemName}"
          </p>
        )}
        
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-[#334155] text-gray-400 font-medium text-sm hover:text-white hover:border-admin-primary transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-admin-danger text-white font-medium text-sm hover:bg-[#dc2626] transition-colors disabled:opacity-50 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
          >
            {loading ? (
              <>
                <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
                Eliminando…
              </>
            ) : (
              'Eliminar'
            )}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
