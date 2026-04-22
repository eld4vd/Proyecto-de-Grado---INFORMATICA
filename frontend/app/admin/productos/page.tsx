import { cache } from 'react';
import { serverFetch } from '../../lib/server-fetch';
import ProductosClient from './ProductosClient';

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

interface ProductosResponse {
  data: Producto[];
  meta: PaginationMeta;
}

const getProductos = cache(() =>
  serverFetch<ProductosResponse>('/api/productos?skip=0&take=10', { cache: 'no-store' })
);

export default async function ProductosPage() {
  const response = await getProductos();

  return (
    <ProductosClient
      initialData={response?.data || []}
      initialMeta={response?.meta || { total: 0, skip: 0, take: 10, totalPages: 0 }}
    />
  );
}
