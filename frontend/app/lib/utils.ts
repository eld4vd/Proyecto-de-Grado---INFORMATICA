import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility para componer clases de Tailwind de forma segura.
 * Combina clsx (condicionales) + twMerge (evita conflictos de clases Tailwind).
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-accent', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clase reutilizable para el anillo de foco (accesibilidad). */
export const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2';

/** Clase reutilizable para elementos deshabilitados. */
export const disabledStyles = 'disabled:pointer-events-none disabled:opacity-50';
