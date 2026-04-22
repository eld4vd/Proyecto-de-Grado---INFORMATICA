import { cache } from 'react';
import { serverFetch } from '../../lib/server-fetch';
import CodigosClient from './CodigosClient';

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

const getCodigos = cache(() =>
  serverFetch<CodigoPromocional[]>('/api/codigos-promocionales/admin', { cache: 'no-store' })
);

export default async function CodigosPromocionalesPage() {
  const codigos = await getCodigos();

  return <CodigosClient initialData={codigos || []} />;
}
