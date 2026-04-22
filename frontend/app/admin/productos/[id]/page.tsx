import { cache } from 'react';
import { redirect } from 'next/navigation';
import { serverFetch } from '../../../lib/server-fetch';
import EditProductoClient from './EditProductoClient';

export const dynamic = 'force-dynamic';

interface Marca {
  id: string;
  nombre: string;
}

interface Categoria {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  sku: string;
  nombre: string;
  slug: string;
  descripcion: string;
  marcaId: string | null;
  precio: string | number;
  stock: number;
  activo: boolean;
  destacado: boolean;
  imagenes?: { id: string; url: string; esPrincipal: boolean; orden: number }[];
  productoCategorias?: { categoria: { id: string; nombre: string } }[];
  especificaciones?: { id: string; nombre: string; valor: string }[];
}

const getProducto = cache((id: string) =>
  serverFetch<Producto>(`/api/productos/${id}`, { cache: 'no-store' })
);

const getMarcas = cache(() =>
  serverFetch<Marca[]>('/api/marcas', { cache: 'no-store' })
);

const getCategorias = cache(() =>
  serverFetch<Categoria[]>('/api/categorias', { cache: 'no-store' })
);

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [producto, marcas, categorias] = await Promise.all([
    getProducto(id),
    getMarcas(),
    getCategorias(),
  ]);

  if (!producto) {
    redirect('/admin/productos');
  }

  return (
    <EditProductoClient
      id={id}
      initialProducto={producto}
      initialMarcas={marcas || []}
      initialCategorias={categorias || []}
    />
  );
}
