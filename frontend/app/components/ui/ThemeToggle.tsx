'use client';

import { Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from '../../lib/theme-context';

/**
 * ThemeToggle - Botón para alternar entre modo claro y oscuro.
 * Al hacer clic dispara el efecto ripple + View Transition desde el botón.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className="relative p-2.5 text-content-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Sun
        weight={isDark ? 'regular' : 'fill'}
        className={`size-5 absolute inset-0 m-auto transition-all duration-300 ${
          isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
        }`}
        aria-hidden="true"
      />
      <Moon
        weight={isDark ? 'fill' : 'regular'}
        className={`size-5 transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
