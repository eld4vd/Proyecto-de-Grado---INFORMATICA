'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { SquaresFour, ArrowsClockwise, WarningOctagon } from '@phosphor-icons/react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Icono de error */}
        <div className="mb-6 flex justify-center">
          <div className="size-20 bg-admin-danger/10 flex items-center justify-center">
            <WarningOctagon size={40} className="text-admin-danger" />
          </div>
        </div>

        {/* Mensaje */}
        <h1 className="text-xl font-bold text-white mb-2">
          Algo salió mal
        </h1>
        <p className="text-gray-400 mb-4">
          Ha ocurrido un error inesperado. Por favor, intenta nuevamente.
        </p>
        
        {error.digest && (
          <p className="text-xs text-gray-600 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-admin-primary text-white font-semibold hover:bg-admin-primary-dark transition-colors"
          >
            <ArrowsClockwise size={16} />
            Intentar de nuevo
          </button>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#334155] text-white font-medium hover:border-admin-primary transition-colors"
          >
            <SquaresFour size={16} />
            Ir al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
