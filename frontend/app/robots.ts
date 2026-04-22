import { MetadataRoute } from 'next';

/**
 * Archivo robots.txt dinámico
 * Indica a los motores de búsqueda qué páginas pueden indexar
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sicabit.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',      // No indexar panel de admin
          '/cuenta/',     // No indexar área privada de usuario
          '/carrito/',    // No indexar carrito
          '/api/',        // No indexar endpoints API
          '/login',       // No indexar login
          '/registro',    // No indexar registro
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
