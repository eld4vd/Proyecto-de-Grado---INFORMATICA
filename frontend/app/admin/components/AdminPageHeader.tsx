import { ReactNode } from 'react';
import Link from 'next/link';
import type { Icon } from '@phosphor-icons/react';
import { CaretLeft, Plus } from '@phosphor-icons/react/dist/ssr';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  actions?: ReactNode;
  // Atajo para botón de crear
  createHref?: string;
  createLabel?: string;
  icon?: Icon;
}

export function AdminPageHeader({
  title,
  description,
  backHref,
  actions,
  createHref,
  createLabel = 'Crear nuevo',
  icon: Icon,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative">
      <div>
        {backHref && (
          <Link 
            href={backHref}
            scroll={false}
            className="group inline-flex items-center gap-1 text-sm text-gray-500 hover:text-admin-primary mb-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
          >
            <CaretLeft size={16} weight="bold" className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
            Volver
          </Link>
        )}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="size-10 bg-admin-primary/10 border border-admin-primary/30 flex items-center justify-center">
              <Icon size={20} weight="duotone" className="text-admin-primary" aria-hidden="true" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white text-balance">{title}</h1>
            {description && (
              <p className="text-sm text-gray-500 mt-0.5 text-pretty">{description}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {actions}
        {createHref && (
          <Link
            href={createHref}
            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-admin-primary text-white font-medium text-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-shadow relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
          >
            <Plus size={16} weight="bold" className="relative z-10" aria-hidden="true" />
            <span className="relative z-10">{createLabel}</span>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
