'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MagnifyingGlass, ArrowsClockwise, TreeStructure } from '@phosphor-icons/react';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminTable, Column } from '../components/AdminTable';
import { StatusBadge } from '../components/StatusBadge';
import { DeleteConfirmModal } from '../components/AdminModal';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean;
  categoriaPadreId: string | null;
  categoriaPadre?: { nombre: string } | null;
  createdAt: string;
  _count?: { subcategorias: number; productoCategorias: number };
}

export interface CategoriasClientProps {
  initialData: Categoria[];
}

export default function CategoriasClient({ initialData }: CategoriasClientProps) {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; categoria: Categoria | null }>({
    open: false,
    categoria: null,
  });
  const [isDeleting, startDeleteTransition] = useTransition();

  // Cargar categorías
  const fetchCategorias = useCallback(async () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/categorias', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCategorias(data);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    });
  }, []);

  // Eliminar categoría
  const handleDelete = useCallback(async () => {
    if (!deleteModal.categoria) return;
    
    startDeleteTransition(async () => {
      try {
        const res = await fetch(`/api/categorias/${deleteModal.categoria!.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (res.ok) {
          setCategorias(prev => prev.filter(c => c.id !== deleteModal.categoria?.id));
          setDeleteModal({ open: false, categoria: null });
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    });
  }, [deleteModal.categoria]);

  const handleOpenDeleteModal = useCallback((cat: Categoria) => {
    setDeleteModal({ open: true, categoria: cat });
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModal({ open: false, categoria: null });
  }, []);

  // Filtrar categorías (Vercel Best Practice: rerender-memo)
  const filteredCategorias = useMemo(() => {
    const searchLower = search.toLowerCase();
    if (!searchLower) return categorias;
    return categorias.filter(c =>
      c.nombre.toLowerCase().includes(searchLower) ||
      c.slug.toLowerCase().includes(searchLower)
    );
  }, [categorias, search]);

  // Columnas de la tabla
  const columns: Column<Categoria>[] = [
    {
      key: 'nombre',
      label: 'Categoría',
      render: (cat) => (
        <div className="flex items-center gap-3">
          {cat.imagenUrl ? (
            <Image 
              src={cat.imagenUrl} 
              alt={cat.nombre}
              width={32}
              height={32}
              className="object-cover"
            />
          ) : (
            <div className="size-8 bg-[#1e293b] flex items-center justify-center">
              <TreeStructure size={16} className="text-gray-500" aria-hidden="true" />
            </div>
          )}
          <div>
            <span className="font-medium text-white">{cat.nombre}</span>
            {cat.categoriaPadre && (
              <p className="text-xs text-gray-500">
                en {cat.categoriaPadre.nombre}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (cat) => (
        <code className="text-xs bg-[#1e293b] px-2 py-1 text-gray-400">
          {cat.slug}
        </code>
      ),
    },
    {
      key: 'productos',
      label: 'Productos',
      render: (cat) => (
        <span className="text-gray-400 tabular-nums">
          {cat._count?.productoCategorias || 0}
        </span>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (cat) => (
        <StatusBadge status={cat.activo ? 'active' : 'inactive'} />
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader
        title="Categorías"
        description="Gestiona las categorías de productos"
        createHref="/admin/categorias/nuevo"
        createLabel="Nueva categoría"
      />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <label htmlFor="search-categorias" className="sr-only">Buscar categorías</label>
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            id="search-categorias"
            type="search"
            placeholder="Buscar categorías…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f1419] border border-[#334155] text-white placeholder-gray-600 focus:outline-none focus:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={fetchCategorias}
          aria-label="Actualizar lista de categorías"
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#334155] text-gray-400 hover:text-white hover:border-admin-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
        >
          <ArrowsClockwise className={`size-4 ${isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {/* Tabla */}
      <AdminTable
        columns={columns}
        data={filteredCategorias}
        loading={isPending}
        emptyMessage="No hay categorías registradas"
        getRowKey={(cat) => cat.id}
        editHref={(cat) => `/admin/categorias/${cat.id}`}
        onDelete={handleOpenDeleteModal}
      />

      {/* Modal de confirmación */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        loading={isDeleting}
        itemName={deleteModal.categoria?.nombre}
      />
    </div>
  );
}
