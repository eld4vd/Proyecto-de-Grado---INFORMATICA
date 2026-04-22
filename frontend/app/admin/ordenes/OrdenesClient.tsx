'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { MagnifyingGlass, ArrowsClockwise, Bag, Funnel, Calendar, CurrencyDollar } from '@phosphor-icons/react';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminTable, Column } from '../components/AdminTable';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';

interface Orden {
  id: string;
  numeroOrden: string;
  estado: string;
  estadoPago: string;
  subtotal: string | number;
  descuento: string | number;
  costoEnvio: string | number;
  total: string | number;
  createdAt: string;
  cliente?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
  };
  _count?: {
    items: number;
  };
}

interface PaginationMeta {
  total: number;
  skip: number;
  take: number;
  totalPages: number;
}

interface Stats {
  total: number;
  pendientes: number;
  ingresos: number;
}

type EstadoFilter = 'TODOS' | 'PENDIENTE' | 'PAGADO' | 'ENVIADO' | 'ENTREGADO' | 'CANCELADO';

export interface OrdenesClientProps {
  initialData: Orden[];
  initialMeta: PaginationMeta;
  initialStats: Stats;
}

export default function OrdenesClient({ initialData, initialMeta, initialStats }: OrdenesClientProps) {
  const [ordenes, setOrdenes] = useState<Orden[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('TODOS');

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [meta, setMeta] = useState<PaginationMeta>(initialMeta);

  // Estadísticas globales
  const [stats, setStats] = useState<Stats>(initialStats);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset página al cambiar filtro de estado
  useEffect(() => {
    setCurrentPage(1);
  }, [estadoFilter]);

  // Cargar estadísticas globales
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/ordenes?take=1000', { credentials: 'include' });
      if (res.ok) {
        const response = await res.json();
        const allOrdenes = response.data || [];
        setStats({
          total: response.meta?.total || allOrdenes.length,
          pendientes: allOrdenes.filter((o: Orden) => o.estado === 'PENDIENTE').length,
          ingresos: allOrdenes
            .filter((o: Orden) => o.estadoPago === 'APROBADO')
            .reduce((sum: number, o: Orden) => sum + (typeof o.total === 'string' ? parseFloat(o.total) : o.total), 0),
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, []);

  // Cargar órdenes con paginación
  const fetchOrdenes = useCallback(async () => {
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const params = new URLSearchParams({
        skip: skip.toString(),
        take: itemsPerPage.toString(),
      });

      if (estadoFilter !== 'TODOS') {
        params.append('estado', estadoFilter);
      }

      const res = await fetch(`/api/ordenes?${params}`, { credentials: 'include' });
      if (res.ok) {
        const response = await res.json();
        let data = response.data || [];

        // Filtro local por búsqueda (el backend no tiene search para órdenes)
        if (debouncedSearch) {
          data = data.filter((o: Orden) =>
            o.numeroOrden.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            o.cliente?.nombre.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            o.cliente?.apellido.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            o.cliente?.email.toLowerCase().includes(debouncedSearch.toLowerCase())
          );
        }

        setOrdenes(data);
        setMeta(response.meta || { total: 0, skip: 0, take: itemsPerPage, totalPages: 0 });
      }
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    }
  }, [currentPage, itemsPerPage, estadoFilter, debouncedSearch]);

  // Skip initial mount (data comes from server), refetch on parameter changes
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    startTransition(() => {
      Promise.all([fetchStats(), fetchOrdenes()]);
    });
  }, [fetchStats, fetchOrdenes]);

  // Handlers
  const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);
  // Refrescar todo en paralelo
  const handleRefresh = useCallback(() => {
    startTransition(() => {
      Promise.all([fetchOrdenes(), fetchStats()]);
    });
  }, [fetchOrdenes, fetchStats]);

  // Formatear fecha
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear precio
  const formatPrice = (precio: string | number): string => {
    const num = typeof precio === 'string' ? parseFloat(precio) : precio;
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(num);
  };

  // Mapear estado
  const getEstadoStatus = (estado: string): 'active' | 'inactive' | 'pending' | 'warning' => {
    switch (estado) {
      case 'ENTREGADO': return 'active';
      case 'CANCELADO': return 'inactive';
      case 'ENVIADO': return 'warning';
      case 'PAGADO': return 'active';
      default: return 'pending';
    }
  };

  // Mapear estado de pago
  const getEstadoPagoStatus = (estado: string): 'active' | 'inactive' | 'pending' | 'warning' => {
    switch (estado) {
      case 'APROBADO': return 'active';
      case 'RECHAZADO': return 'inactive';
      case 'REEMBOLSADO': return 'warning';
      default: return 'pending';
    }
  };

  // Columnas de la tabla
  const columns: Column<Orden>[] = [
    {
      key: 'numeroOrden',
      label: 'Orden',
      render: (orden) => (
        <div>
          <span className="font-medium text-white">#{orden.numeroOrden}</span>
          <p className="text-xs text-gray-500 tabular-nums">
            {orden._count?.items || 0} items
          </p>
        </div>
      ),
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (orden) => (
        <div>
          <span className="text-white">
            {orden.cliente?.nombre} {orden.cliente?.apellido}
          </span>
          <p className="text-xs text-gray-500">{orden.cliente?.email}</p>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (orden) => (
        <StatusBadge 
          status={getEstadoStatus(orden.estado)} 
          label={orden.estado}
        />
      ),
    },
    {
      key: 'estadoPago',
      label: 'Pago',
      render: (orden) => (
        <StatusBadge 
          status={getEstadoPagoStatus(orden.estadoPago)} 
          label={orden.estadoPago}
        />
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (orden) => (
        <span className="text-admin-primary font-medium tabular-nums">
          {formatPrice(orden.total)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (orden) => (
        <span className="text-sm text-gray-500">
          {formatDate(orden.createdAt)}
        </span>
      ),
    },
  ];

  const estados: EstadoFilter[] = ['TODOS', 'PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader
        title="Órdenes"
        description="Gestiona las órdenes de compra"
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0f1419] border border-[#1e293b] p-4">
          <div className="flex items-center gap-3">
            <Bag size={20} className="text-admin-primary" aria-hidden="true" />
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{stats.total}</p>
              <p className="text-xs text-gray-500">Total órdenes</p>
            </div>
          </div>
        </div>
        <div className="bg-[#0f1419] border border-[#1e293b] p-4">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-yellow-500" aria-hidden="true" />
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{stats.pendientes}</p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
          </div>
        </div>
        <div className="bg-[#0f1419] border border-[#1e293b] p-4">
          <div className="flex items-center gap-3">
            <CurrencyDollar size={20} className="text-green-500" aria-hidden="true" />
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{formatPrice(stats.ingresos)}</p>
              <p className="text-xs text-gray-500">Ingresos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Búsqueda y actualizar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <label htmlFor="search-ordenes" className="sr-only">Buscar órdenes</label>
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            <input
              id="search-ordenes"
              type="search"
              placeholder="Buscar por número, cliente o email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-[#334155] text-white placeholder-gray-600 focus:outline-none focus:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors"
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={isPending}
            aria-label="Actualizar lista de órdenes"
            className="inline-flex items-center gap-2 px-5 py-3 border border-[#334155] text-gray-400 hover:text-white hover:border-admin-primary transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
          >
            <ArrowsClockwise className={`size-4 ${isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
            Actualizar
          </button>
        </div>

        {/* Filtro por estado */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2" role="group" aria-label="Filtrar por estado">
          <Funnel size={16} className="text-gray-500 shrink-0" aria-hidden="true" />
          {estados.map((estado) => (
            <button
              key={estado}
              onClick={() => setEstadoFilter(estado)}
              aria-pressed={estadoFilter === estado}
              className={`px-3 py-1.5 text-sm border whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419] ${
                estadoFilter === estado
                  ? 'bg-admin-primary text-white border-admin-primary'
                  : 'bg-transparent text-gray-400 border-[#334155] hover:border-admin-primary hover:text-white'
              }`}
            >
              {estado}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <AdminTable
        columns={columns}
        data={ordenes}
        loading={isPending}
        emptyMessage={debouncedSearch ? 'No se encontraron órdenes' : 'No hay órdenes registradas'}
        getRowKey={(orden) => orden.id}
        viewHref={(orden) => `/admin/ordenes/${orden.id}`}
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
    </div>
  );
}