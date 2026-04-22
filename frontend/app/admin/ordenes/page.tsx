import { cache } from 'react';
import { serverFetch } from '../../lib/server-fetch';
import OrdenesClient from './OrdenesClient';

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

interface OrdenesResponse {
  data: Orden[];
  meta: PaginationMeta;
}

const getOrdenes = cache(() =>
  serverFetch<OrdenesResponse>('/api/ordenes?skip=0&take=10', { cache: 'no-store' })
);

const getAllOrdenesForStats = cache(() =>
  serverFetch<OrdenesResponse>('/api/ordenes?take=1000', { cache: 'no-store' })
);

export default async function OrdenesPage() {
  const [ordenesResponse, allOrdenesResponse] = await Promise.all([
    getOrdenes(),
    getAllOrdenesForStats(),
  ]);

  const allOrdenes = allOrdenesResponse?.data || [];
  const stats = {
    total: allOrdenesResponse?.meta?.total || allOrdenes.length,
    pendientes: allOrdenes.filter((o) => o.estado === 'PENDIENTE').length,
    ingresos: allOrdenes
      .filter((o) => o.estadoPago === 'APROBADO')
      .reduce((sum, o) => sum + (typeof o.total === 'string' ? parseFloat(o.total) : o.total), 0),
  };

  return (
    <OrdenesClient
      initialData={ordenesResponse?.data || []}
      initialMeta={ordenesResponse?.meta || { total: 0, skip: 0, take: 10, totalPages: 0 }}
      initialStats={stats}
    />
  );
}
