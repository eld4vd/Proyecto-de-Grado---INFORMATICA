import { cache } from 'react';
import { redirect } from 'next/navigation';
import { serverFetch } from '../../../lib/server-fetch';
import EditCategoriaClient from './EditCategoriaClient';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  categoriaPadreId: string | null;
  activo: boolean;
}

interface CategoriaOption {
  id: string;
  nombre: string;
  categoriaPadreId: string | null;
}

const getCategoria = cache((id: string) =>
  serverFetch<Categoria>(`/api/categorias/${id}`, { cache: 'no-store' })
);

const getCategorias = cache(() =>
  serverFetch<CategoriaOption[]>('/api/categorias', { cache: 'no-store' })
);

export default async function EditarCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [categoria, categorias] = await Promise.all([
    getCategoria(id),
    getCategorias(),
  ]);

  if (!categoria) {
    redirect('/admin/categorias');
  }

  const categoriasPadre = (categorias || []).filter(
    (c) => c.id !== id && !c.categoriaPadreId
  );

  return (
    <EditCategoriaClient
      id={id}
      initialCategoria={categoria}
      initialCategoriasPadre={categoriasPadre}
    />
  );
}
