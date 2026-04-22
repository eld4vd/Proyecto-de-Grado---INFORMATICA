'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowsClockwise, ShoppingCart, Warning } from '@phosphor-icons/react';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Checkout error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-surface-deep">
      <div className="text-center max-w-lg mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="size-20 bg-danger/10 flex items-center justify-center">
            <Warning size={40} className="text-danger" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-content mb-3">
          Error en el checkout
        </h1>
        <p className="text-content-secondary mb-6">
          Ha ocurrido un error procesando tu compra. Tu carrito no ha sido afectado.
        </p>

        {error.digest && (
          <p className="text-xs text-content-muted mb-6 font-mono bg-surface px-4 py-2 inline-block border border-line">
            Código: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:bg-accent-hover transition-colors"
          >
            <ArrowsClockwise size={16} />
            Intentar de nuevo
          </button>
          <Link
            href="/carrito"
            className="inline-flex items-center gap-2 px-6 py-3 border border-line-med text-content font-medium hover:border-accent transition-colors"
          >
            <ShoppingCart size={16} />
            Volver al carrito
          </Link>
        </div>
      </div>
    </div>
  );
}
