import { cache } from 'react';
import { serverFetch } from '../../../lib/server-fetch';
import NuevoProductoClient from './NuevoProductoClient';

interface Marca {
  id: string;
  nombre: string;
  activo: boolean;
}

interface Categoria {
  id: string;
  nombre: string;
  activo: boolean;
}

const getMarcas = cache(() =>
  serverFetch<Marca[]>('/api/marcas', { cache: 'no-store' })
);

const getCategorias = cache(() =>
  serverFetch<Categoria[]>('/api/categorias', { cache: 'no-store' })
);

export default async function NuevoProductoPage() {
  const [marcas, categorias] = await Promise.all([
    getMarcas(),
    getCategorias(),
  ]);

  return (
    <NuevoProductoClient
      initialMarcas={(marcas || []).filter((m) => m.activo)}
      initialCategorias={(categorias || []).filter((c) => c.activo)}
    />
  );
}
