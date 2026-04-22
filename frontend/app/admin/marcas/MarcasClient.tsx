'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MagnifyingGlass, ArrowsClockwise } from '@phosphor-icons/react';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminTable, Column } from '../components/AdminTable';
import { StatusBadge } from '../components/StatusBadge';
import { DeleteConfirmModal } from '../components/AdminModal';

interface Marca {
  id: string;
  nombre: string;
  slug: string;
  logoUrl: string | null;
  activo: boolean;
  createdAt: string;
}

export interface MarcasClientProps {
  initialData: Marca[];
}

export default function MarcasClient({ initialData }: MarcasClientProps) {
  const router = useRouter();
  const [marcas, setMarcas] = useState<Marca[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; marca: Marca | null }>({
    open: false,
    marca: null,
  });
  const [isDeleting, startDeleteTransition] = useTransition();

  // Cargar marcas
  const fetchMarcas = useCallback(async () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/marcas', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setMarcas(data);
        }
      } catch (error) {
        console.error('Error al cargar marcas:', error);
      }
    });
  }, []);

  // Eliminar marca
  const handleDelete = useCallback(async () => {
    if (!deleteModal.marca) return;
    
    startDeleteTransition(async () => {
      try {
        const res = await fetch(`/api/marcas/${deleteModal.marca!.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (res.ok) {
          setMarcas(prev => prev.filter(m => m.id !== deleteModal.marca?.id));
          setDeleteModal({ open: false, marca: null });
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    });
  }, [deleteModal.marca]);

  const handleOpenDeleteModal = useCallback((marca: Marca) => {
    setDeleteModal({ open: true, marca });
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModal({ open: false, marca: null });
  }, []);

  // Filtrar marcas (Vercel Best Practice: rerender-memo)
  const filteredMarcas = useMemo(() => {
    const searchLower = search.toLowerCase();
    if (!searchLower) return marcas;
    return marcas.filter(m =>
      m.nombre.toLowerCase().includes(searchLower) ||
      m.slug.toLowerCase().includes(searchLower)
    );
  }, [marcas, search]);

  // Columnas de la tabla
  const columns: Column<Marca>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (marca) => (
        <div className="flex items-center gap-3">
          {marca.logoUrl ? (
            <Image 
              src={marca.logoUrl} 
              alt={marca.nombre}
              width={32}
              height={32}
              className="object-contain bg-white p-1"
            />
          ) : (
            <div className="size-8 bg-[#1e293b] flex items-center justify-center text-xs font-bold text-gray-500">
              {marca.nombre.charAt(0)}
            </div>
          )}
          <span className="font-medium text-white">{marca.nombre}</span>
        </div>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (marca) => (
        <code className="text-xs bg-[#1e293b] px-2 py-1 text-gray-400">
          {marca.slug}
        </code>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (marca) => (
        <StatusBadge status={marca.activo ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'createdAt',
      label: 'Creado',
      render: (marca) => (
        <span className="text-gray-500 text-xs tabular-nums">
          {new Date(marca.createdAt).toLocaleDateString('es-ES')}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader
        title="Marcas"
        description="Gestiona las marcas de productos"
        createHref="/admin/marcas/nuevo"
        createLabel="Nueva marca"
      />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <label htmlFor="search-marcas" className="sr-only">Buscar marcas</label>
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            id="search-marcas"
            type="search"
            placeholder="Buscar marcas…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f1419] border border-[#334155] text-white placeholder-gray-600 focus:outline-none focus:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={fetchMarcas}
          aria-label="Actualizar lista de marcas"
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#334155] text-gray-400 hover:text-white hover:border-admin-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
        >
          <ArrowsClockwise className={`size-4 ${isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {/* Tabla */}
      <AdminTable
        columns={columns}
        data={filteredMarcas}
        loading={isPending}
        emptyMessage="No hay marcas registradas"
        getRowKey={(marca) => marca.id}
        editHref={(marca) => `/admin/marcas/${marca.id}`}
        onDelete={handleOpenDeleteModal}
      />

      {/* Modal de confirmación */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        loading={isDeleting}
        itemName={deleteModal.marca?.nombre}
      />
    </div>
  );
}
