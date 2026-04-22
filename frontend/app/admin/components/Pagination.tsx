'use client';

import { CaretLeft, CaretRight, CaretDoubleLeft, CaretDoubleRight } from '@phosphor-icons/react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [10, 20, 50, 100],
  className = '',
}: PaginationProps) {
  // Calcular rango de items mostrados
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generar números de página a mostrar
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('…');
      }
      
      // Páginas alrededor de la actual
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('…');
      }
      
      // Siempre mostrar última página
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1 && !showItemsPerPage) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Info de registros */}
      <div className="text-sm text-gray-500 tabular-nums">
        Mostrando <span className="font-medium text-gray-400">{startItem}</span> a{' '}
        <span className="font-medium text-gray-400">{endItem}</span> de{' '}
        <span className="font-medium text-gray-400">{totalItems}</span> registros
      </div>

      <div className="flex items-center gap-4">
        {/* Selector de items por página */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-500">Por página:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-[#0f1419] border border-[#334155] text-gray-400 text-sm px-2 py-1.5 focus:outline-none focus:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors"
              aria-label="Items por página"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 touch-manipulation">
            {/* Primera página */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-white hover:bg-[#1e293b] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
              title="Primera página"
              aria-label="Ir a la primera página"
            >
              <CaretDoubleLeft size={16} aria-hidden="true" />
            </button>

            {/* Página anterior */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 hover:text-white hover:bg-[#1e293b] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
              title="Página anterior"
              aria-label="Ir a la página anterior"
            >
              <CaretLeft size={16} aria-hidden="true" />
            </button>

            {/* Números de página */}
            <div className="flex items-center gap-1 mx-1">
              {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                  <button
                    key={index}
                    onClick={() => onPageChange(page)}
                    aria-label={`Ir a la página ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`min-size-9 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419] ${
                      currentPage === page
                        ? 'bg-admin-primary text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="px-2 text-gray-600" aria-hidden="true">
                    …
                  </span>
                )
              ))}
            </div>

            {/* Página siguiente */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-white hover:bg-[#1e293b] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
              title="Página siguiente"
              aria-label="Ir a la página siguiente"
            >
              <CaretRight size={16} aria-hidden="true" />
            </button>

            {/* Última página */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 hover:text-white hover:bg-[#1e293b] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
              title="Última página"
              aria-label="Ir a la última página"
            >
              <CaretDoubleRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
