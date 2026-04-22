'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { MagnifyingGlass, ArrowsClockwise, Envelope, Phone, Calendar, Eye } from '@phosphor-icons/react';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminTable, Column } from '../components/AdminTable';
import { DeleteConfirmModal } from '../components/AdminModal';
import { Pagination } from '../components/Pagination';

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  nitCi: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  _count?: {
    ordenes: number;
    direcciones: number;
  };
}

interface PaginationMeta {
  total: number;
  skip: number;
  take: number;
  totalPages: number;
}


export interface ClientesClientProps {
  initialData: Cliente[];
  initialMeta: PaginationMeta;
}

export default function ClientesClient({ initialData, initialMeta }: ClientesClientProps) {
  const [clientes, setClientes] = useState<Cliente[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; cliente: Cliente | null }>({
    open: false,
    cliente: null,
  });
  const [isDeleting, startDeleteTransition] = useTransition();

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);


  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);



  // Cargar clientes con paginación
  const fetchClientes = useCallback(async () => {
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const params = new URLSearchParams({
        skip: skip.toString(),
        take: itemsPerPage.toString(),
      });

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const res = await fetch(`/api/clientes?${params}`, { credentials: 'include' });
      if (res.ok) {
        const response = await res.json();
        setClientes(response.data || []);
        setMeta(response.meta || { total: 0, skip: 0, take: itemsPerPage, totalPages: 0 });
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  }, [currentPage, itemsPerPage, debouncedSearch]);

  // Skip initial mount (data comes from server), refetch on parameter changes
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    startTransition(() => {
      fetchClientes();
    });
  }, [fetchClientes]);

  // Handlers
  const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);
  // Refrescar clientes
  const handleRefresh = useCallback(() => {
    startTransition(() => {
      fetchClientes();
    });
  }, [fetchClientes]);

  // Eliminar cliente (soft delete)
  const handleDelete = useCallback(async () => {
    if (!deleteModal.cliente) return;
    
    startDeleteTransition(async () => {
      try {
        const res = await fetch(`/api/clientes/${deleteModal.cliente!.id}`, {
          method: 'DELETE',
          credentials: 'include',
      });
      
      if (res.ok) {
        await fetchClientes();
        setDeleteModal({ open: false, cliente: null });
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
    });
  }, [deleteModal.cliente, fetchClientes]);

  const handleOpenDeleteModal = useCallback((cliente: Cliente) => {
    setDeleteModal({ open: true, cliente });
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModal({ open: false, cliente: null });
  }, []);

  // Formatear fecha
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Columnas de la tabla
  const columns: Column<Cliente>[] = [
    {
      key: 'nombre',
      label: 'Cliente',
      render: (cliente) => (
        <div className="flex items-center gap-3">
          <div className="size-9 bg-[#1e293b] flex items-center justify-center text-admin-primary font-medium">
            {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
          </div>
          <div>
            <span className="font-medium text-white">
              {cliente.nombre} {cliente.apellido}
            </span>
            {cliente.nitCi && (
              <p className="text-xs text-gray-500">NIT/CI: {cliente.nitCi}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contacto',
      render: (cliente) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Envelope size={14} aria-hidden="true" />
            <span className="text-sm">{cliente.email}</span>
          </div>
          {cliente.telefono && (
            <div className="flex items-center gap-1.5 text-gray-500">
              <Phone size={14} aria-hidden="true" />
              <span className="text-sm">{cliente.telefono}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'ordenes',
      label: 'Órdenes',
      render: (cliente) => (
        <span className="text-gray-400 tabular-nums">
          {cliente._count?.ordenes || 0}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Último acceso',
      render: (cliente) => (
        <div className="flex items-center gap-1.5 text-gray-500">
          <Calendar size={14} aria-hidden="true" />
          <span className="text-sm">{formatDate(cliente.lastLoginAt)}</span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Registro',
      render: (cliente) => (
        <span className="text-sm text-gray-500">
          {formatDate(cliente.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader
        title="Clientes"
        description="Gestiona los clientes registrados"
      />



      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <label htmlFor="search-clientes" className="sr-only">Buscar clientes</label>
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            id="search-clientes"
            type="search"
            placeholder="Buscar por nombre, email o teléfono…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-[#334155] text-white placeholder-gray-600 focus:outline-none focus:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={handleRefresh}
          disabled={isPending}
          aria-label="Actualizar lista de clientes"
          className="inline-flex items-center gap-2 px-5 py-3 border border-[#334155] text-gray-400 hover:text-white hover:border-admin-primary transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
        >
          <ArrowsClockwise className={`size-4 ${isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {/* Tabla */}
      <AdminTable
        columns={columns}
        data={clientes}
        loading={isPending}
        emptyMessage={debouncedSearch ? 'No se encontraron clientes' : 'No hay clientes registrados'}
        getRowKey={(cliente) => cliente.id}
        viewHref={(cliente) => `/admin/clientes/${cliente.id}`}
        onDelete={handleOpenDeleteModal}
      />

      {/* Paginación */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPageOptions={[10, 20, 50, 100]}
        />
      </div>

      {/* Modal de eliminación */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDelete}
        loading={isDeleting}
        itemName={deleteModal.cliente ? `${deleteModal.cliente.nombre} ${deleteModal.cliente.apellido}` : undefined}
      />
    </div>
  );
}
