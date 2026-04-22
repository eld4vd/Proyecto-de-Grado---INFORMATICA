import Link from 'next/link';
import { SquaresFour, Warning } from '@phosphor-icons/react/dist/ssr';
import { BackButton } from '../components/ui/BackButton';

export default function AdminNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Icono de error */}
        <div className="mb-6 flex justify-center">
          <div className="size-20 bg-admin-danger/10 flex items-center justify-center">
            <Warning size={40} weight="duotone" className="text-admin-danger" />
          </div>
        </div>

        {/* Código de error */}
        <div className="text-6xl font-black text-admin-primary mb-4">404</div>

        {/* Mensaje */}
        <h1 className="text-xl font-bold text-white mb-2">
          Página no encontrada
        </h1>
        <p className="text-gray-400 mb-8">
          La página que buscas no existe o no tienes permisos para acceder.
        </p>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-admin-primary text-white font-semibold hover:bg-admin-primary-dark transition-colors"
          >
            <SquaresFour size={16} weight="duotone" />
            Ir al Dashboard
          </Link>
          <BackButton className="px-6 py-3 border border-[#334155] text-white font-medium hover:border-admin-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}
