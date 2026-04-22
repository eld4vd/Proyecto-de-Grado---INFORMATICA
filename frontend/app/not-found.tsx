import Link from 'next/link';
import { House, MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { BackButton } from './components/ui/BackButton';

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-surface-deep">
      <div className="text-center max-w-lg mx-auto">
        {/* 404 Number */}
        <div className="relative mb-8">
          <span className="text-[120px] md:text-[180px] font-black text-surface-card leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[60px] md:text-[80px] font-black text-accent opacity-20">
              404
            </span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-content mb-3">
          Página no encontrada
        </h1>
        <p className="text-content-secondary mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:bg-accent-hover transition-colors"
          >
            <House size={16} weight="duotone" />
            Ir al inicio
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 px-6 py-3 border border-line-med text-content font-medium hover:border-accent transition-colors"
          >
            <MagnifyingGlass size={16} weight="bold" />
            Ver productos
          </Link>
        </div>

        {/* Back link - Client Component mínimo */}
        <BackButton />
      </div>
    </div>
  );
}
