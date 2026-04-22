'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ArrowLeft, CaretRight } from '@phosphor-icons/react';
import { ThemeToggle } from './ThemeToggle';

/* Map de rutas a nombres legibles */
const subpageNames: Record<string, string> = {
  '/soporte/centro-ayuda': 'Centro de ayuda',
  '/soporte/soporte-tecnico': 'Soporte técnico',
  '/soporte/consulta-garantia': 'Garantía',
  '/soporte/seguimiento-pedido': 'Seguimiento',
  '/soporte/guias-compra': 'Guías de compra',
  '/soporte/preguntas-frecuentes': 'FAQ',
  '/soporte/contacto-directo': 'Contacto',
  '/soporte/registro-cuenta': 'Registro de cuenta',
};

export function SoporteHeader() {
  const pathname = usePathname();
  const subpageName = subpageNames[pathname];

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-surface border-b border-line">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" className="flex items-center gap-1 shrink-0">
                <div className="relative size-12">
                  <Image src="/logo-sicabit.webp" alt="SicaBit" fill sizes="48px" className="object-contain" />
                </div>
                <span className="hidden sm:block font-black text-content tracking-tight text-xl">
                  SICA<span className="text-accent">BIT</span>
                </span>
              </Link>

              <div className="h-6 w-px bg-line-med mx-1 shrink-0" />

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 min-w-0 text-sm">
                <Link
                  href="/soporte"
                  className={`font-medium transition-colors shrink-0 ${
                    subpageName
                      ? 'text-content-secondary hover:text-content'
                      : 'text-accent'
                  }`}
                >
                  Soporte
                </Link>

                {subpageName && (
                  <>
                    <CaretRight size={12} className="text-content-muted shrink-0" />
                    <span className="text-accent font-medium truncate">
                      {subpageName}
                    </span>
                  </>
                )}
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />

              <Link
                href="/"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent border border-accent/30 hover:bg-accent/10 transition-colors"
              >
                <ArrowLeft size={14} />
                Volver a la tienda
              </Link>

              <Link
                href="/"
                className="sm:hidden flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent"
              >
                <ArrowLeft size={14} />
                Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
