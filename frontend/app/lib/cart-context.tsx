'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAuth } from './auth-context';

// Tipos
interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number | string;
  imagenes?: { url: string; esPrincipal: boolean }[];
  marca?: { nombre: string } | null;
}

interface ItemCarrito {
  id: string;
  cantidad: number;
  precioUnitario: number | string;
  producto: Producto;
}

interface Carrito {
  id: string;
  clienteId: string | null;
  estado: string;
  items: ItemCarrito[];
  total?: number;
}

interface PromoAplicada {
  codigo: string;
  descuento: number;
  esPorcentaje: boolean;
}

interface CartContextType {
  cart: Carrito | null;
  items: ItemCarrito[];
  loading: boolean;
  error: string | null;
  itemCount: number;
  subtotal: number;
  promoAplicada: PromoAplicada | null;
  descuentoPromo: number;
  addItem: (productoId: string, cantidad?: number) => Promise<void>;
  updateQuantity: (itemId: string, cantidad: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyPromo: (promo: PromoAplicada) => void;
  clearPromo: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Carrito | null>(null);
  const [promoAplicada, setPromoAplicada] = useState<PromoAplicada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const storedPromo = sessionStorage.getItem('sicabit_promo_aplicada');
    if (!storedPromo) return;

    try {
      const parsed = JSON.parse(storedPromo) as PromoAplicada;
      if (parsed?.codigo && typeof parsed.descuento === 'number') {
        setPromoAplicada(parsed);
      }
    } catch {
      sessionStorage.removeItem('sicabit_promo_aplicada');
    }
  }, []);

  const applyPromo = useCallback((promo: PromoAplicada) => {
    setPromoAplicada(promo);
    sessionStorage.setItem('sicabit_promo_aplicada', JSON.stringify(promo));
  }, []);

  const clearPromo = useCallback(() => {
    setPromoAplicada(null);
    sessionStorage.removeItem('sicabit_promo_aplicada');
  }, []);

  // Obtener carrito del usuario autenticado
  const getOrCreateCart = useCallback(async (): Promise<string | null> => {
    try {
      // Verificar si el usuario está autenticado usando el contexto
      if (!isAuthenticated || !user?.id) {
        return null;
      }

      // Usuario autenticado - obtener o crear su carrito
      const cartRes = await fetch(`/api/carritos/cliente/${user.id}`, {
        credentials: 'include'
      });
      
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        return cartData.id;
      }

      return null;
    } catch (err) {
      console.error('Error getting/creating cart:', err);
      return null;
    }
  }, [isAuthenticated, user?.id]);

  // Cargar carrito
  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const cartId = await getOrCreateCart();
      if (!cartId) {
        setCart(null);
        return;
      }

      const res = await fetch(`/api/carritos/${cartId}`);
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      } else {
        setCart(null);
      }
    } catch (err) {
      setError('Error al cargar el carrito');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getOrCreateCart]);

  // Cargar carrito al montar
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Agregar item
  const addItem = useCallback(async (productoId: string, cantidad: number = 1) => {
    setError(null);
    
    try {
      let cartId: string | null | undefined = cart?.id;
      
      if (!cartId) {
        cartId = await getOrCreateCart();
      }
      
      if (!cartId) {
        throw new Error('Debes iniciar sesión para agregar productos al carrito');
      }

      const res = await fetch(`/api/carritos/${cartId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productoId, cantidad })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al agregar producto');
      }

      await refreshCart();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    }
  }, [cart?.id, getOrCreateCart, refreshCart]);

  // Actualizar cantidad
  const updateQuantity = useCallback(async (itemId: string, cantidad: number) => {
    setError(null);
    
    try {
      const res = await fetch(`/api/carritos/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al actualizar cantidad');
      }

      await refreshCart();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    }
  }, [refreshCart]);

  // Eliminar item
  const removeItem = useCallback(async (itemId: string) => {
    setError(null);
    
    try {
      const res = await fetch(`/api/carritos/items/${itemId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al eliminar producto');
      }

      await refreshCart();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    }
  }, [refreshCart]);

  // Vaciar carrito
  const clearCart = useCallback(async () => {
    if (!cart?.id) return;
    
    setError(null);
    
    try {
      const res = await fetch(`/api/carritos/${cart.id}/clear`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al vaciar carrito');
      }

      await refreshCart();
      clearPromo();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    }
  }, [cart?.id, refreshCart, clearPromo]);

  // Calcular valores con useMemo para evitar recálculos (rerender-memo)
  const items = useMemo(() => cart?.items || [], [cart?.items]);
  
  const itemCount = useMemo(() => 
    items.reduce((sum, item) => sum + item.cantidad, 0),
    [items]
  );
  
  const subtotal = useMemo(() => 
    items.reduce((sum, item) => {
      const precio = typeof item.precioUnitario === 'string' 
        ? parseFloat(item.precioUnitario) 
        : item.precioUnitario;
      return sum + precio * item.cantidad;
    }, 0),
    [items]
  );

  const descuentoPromo = useMemo(() => {
    if (!promoAplicada) return 0;

    const descuentoBase = promoAplicada.esPorcentaje
      ? subtotal * (promoAplicada.descuento / 100)
      : promoAplicada.descuento;

    return Math.max(0, Math.min(descuentoBase, subtotal));
  }, [promoAplicada, subtotal]);

  useEffect(() => {
    if (!loading && promoAplicada && items.length === 0) {
      clearPromo();
    }
  }, [loading, promoAplicada, items.length, clearPromo]);

  // useMemo para el value del contexto - evita re-renders innecesarios (rerender-memo)
  const value = useMemo<CartContextType>(() => ({
    cart,
    items,
    loading,
    error,
    itemCount,
    subtotal,
    promoAplicada,
    descuentoPromo,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyPromo,
    clearPromo,
    refreshCart,
  }), [cart, items, loading, error, itemCount, subtotal, promoAplicada, descuentoPromo, addItem, updateQuantity, removeItem, clearCart, applyPromo, clearPromo, refreshCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
