import { cache } from 'react';
import { serverFetch } from '../../lib/server-fetch';
import CategoriasClient from './CategoriasClient';

interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean;
  categoriaPadreId: string | null;
  categoriaPadre?: { nombre: string } | null;
  createdAt: string;
  _count?: { subcategorias: number; productoCategorias: number };
}

const getCategorias = cache(() =>
  serverFetch<Categoria[]>('/api/categorias', { cache: 'no-store' })
);

export default async function CategoriasPage() {
  const categorias = await getCategorias();

  return <CategoriasClient initialData={categorias || []} />;
}
