'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
// bundle-barrel-imports: Importar directamente en vez de barrel file
import Header from './ui/Header';
import Footer from './ui/Footer';
import { SoporteHeader } from './ui/SoporteHeader';
import { ScrollToTop } from './ui/ScrollToTop';

interface LayoutWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper que detecta la ruta actual y decide si mostrar header/footer
 * Usa usePathname() del cliente para detectar correctamente la navegación SPA
 */
export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // No mostrar header/footer en admin, login y checkout (checkout tiene su propio flujo)
  const hideHeaderFooter =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/checkout');

  // Soporte usa su propio header simplificado
  const isSoporte = pathname.startsWith('/soporte');

  return (
    <>
      {!hideHeaderFooter && (isSoporte ? <SoporteHeader /> : <Header />)}
      <main className="flex-1">
        {children}
      </main>
      {!hideHeaderFooter && <Footer />}
      {!hideHeaderFooter && <ScrollToTop />}
    </>
  );
}
