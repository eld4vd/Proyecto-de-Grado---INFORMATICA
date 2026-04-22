/**
 * API de productos para el frontend público
 * Usa fetch con revalidación para SEO y rendimiento
 * Implementa React.cache para deduplicación per-request (Vercel Best Practice)
 */

import { cache } from 'react';
import type { 
  Producto, 
  Categoria, 
  Marca, 
  PaginatedResponse, 
  ProductFilters 
} from './types';
import { getApiBaseUrl } from './api-env';

const API_BASE = getApiBaseUrl();

/**
 * Obtener productos con filtros y paginación
 */
export async function getProducts(
  filters: ProductFilters = {},
  options: { revalidate?: number } = {}
): Promise<PaginatedResponse<Producto>> {
  const params = new URLSearchParams();
  
  if (filters.search) params.set('search', filters.search);
  if (filters.categoriaId) params.set('categoriaId', filters.categoriaId);
  if (filters.marcaId) params.set('marcaId', filters.marcaId);
  if (filters.precioMin) params.set('precioMin', filters.precioMin.toString());
  if (filters.precioMax) params.set('precioMax', filters.precioMax.toString());
  if (filters.destacado !== undefined) params.set('destacado', filters.destacado.toString());
  if (filters.activo !== undefined) params.set('activo', filters.activo.toString());
  if (filters.orderBy) params.set('orderBy', filters.orderBy);
  if (filters.orderDir) params.set('orderDir', filters.orderDir);
  if (filters.skip !== undefined) params.set('skip', filters.skip.toString());
  if (filters.take !== undefined) params.set('take', filters.take.toString());

  try {
    const res = await fetch(`${API_BASE}/productos?${params}`, {
      next: { revalidate: options.revalidate ?? 60 }, // Revalidar cada 60 segundos por defecto
    });

    if (!res.ok) {
      console.error('Error fetching products:', res.status);
      return { data: [], meta: { total: 0, skip: 0, take: 12, totalPages: 0 } };
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: [], meta: { total: 0, skip: 0, take: 12, totalPages: 0 } };
  }
}

/**
 * Obtener productos destacados
 */
export async function getFeaturedProducts(take: number = 8): Promise<Producto[]> {
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
}

/**
 * Obtener un producto por ID o slug (el backend detecta automáticamente)
 * Usa React.cache para deduplicación per-request
 * @param identifier - Puede ser un UUID o un slug
 */
export const getProduct = cache(async (identifier: string): Promise<Producto | null> => {
  try {
    // El endpoint unificado del backend acepta tanto UUID como slug
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

// Alias para compatibilidad hacia atrás
export const getProductById = getProduct;
export const getProductBySlug = getProduct;

/**
 * Obtener todas las categorías activas
 * Usa React.cache para deduplicación per-request
 */
export const getCategories = cache(async (): Promise<Categoria[]> => {
  try {
    const res = await fetch(`${API_BASE}/categorias/activas`, {
      next: { revalidate: 300 }, // 5 minutos, categorías cambian poco
    });

    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
});

/**
 * Obtener todas las marcas activas
 * Usa React.cache para deduplicación per-request
 */
export const getBrands = cache(async (): Promise<Marca[]> => {
  try {
    const res = await fetch(`${API_BASE}/marcas`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    // Filtrar solo activas si el backend no lo hace
    return Array.isArray(data) 
      ? data.filter((m: Marca) => m.activo) 
      : (data.data || []).filter((m: Marca) => m.activo);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
});
