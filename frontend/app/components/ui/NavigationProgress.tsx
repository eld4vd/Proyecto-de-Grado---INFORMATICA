'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef<boolean>(false);
  const pathnameRef = useRef<string>(pathname);

  function start() {
    if (trickleRef.current) clearInterval(trickleRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    setVisible(true);
    setWidth(15);

    trickleRef.current = setInterval(() => {
      setWidth((w) => {
        if (w >= 85) return w;
        return w + (85 - w) * 0.08;
      });
    }, 200);
  }

  function done() {
    if (trickleRef.current) clearInterval(trickleRef.current);
    setWidth(100);

    hideRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 500);
  }

  // Intercept link clicks to detect navigation start
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      // Si el click vino de un botón u elemento interactivo dentro del enlace,
      // no iniciar la barra (ej: botón "añadir al carrito" dentro de una tarjeta-link)
      const clickedInteractive = (e.target as HTMLElement).closest('button, [role="button"], input, select, textarea');
      if (clickedInteractive && anchor.contains(clickedInteractive)) return;

      const href = anchor.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        anchor.target === '_blank' ||
        anchor.download ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey
      )
        return;

      try {
        const url = new URL(href, window.location.origin);
        if (url.pathname !== pathnameRef.current) {
          start();
        }
      } catch {
        // invalid URL, ignore
      }
    }

    function handlePopState() {
      start();
    }

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', handlePopState);
      if (trickleRef.current) clearInterval(trickleRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, []);

  // Route change complete → finish the bar
  useEffect(() => {
    pathnameRef.current = pathname;

    // Skip initial render
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    done();
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-100 h-0.75 pointer-events-none">
      <div
        className="h-full bg-accent"
        style={{
          width: `${width}%`,
          transition:
            width === 100
              ? 'width 200ms ease-out, opacity 300ms ease-out 200ms'
              : 'width 300ms ease-out',
          opacity: width >= 100 ? 0 : 1,
          boxShadow: '0 0 10px var(--color-accent), 0 0 4px var(--color-accent)',
        }}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
