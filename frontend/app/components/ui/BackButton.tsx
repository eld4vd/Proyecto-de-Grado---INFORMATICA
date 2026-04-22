'use client';

import { ArrowLeft } from '@phosphor-icons/react';

interface BackButtonProps {
  className?: string;
}

/**
 * Componente cliente mínimo para el botón "volver atrás"
 * Separa la lógica de navegación del resto del componente
 * para mantener páginas como Server Components
 */
export function BackButton({ className }: BackButtonProps) {
  const defaultClass = "mt-8 text-sm text-content-muted hover:text-accent transition-colors inline-flex items-center gap-2";
  
  return (
    <button
      onClick={() => window.history.back()}
      className={className || defaultClass}
    >
      <ArrowLeft size={16} />
      Volver
    </button>
  );
}
