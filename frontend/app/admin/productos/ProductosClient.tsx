'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import Image from 'next/image';
import { MagnifyingGlass, ArrowsClockwise, Star, ImageSquare, CaretUpDown, CaretUp, CaretDown } from '@phosphor-icons/react';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminTable, Column } from '../components/AdminTable';
import { StatusBadge } from '../components/StatusBadge';
import { DeleteConfirmModal } from '../components/AdminModal';
import { Pagination } from '../components/Pagination';

interface Producto {
  id: string;
  sku: string;
  nombre: string;
  slug: string;
  descripcion: string;
  marcaId: string | null;
  precio: string | number;
  precioOferta?: string | number | null;
  stock: number;
  activo: boolean;
  destacado: boolean;
  createdAt: string;
  marca?: { id: string; nombre: string } | null;
  imagenes?: { id: string; url: string; esPrincipal: boolean }[];
  productoCategorias?: { categoria: { id: string; nombre: string } }[];
}

interface PaginationMeta {
  total: number;
  skip: number;
  take: number;
  totalPages: number;
}

type SortField = 'nombre' | 'precio' | 'stock';
type SortDirection = 'asc' | 'desc';

interface SortState {
  field: SortField | null;
  direction: SortDirection | null;
}


export interface ProductosClientProps {
  initialData: Producto[];
  initialMeta: PaginationMeta;
}

