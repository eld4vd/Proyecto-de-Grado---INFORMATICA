'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAuth } from './auth-context';

// Tipos
interface ProductoFavorito {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  stock: number;
  activo: boolean;
  imagenes?: { url: string; esPrincipal: boolean }[];
  marca?: { nombre: string } | null;
}

interface Favorito {
  id: string;
  productoId: string;
  createdAt: string;
  producto?: ProductoFavorito;
}

interface FavoritosContextType {
  favoritos: Favorito[];
  favoritoIds: Set<string>;
  loading: boolean;
  error: string | null;
  count: number;
  isFavorito: (productoId: string) => boolean;
  toggleFavorito: (productoId: string) => Promise<boolean>;
  addFavorito: (productoId: string) => Promise<void>;
  removeFavorito: (productoId: string) => Promise<void>;
  clearFavoritos: () => Promise<void>;
  refreshFavoritos: () => Promise<void>;
}

const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [favoritoIds, setFavoritoIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Cargar favoritos
  const refreshFavoritos = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoritos([]);
      setFavoritoIds(new Set());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/favoritos', {
        credentials: 'include',
      });

      if (res.ok) {
        const data: Favorito[] = await res.json();
        setFavoritos(data);
        setFavoritoIds(new Set(data.map((f) => f.productoId)));
      } else if (res.status === 401) {
        // No autenticado - limpiar favoritos
        setFavoritos([]);
        setFavoritoIds(new Set());
      } else {
        throw new Error('Error al cargar favoritos');
      }
    } catch (err) {
      setError('Error al cargar favoritos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Cargar solo IDs (más ligero para verificaciones)
  const loadFavoritoIds = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoritoIds(new Set());
      return;
    }

    try {
      const res = await fetch('/api/favoritos/ids', {
        credentials: 'include',
      });

      if (res.ok) {
        const ids: string[] = await res.json();
        setFavoritoIds(new Set(ids));
      }
    } catch (err) {
      console.error('Error al cargar IDs de favoritos:', err);
    }
  }, [isAuthenticated]);

  // Cargar favoritos al autenticarse
  useEffect(() => {
    if (isAuthenticated) {
      loadFavoritoIds();
    } else {
      setFavoritos([]);
      setFavoritoIds(new Set());
    }
  }, [isAuthenticated, loadFavoritoIds]);

  // Verificar si un producto es favorito
  const isFavorito = useCallback(
    (productoId: string): boolean => {
      return favoritoIds.has(productoId);
    },
    [favoritoIds]
  );

  // Toggle favorito (agregar/quitar)
  const toggleFavorito = useCallback(
    async (productoId: string): Promise<boolean> => {
      if (!isAuthenticated) {
        throw new Error('Debes iniciar sesión para guardar favoritos');
      }

      setError(null);

      try {
        const res = await fetch(`/api/favoritos/toggle/${productoId}`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Error al actualizar favorito');
        }

        const data = await res.json();
        const newIsFavorito = data.isFavorito;

        // Actualizar estado local
        setFavoritoIds((prev) => {
          const newSet = new Set(prev);
          if (newIsFavorito) {
            newSet.add(productoId);
          } else {
            newSet.delete(productoId);
          }
          return newSet;
        });

        // Actualizar lista de favoritos si está cargada
        if (favoritos.length > 0) {
          if (newIsFavorito) {
            // Recargar para obtener datos completos del producto
            await refreshFavoritos();
          } else {
            setFavoritos((prev) => prev.filter((f) => f.productoId !== productoId));
          }
        }

        return newIsFavorito;
      } catch (err) {
        setError('Error al actualizar favorito');
        console.error(err);
        throw err;
      }
    },
    [isAuthenticated, favoritos.length, refreshFavoritos]
  );

  // Agregar a favoritos
  const addFavorito = useCallback(
    async (productoId: string) => {
      if (!isAuthenticated) {
        throw new Error('Debes iniciar sesión para guardar favoritos');
      }

      if (favoritoIds.has(productoId)) {
        return; // Ya es favorito
      }

      setError(null);

      try {
        const res = await fetch('/api/favoritos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productoId }),
        });

        if (!res.ok) {
          throw new Error('Error al agregar a favoritos');
        }

        // Actualizar estado local
        setFavoritoIds((prev) => new Set([...prev, productoId]));

        // Recargar lista completa si está visible
        if (favoritos.length > 0) {
          await refreshFavoritos();
        }
      } catch (err) {
        setError('Error al agregar a favoritos');
        console.error(err);
        throw err;
      }
    },
    [isAuthenticated, favoritoIds, favoritos.length, refreshFavoritos]
  );

  // Eliminar de favoritos
  const removeFavorito = useCallback(
    async (productoId: string) => {
      if (!isAuthenticated) {
        return;
      }

      setError(null);

      try {
        const res = await fetch(`/api/favoritos/${productoId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!res.ok) {
          throw new Error('Error al eliminar de favoritos');
        }

        // Actualizar estado local
        setFavoritoIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productoId);
          return newSet;
        });

        setFavoritos((prev) => prev.filter((f) => f.productoId !== productoId));
      } catch (err) {
        setError('Error al eliminar de favoritos');
        console.error(err);
        throw err;
      }
    },
    [isAuthenticated]
  );

  // Limpiar todos los favoritos
  const clearFavoritos = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setError(null);

    try {
      const res = await fetch('/api/favoritos', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Error al limpiar favoritos');
      }

      setFavoritos([]);
      setFavoritoIds(new Set());
    } catch (err) {
      setError('Error al limpiar favoritos');
      console.error(err);
      throw err;
    }
  }, [isAuthenticated]);

  // useMemo para el value del contexto - evita re-renders innecesarios (rerender-memo)
  const value = useMemo<FavoritosContextType>(() => ({
    favoritos,
    favoritoIds,
    loading,
    error,
    count: favoritoIds.size,
    isFavorito,
    toggleFavorito,
    addFavorito,
    removeFavorito,
    clearFavoritos,
    refreshFavoritos,
  }), [favoritos, favoritoIds, loading, error, isFavorito, toggleFavorito, addFavorito, removeFavorito, clearFavoritos, refreshFavoritos]);

  return (
    <FavoritosContext.Provider value={value}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (context === undefined) {
    throw new Error('useFavoritos must be used within a FavoritosProvider');
  }
  return context;
}
