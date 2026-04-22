'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';

/** Tipo para View Transitions API (Chrome 111+, Edge 111+, Safari 18+) */
interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
}

type Theme = 'dark' | 'light';

/** Clave versionada para localStorage (client-localstorage-schema) */
const STORAGE_KEY = 'sicabit-theme:v1';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * ThemeProvider - Maneja el tema light/dark de la tienda.
 *
 * - Persiste en localStorage con clave versionada
 * - Aplica `data-theme` en <html> para activar CSS variables
 * - Inline script en layout.tsx previene FOUC (rendering-hydration-no-flicker)
 * - Default: dark (tema original Monster/Gaming)
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  // Ref para acceder al tema actual en callbacks estables (rerender-functional-setstate)
  const themeRef = useRef<Theme>('dark');

  // Leer el tema del DOM al montar (ya fue aplicado por inline script)
  useEffect(() => {
    const stored = document.documentElement.getAttribute('data-theme') as Theme;
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored);
      themeRef.current = stored;
    }
    setMounted(true);
  }, []);

  // Mantener ref sincronizado con el state
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    themeRef.current = newTheme;

    // js-batch-dom-css: agrupar writes en un solo acceso al DOM
    const root = document.documentElement;
    root.setAttribute('data-theme', newTheme);
    root.style.colorScheme = newTheme;

    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // localStorage no disponible (incognito, iframe sandbox, etc.)
    }
  }, []);

  /**
   * Efecto "gota de agua" — usa View Transitions API nativa del navegador
   * para una transición suave con reveal circular desde el botón.
   * Fallback: cambio instantáneo si el navegador no soporta View Transitions.
   *
   * Usa themeRef en vez de theme para evitar recrear el callback
   * en cada cambio de tema (rerender-functional-setstate).
   */
  const toggleTheme = useCallback((e?: React.MouseEvent) => {
    const current = themeRef.current;
    const newTheme = current === 'dark' ? 'light' : 'dark';

    // Posición del clic (centro del botón)
    let x = window.innerWidth / 2;
    let y = 40;
    if (e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    // js-batch-dom-css: agrupar todas las escrituras CSS en una sola operación
    const root = document.documentElement;
    root.style.setProperty('--vt-x', `${x}px`);
    root.style.setProperty('--vt-y', `${y}px`);

    // Crear ondas concéntricas (ripple rings)
    const ringColor = newTheme === 'light'
      ? 'rgba(22, 163, 74, 0.4)'
      : 'rgba(57, 255, 20, 0.35)';
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.className = 'ripple-ring';
      ring.style.cssText = `--ring-color:${ringColor};left:${x}px;top:${y}px;animation-delay:${i * 0.15}s`;
      document.body.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove(), { once: true });
    }

    // Si el navegador soporta View Transitions → animación nativa
    const doc = document as unknown as { startViewTransition?: (cb: () => void) => ViewTransition };
    if (doc.startViewTransition) {
      const transition = doc.startViewTransition(() => {
        setTheme(newTheme);
      });

      transition.finished.then(() => {
        root.style.removeProperty('--vt-x');
        root.style.removeProperty('--vt-y');
      });
    } else {
      // Fallback: cambio instantáneo
      setTheme(newTheme);
    }
  }, [setTheme]); // ✅ Sin 'theme' en deps gracias a themeRef

  // Evitar flash: no renderizar con tema incorrecto
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Durante SSR/prerender de páginas estáticas, retornar valores default
    // para evitar el error en /_not-found y otras páginas estáticas
    return {
      theme: 'dark' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
      isDark: true,
    };
  }
  return context;
}
