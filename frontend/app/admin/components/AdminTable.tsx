'use client';

import { ReactNode } from 'react';
import { PencilSimple, Trash, Eye, DotsThreeVertical, CircleNotch } from '@phosphor-icons/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export interface Column<T> {
  key: string;
  label: ReactNode;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  // Acciones
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  editHref?: (item: T) => string;
  viewHref?: (item: T) => string;
  // Key extractor
  getRowKey: (item: T) => string;
}

export function AdminTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  onEdit,
  onDelete,
  onView,
  editHref,
  viewHref,
  getRowKey,
}: AdminTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const hasActions = onEdit || onDelete || onView || editHref || viewHref;

  const persistCurrentScroll = () => {
    const main = document.getElementById('admin-main-content');
    if (!main) return;
    sessionStorage.setItem(`admin-scroll:${pathname}`, String(main.scrollTop));
    sessionStorage.setItem(`admin-height:${pathname}`, String(main.scrollHeight));
    // Bloquear para que el cleanup del effect en AdminShell no sobreescriba este valor
    sessionStorage.setItem(`admin-scroll-lock:${pathname}`, '1');
  };

  if (loading && data.length === 0) {
    return (
      <div className="bg-[#0f1419] border border-[#1e293b] p-8">
        <div className="flex items-center justify-center gap-3">
          <CircleNotch size={20} className="text-admin-primary animate-spin" aria-hidden="true" />
          <span className="text-gray-400">Cargando…</span>
        </div>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="bg-[#0f1419] border border-[#1e293b] p-8">
        <p className="text-center text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="relative bg-[#0f1419] border border-[#1e293b] overflow-hidden">
      {/* Overlay de carga: preserva la tabla y posición de scroll */}
      {loading && (
        <div className="absolute inset-0 bg-[#0f1419]/60 z-10 flex items-center justify-center">
          <div className="flex items-center gap-3 bg-[#0f1419] px-4 py-2 border border-[#1e293b]">
            <CircleNotch size={20} className="text-admin-primary animate-spin" aria-hidden="true" />
            <span className="text-gray-400">Actualizando…</span>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e293b]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {data.map((item) => (
              <tr
                key={getRowKey(item)}
                onClick={viewHref ? () => {
                  persistCurrentScroll();
                  router.push(viewHref(item), { scroll: false });
                } : undefined}
                className={`hover:bg-surface-card transition-colors ${
                  viewHref ? 'cursor-pointer group' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-4 text-sm text-gray-300 ${col.className || ''}`}
                  >
                    {col.render 
                      ? col.render(item) 
                      : String((item as Record<string, unknown>)[col.key] ?? '-')
                    }
                  </td>
                ))}
                {hasActions && (
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {(viewHref || onView) && (
                        viewHref ? (
                          <Link
                            href={viewHref(item)}
                            scroll={false}
                            onClick={persistCurrentScroll}
                            className="p-1.5 text-gray-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
                            title="Ver"
                            aria-label="Ver detalles"
                          >
                            <Eye size={16} aria-hidden="true" />
                          </Link>
                        ) : (
                          <button
                            onClick={() => onView?.(item)}
                            className="p-1.5 text-gray-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
                            title="Ver"
                            aria-label="Ver detalles"
                          >
                            <Eye size={16} aria-hidden="true" />
                          </button>
                        )
                      )}
                      {(editHref || onEdit) && (
                        editHref ? (
                          <Link
                            href={editHref(item)}
                            scroll={false}
                            onClick={(e) => {
                              e.stopPropagation();
                              persistCurrentScroll();
                            }}
                            className="p-1.5 text-gray-500 hover:text-admin-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
                            title="Editar"
                            aria-label="Editar registro"
                          >
                            <PencilSimple size={16} aria-hidden="true" />
                          </Link>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}
                            className="p-1.5 text-gray-500 hover:text-admin-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
                            title="Editar"
                            aria-label="Editar registro"
                          >
                            <PencilSimple size={16} aria-hidden="true" />
                          </button>
                        )
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                          className="p-1.5 text-gray-500 hover:text-admin-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
                          title="Eliminar"
                          aria-label="Eliminar registro"
                        >
                          <Trash size={16} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
