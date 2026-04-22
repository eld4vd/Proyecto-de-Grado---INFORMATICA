/**
 * Server-side data fetching con React.cache para deduplicación
 * Vercel Best Practice: server-cache-react
 * 
 * Usa React.cache() para deduplicar requests dentro de una misma request del servidor.
 * Las funciones cacheadas con cache() ejecutan la query solo UNA vez por request,
 * incluso si se llaman múltiples veces desde diferentes Server Components.
 */

import { cache } from 'react';
import type { Producto, Categoria, Marca, PaginatedResponse } from './types';
import { getApiBaseUrl } from './api-env';

const API_BASE = getApiBaseUrl();

/**
 * Obtener productos destacados - cacheado por request
 * (server-cache-react: usa primitivos como args, no objetos)
 */
export const getFeaturedProductsCached = cache(async (take: number = 8): Promise<Producto[]> => {
  try {
    const res = await fetch(`${API_BASE}/productos/destacados?take=${take}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
});

/**
 * Obtener un producto por ID o slug - cacheado por request
 * (server-cache-react: usa string primitivo como arg)
 */
export const getProductCached = cache(async (identifier: string): Promise<Producto | null> => {
  try {
    const res = await fetch(`${API_BASE}/productos/${identifier}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
});

/**
 * Obtener todas las categorías activas - cacheado por request
 */
export const getCategoriesCached = cache(async (): Promise<Categoria[]> => {
  try {
    const res = await fetch(`${API_BASE}/categorias/activas`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
});

/**
 * Obtener todas las marcas activas - cacheado por request
 */
export const getBrandsCached = cache(async (): Promise<Marca[]> => {
  try {
    const res = await fetch(`${API_BASE}/marcas`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) 
      ? data.filter((m: Marca) => m.activo) 
      : (data.data || []).filter((m: Marca) => m.activo);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
});

/**
 * Obtener categoría por slug - cacheado por request
 */
export const getCategoryBySlugCached = cache(async (slug: string): Promise<Categoria | null> => {
  try {
    const categories = await getCategoriesCached();
    return categories.find(c => c.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }
});

/**
 * Obtener productos con filtros - Para Server Components
 * Nota: Esta función usa objetos, por lo que no se cachea con cache()
 * ya que cache() usa shallow equality. En su lugar, rely on Next.js fetch memoization.
 */
export async function getProductsServer(
  filters: {
    categoriaId?: string;
    marcaId?: string;
    search?: string;
    precioMin?: number;
    precioMax?: number;
    destacado?: boolean;
    enOferta?: boolean;
    activo?: boolean;
    skip?: number;
    take?: number;
  } = {}
): Promise<PaginatedResponse<Producto>> {
  const params = new URLSearchParams();
  
  // Construir params solo con valores definidos (js-early-exit pattern)
  if (filters.search) params.set('search', filters.search);
  if (filters.categoriaId) params.set('categoriaId', filters.categoriaId);
  if (filters.marcaId) params.set('marcaId', filters.marcaId);
  if (filters.precioMin !== undefined) params.set('precioMin', filters.precioMin.toString());
  if (filters.precioMax !== undefined) params.set('precioMax', filters.precioMax.toString());
  if (filters.destacado !== undefined) params.set('destacado', filters.destacado.toString());
  if (filters.enOferta !== undefined) params.set('enOferta', filters.enOferta.toString());
  if (filters.activo !== undefined) params.set('activo', filters.activo.toString());
  if (filters.skip !== undefined) params.set('skip', filters.skip.toString());
  if (filters.take !== undefined) params.set('take', filters.take.toString());

  try {
    const res = await fetch(`${API_BASE}/productos?${params}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { data: [], meta: { total: 0, skip: 0, take: 12, totalPages: 0 } };
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: [], meta: { total: 0, skip: 0, take: 12, totalPages: 0 } };
  }
}
