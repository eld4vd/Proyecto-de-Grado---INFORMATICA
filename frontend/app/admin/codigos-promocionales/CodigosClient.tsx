'use client';

import { useState, useCallback, useTransition, useMemo } from 'react';
import { MagnifyingGlass, ArrowsClockwise, Tag } from '@phosphor-icons/react';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminTable, Column } from '../components/AdminTable';
import { StatusBadge } from '../components/StatusBadge';
import { DeleteConfirmModal } from '../components/AdminModal';

interface CodigoPromocional {
  id: string;
  codigo: string;
  descuento: number;
  esPorcentaje: boolean;
  activo: boolean;
  fechaExpiracion: string | null;
  usosMaximos: number | null;
  usosActuales: number;
  createdAt: string;
}

export interface CodigosClientProps {
  initialData: CodigoPromocional[];
}

export default function CodigosClient({ initialData }: CodigosClientProps) {
  const [codigos, setCodigos] = useState<CodigoPromocional[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; codigo: CodigoPromocional | null }>({
    open: false,
    codigo: null,
  });
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleToggleEstado = useCallback((codigo: CodigoPromocional) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/codigos-promocionales/admin/${codigo.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ activo: !codigo.activo }),
        });

        if (res.ok) {
          const updated = await res.json();
          setCodigos((prev) =>
            prev.map((c) =>
              c.id === codigo.id ? { ...c, ...updated } : c,
            ),
          );
        }
      } catch (error) {
        console.error('Error al cambiar estado del código:', error);
      }
    });
  }, []);

  const fetchCodigos = useCallback(async () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/codigos-promocionales/admin', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCodigos(data);
        }
      } catch (error) {
        console.error('Error al cargar codigos:', error);
      }
    });
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteModal.codigo) return;

    startDeleteTransition(async () => {
      try {
        const res = await fetch(`/api/codigos-promocionales/admin/${deleteModal.codigo!.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (res.ok) {
          setCodigos(prev => prev.filter(c => c.id !== deleteModal.codigo?.id));
          setDeleteModal({ open: false, codigo: null });
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    });
  }, [deleteModal.codigo]);

  const filteredCodigos = useMemo(() => {
    const searchLower = search.toLowerCase();
    if (!searchLower) return codigos;
    return codigos.filter(c => c.codigo.toLowerCase().includes(searchLower));
  }, [codigos, search]);

  const columns: Column<CodigoPromocional>[] = [
    {
      key: 'codigo',
      label: 'Código',
      render: (code) => (
        <div className="flex items-center gap-3">
          <div className="size-8 bg-[#1e293b] flex items-center justify-center">
            <Tag size={16} className="text-gray-500" />
          </div>
          <span className="font-bold text-white uppercase">{code.codigo}</span>
        </div>
      ),
    },
    {
      key: 'descuento',
      label: 'Descuento',
      render: (code) => (
        <span className="text-gray-300">
          {code.esPorcentaje ? `${code.descuento}%` : `Bs. ${Number(code.descuento).toFixed(2)}`}
        </span>
      ),
    },
    {
      key: 'usos',
      label: 'Usos',
      render: (code) => (
        <span className="text-gray-400">
          {code.usosActuales} {code.usosMaximos ? `/ ${code.usosMaximos}` : ''}
        </span>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (code) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={code.activo ? 'active' : 'inactive'} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleEstado(code);
            }}
            className="text-xs text-gray-400 hover:text-admin-primary transition-colors"
          >
            {code.activo ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader
        title="Códigos Promocionales"
        description="Gestiona los códigos de descuento"
        createHref="/admin/codigos-promocionales/nuevo"
        createLabel="Nuevo código"
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            placeholder="Buscar código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f1419] border border-[#334155] text-white placeholder-gray-600 focus:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={fetchCodigos}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#334155] text-gray-400 hover:text-white transition-colors"
        >
          <ArrowsClockwise className={isPending ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      <AdminTable
        columns={columns}
        data={filteredCodigos}
        loading={isPending}
        emptyMessage="No hay códigos registrados"
        getRowKey={(c) => c.id}
        editHref={(c) => `/admin/codigos-promocionales/${c.id}`}
        onDelete={(c) => setDeleteModal({ open: true, codigo: c })}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, codigo: null })}
        onConfirm={handleDelete}
        loading={isDeleting}
        itemName={deleteModal.codigo?.codigo}
      />
    </div>
  );
}