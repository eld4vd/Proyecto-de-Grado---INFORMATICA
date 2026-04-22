import { cookies } from 'next/headers';
import { getBackendOrigin } from './api-env';

const BACKEND_ORIGIN = getBackendOrigin();

interface AuthRefreshResponse {
  tokens?: {
    accessToken?: string;
  };
}

interface FetchOptions {
  /** Estrategia de caché: 'force-cache' | 'no-store' | { revalidate: number } */
  cache?: RequestCache | { revalidate: number };
  /** Tags para revalidación on-demand */
  tags?: string[];
}

/**
 * Fetch autenticado para Server Components
 * Incluye automáticamente el token de acceso desde cookies
 * 
 * @example
 * // Datos dinámicos (sin caché)
 * const orders = await serverFetch('/api/ordenes', { cache: 'no-store' });
 * 
 * // Datos con revalidación cada 60 segundos
 * const products = await serverFetch('/api/productos', { cache: { revalidate: 60 } });
 * 
 * // Datos estáticos con tags para revalidación manual
 * const categories = await serverFetch('/api/categorias', { 
 *   cache: 'force-cache',
 *   tags: ['categories'] 
 * });
 */
export async function serverFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${BACKEND_ORIGIN}${endpoint}`;

    const buildCookieHeader = (
      nextAccessToken?: string,
      nextRefreshToken?: string,
    ) =>
      [
        nextAccessToken && `access_token=${nextAccessToken}`,
        nextRefreshToken && `refresh_token=${nextRefreshToken}`,
      ]
        .filter(Boolean)
        .join('; ');

    // Construir header de cookies
    const cookieHeader = buildCookieHeader(accessToken, refreshToken);

    const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
      headers: {
        Cookie: cookieHeader,
        'Content-Type': 'application/json',
      },
    };

    // Manejar estrategia de caché
    if (typeof options.cache === 'object' && 'revalidate' in options.cache) {
      fetchOptions.next = { revalidate: options.cache.revalidate };
    } else if (options.cache) {
      fetchOptions.cache = options.cache as RequestCache;
    }

    // Tags para revalidación
    if (options.tags) {
      fetchOptions.next = { ...fetchOptions.next, tags: options.tags };
    }

    let res = await fetch(url, fetchOptions);

    // Si el access token expiró, intentar renovarlo con refresh token y reintentar.
    if (res.status === 401 && refreshToken) {
      const refreshedAccessToken = await refreshAccessToken(refreshToken);

      if (refreshedAccessToken) {
        const retryOptions: RequestInit & {
          next?: { revalidate?: number; tags?: string[] };
        } = {
          ...fetchOptions,
          headers: {
            ...(fetchOptions.headers || {}),
            Cookie: buildCookieHeader(refreshedAccessToken, refreshToken),
            'Content-Type': 'application/json',
          },
        };

        res = await fetch(url, retryOptions);
      }
    }

    if (!res.ok) {
      console.error(`[serverFetch] Error ${res.status}: ${endpoint}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error(`[serverFetch] Failed: ${endpoint}`, error);
    return null;
  }
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as AuthRefreshResponse;
    return data.tokens?.accessToken || null;
  } catch {
    return null;
  }
}

/**
 * Estrategias de caché recomendadas por tipo de datos:
 * 
 * 📊 DATOS DINÁMICOS (tiempo real):
 *    - Órdenes recientes
 *    - Estadísticas del dashboard
 *    cache: 'no-store'
 * 
 * 🔄 DATOS CON REVALIDACIÓN (ISR):
 *    - Lista de productos (revalidar cada 60s)
 *    - Categorías (revalidar cada 5 min)
 *    cache: { revalidate: 60 }
 * 
 * 📁 DATOS ESTÁTICOS:
 *    - Configuración del sitio
 *    - Contenido que no cambia
 *    cache: 'force-cache' + tags
 */