export default function ProductosClient({ initialData, initialMeta }: ProductosClientProps) {
  const [productos, setProductos] = useState<Producto[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ field: null, direction: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; producto: Producto | null }>({
    open: false,
    producto: null,
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



  // Cargar productos con paginación
  const fetchProductos = useCallback(async () => {
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      const params = new URLSearchParams({
        skip: skip.toString(),
        take: itemsPerPage.toString(),
      });

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      if (sort.field && sort.direction) {
        params.append('orderBy', sort.field);
        params.append('orderDir', sort.direction);
      }

      const res = await fetch(`/api/productos?${params}`, { credentials: 'include' });
      if (res.ok) {
        const response = await res.json();
        setProductos(response.data || []);
        setMeta(response.meta || { total: 0, skip: 0, take: itemsPerPage, totalPages: 0 });
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, sort.field, sort.direction]);

  // Skip initial mount (data comes from server), refetch on parameter changes
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    startTransition(() => {
      fetchProductos();
    });
  }, [fetchProductos]);

  // Cambio de página
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Cambio de items por página
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // Refrescar productos
  const handleRefresh = useCallback(() => {
    startTransition(() => {
      fetchProductos();
    });
  }, [fetchProductos]);

  const getNextSortState = useCallback((field: SortField): SortState => {
    if (sort.field !== field) {
      return { field, direction: 'asc' };
    }

    if (sort.direction === 'asc') {
      return { field, direction: 'desc' };
    }

    return { field: null, direction: null };
  }, [sort.direction, sort.field]);

  const handleSort = useCallback((field: SortField) => {
    setCurrentPage(1);
    setSort(getNextSortState(field));
  }, [getNextSortState]);

  const getSortIcon = useCallback((field: SortField) => {
    if (sort.field !== field || !sort.direction) {
      return <CaretUpDown size={12} className="text-gray-500" aria-hidden="true" />;
    }

    if (sort.direction === 'asc') {
      return <CaretUp size={12} className="text-admin-primary" aria-hidden="true" />;
    }

    return <CaretDown size={12} className="text-admin-primary" aria-hidden="true" />;
  }, [sort.direction, sort.field]);

  const getSortAriaLabel = useCallback((field: SortField, label: string) => {
    if (sort.field !== field || !sort.direction) {
      return `Ordenar ${label} ascendente`;
    }

    if (sort.direction === 'asc') {
      return `Ordenar ${label} descendente`;
    }

    return `Quitar orden de ${label} y volver al orden normal`;
  }, [sort.direction, sort.field]);

  // Eliminar producto
  const handleDelete = useCallback(async () => {
    if (!deleteModal.producto) return;
    
    startDeleteTransition(async () => {
      try {
        const res = await fetch(`/api/productos/${deleteModal.producto!.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        
        if (res.ok) {
          await fetchProductos();
          setDeleteModal({ open: false, producto: null });
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    });
  }, [deleteModal.producto, fetchProductos]);

  const handleOpenDeleteModal = useCallback((prod: Producto) => {
    setDeleteModal({ open: true, producto: prod });
  }, []);

  // Obtener imagen principal
  const getImagenPrincipal = (producto: Producto): string | null => {
    if (!producto.imagenes || producto.imagenes.length === 0) return null;
    const principal = producto.imagenes.find(img => img.esPrincipal);
    return principal?.url || producto.imagenes[0]?.url || null;
  };

  // Formatear precio
  const formatPrice = (precio: string | number): string => {
    const num = typeof precio === 'string' ? parseFloat(precio) : precio;
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(num);
  };

  // Columnas de la tabla
  const columns: Column<Producto>[] = [
    {
      key: 'nombre',
      label: (
        <button
          type="button"
          onClick={() => handleSort('nombre')}
          aria-label={getSortAriaLabel('nombre', 'producto')}
          className="inline-flex items-center gap-1 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
        >
          Producto
          {getSortIcon('nombre')}
        </button>
      ),
      render: (prod) => {
        const imagen = getImagenPrincipal(prod);
        return (
          <div className="flex items-center gap-3">
            {imagen ? (
              <Image 
                src={imagen} 
                alt={prod.nombre}
                width={40}
                height={40}
                className="size-10 object-cover"
              />
            ) : (
              <div className="size-10 bg-[#1e293b] flex items-center justify-center">
                <ImageSquare size={20} className="text-gray-500" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white truncate max-w-50">{prod.nombre}</span>
                {prod.destacado && (
                  <Star size={14} className="text-yellow-500 fill-yellow-500 shrink-0" aria-hidden="true" />
                )}
              </div>
              {prod.marca && (
                <p className="text-xs text-gray-500">{prod.marca.nombre}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (prod) => (
        <code className="text-xs bg-[#1e293b] px-2 py-1 text-gray-400">
          {prod.sku}
        </code>
      ),
    },
    {
      key: 'precio',
      label: (
        <button
          type="button"
          onClick={() => handleSort('precio')}
          aria-label={getSortAriaLabel('precio', 'precio')}
          className="inline-flex items-center gap-1 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
        >
          Precio
          {getSortIcon('precio')}
        </button>
      ),
      render: (prod) => {
        const tieneOferta = prod.precioOferta != null && Number(prod.precioOferta) > 0 && Number(prod.precioOferta) < Number(prod.precio);
        return tieneOferta ? (
          <div>
            <span className="text-admin-primary font-medium tabular-nums">
              {formatPrice(prod.precioOferta!)}
            </span>
            <span className="block text-xs text-gray-500 line-through tabular-nums">
              {formatPrice(prod.precio)}
            </span>
          </div>
        ) : (
          <span className="text-admin-primary font-medium tabular-nums">
            {formatPrice(prod.precio)}
          </span>
        );
      },
    },
    {
      key: 'stock',
      label: (
        <button
          type="button"
          onClick={() => handleSort('stock')}
          aria-label={getSortAriaLabel('stock', 'stock')}
          className="inline-flex items-center gap-1 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
        >
          Stock
          {getSortIcon('stock')}
        </button>
      ),
      render: (prod) => (
        <span className={`tabular-nums ${prod.stock <= 5 ? 'text-admin-danger' : prod.stock <= 20 ? 'text-admin-warning' : 'text-gray-400'}`}>
          {prod.stock} uds
        </span>
      ),
    },
    {
      key: 'categorias',
      label: 'Categorías',
      render: (prod) => {
        const cats = prod.productoCategorias?.map(pc => pc.categoria.nombre) || [];
        return (
          <div className="flex flex-wrap gap-1 max-w-40">
            {cats.slice(0, 2).map((cat, i) => (
              <span key={i} className="text-xs bg-[#1e293b] px-2 py-0.5 text-gray-400">
                {cat}
              </span>
            ))}
            {cats.length > 2 && (
              <span className="text-xs text-gray-500">+{cats.length - 2}</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (prod) => (
        <StatusBadge status={prod.activo ? 'active' : 'inactive'} />
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <AdminPageHeader
        title="Productos"
        description="Gestiona el catálogo de productos"
        createHref="/admin/productos/nuevo"
        createLabel="Nuevo producto"
      />



      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <label htmlFor="search-productos" className="sr-only">Buscar productos</label>
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            id="search-productos"
            type="search"
            placeholder="Buscar por nombre, SKU o marca…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-[#334155] text-white placeholder-gray-600 focus:outline-none focus:border-admin-primary focus-visible:ring-2 focus-visible:ring-admin-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={handleRefresh}
          disabled={isPending}
          aria-label="Actualizar lista de productos"
          className="inline-flex items-center gap-2 px-5 py-3 border border-[#334155] text-gray-400 hover:text-white hover:border-admin-primary transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
        >
          <ArrowsClockwise className={`size-4 ${isPending ? 'animate-spin' : ''}`} aria-hidden="true" />
          Actualizar
        </button>
      </div>

      {/* Tabla */}
      <AdminTable
        columns={columns}
        data={productos}
        loading={isPending}
        emptyMessage={debouncedSearch ? 'No se encontraron productos' : 'No hay productos registrados'}
        getRowKey={(prod) => prod.id}
        editHref={(prod) => `/admin/productos/${prod.id}`}
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
    </div>
  );
}
