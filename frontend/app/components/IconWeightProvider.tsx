'use client';

import { IconContext } from '@phosphor-icons/react';
import { useTheme } from '../lib/theme-context';
import type { ReactNode } from 'react';

/**
 * Provee un peso de icono Phosphor que se adapta al tema actual:
 * - Dark mode → "regular" (líneas estándar, buen contraste en fondos oscuros)
 * - Light mode → "light" (líneas finas, elegante en fondos claros)
 *
 * El panel admin lo sobreescribe con "duotone" via su propio IconContext.Provider.
 */
export function IconWeightProvider({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();

  return (
    <IconContext.Provider value={{ weight: isDark ? 'regular' : 'light' }}>
      {children}
    </IconContext.Provider>
  );
}
