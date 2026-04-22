import { MetadataRoute } from 'next';
import { getApiBaseUrl } from './lib/api-env';

/**
 * Sitemap dinámico para SEO
 * Genera automáticamente el mapa del sitio para Google
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sicabit.com';
  const apiBaseUrl = getApiBaseUrl();

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ofertas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Intentar obtener productos del backend para el sitemap
  let productPages: MetadataRoute.Sitemap = [];
  
  try {
    const response = await fetch(`${apiBaseUrl}/productos?activo=true&take=100`, {
      next: { revalidate: 3600 }, // Revalidar cada hora
    });

    if (response.ok) {
      const data = await response.json();
      const productos = data.data || data || [];

      productPages = productos.map((producto: { id: string; slug: string; updatedAt?: string }) => ({
        url: `${baseUrl}/productos/${producto.slug}`,

        lastModified: producto.updatedAt ? new Date(producto.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error al obtener productos para sitemap:', error);
  }

  // Intentar obtener categorías
  let categoryPages: MetadataRoute.Sitemap = [];

  try {
    const response = await fetch(`${apiBaseUrl}/categorias?activo=true`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const categorias = await response.json();

      categoryPages = categorias.map((categoria: { id: string; slug: string }) => ({
        url: `${baseUrl}/productos?categoria=${categoria.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error al obtener categorías para sitemap:', error);
  }

  return [...staticPages, ...productPages, ...categoryPages];
}
