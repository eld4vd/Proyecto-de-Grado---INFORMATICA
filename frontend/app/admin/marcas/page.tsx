import { cache } from 'react';
import { serverFetch } from '../../lib/server-fetch';
import MarcasClient from './MarcasClient';

interface Marca {
  id: string;
  nombre: string;
  slug: string;
  logoUrl: string | null;
  activo: boolean;
  createdAt: string;
}

const getMarcas = cache(() =>
  serverFetch<Marca[]>('/api/marcas', { cache: 'no-store' })
);

export default async function MarcasPage() {
  const marcas = await getMarcas();

  return <MarcasClient initialData={marcas || []} />;
}
