import { cache } from 'react';
import { serverFetch } from '../../../lib/server-fetch';
import NuevaCategoriaClient from './NuevaCategoriaClient';

interface CategoriaOption {
  id: string;
  nombre: string;
  categoriaPadreId: string | null;
}

const getCategorias = cache(() =>
  serverFetch<CategoriaOption[]>('/api/categorias', { cache: 'no-store' })
);

export default async function NuevaCategoriaPage() {
  const categorias = await getCategorias();
  const categoriasPadre = (categorias || []).filter((c) => !c.categoriaPadreId);

  return <NuevaCategoriaClient initialCategoriasPadre={categoriasPadre} />;
}
