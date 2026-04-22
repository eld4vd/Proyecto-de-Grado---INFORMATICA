'use client';

import { useState, useTransition, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X, Bag, ArrowLeft, ArrowRight, Lock, Truck, Tag, CaretRight, Laptop, CircleNotch, Trash, Check } from '@phosphor-icons/react';
import { useCart } from '../lib/cart-context';

export default function CarritoPage() {
  const {
    items,
    loading,
    error,
    subtotal,
    descuentoPromo,
    promoAplicada,
    updateQuantity,
    removeItem,
    clearCart,
    applyPromo,
    clearPromo,
  } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (promoAplicada?.codigo) {
      setPromoCode(promoAplicada.codigo);
      setPromoError(null);
    }
  }, [promoAplicada?.codigo]);

  // Handler optimizado con useTransition (rendering-usetransition-loading)
  const handleUpdateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return; // Early return (js-early-exit)
    setUpdatingId(itemId);
    startTransition(async () => {
      try {
        await updateQuantity(itemId, newQuantity);
      } catch (err) {
        console.error(err);
      } finally {
        setUpdatingId(null);
      }
    });
  }, [updateQuantity]);

  const handleRemoveItem = useCallback(async (itemId: string) => {
    setUpdatingId(itemId);
    startTransition(async () => {
      try {
        await removeItem(itemId);
      } catch (err) {
        console.error(err);
      } finally {
        setUpdatingId(null);
      }
    });
  }, [removeItem]);

  const handleClearCart = useCallback(async () => {
    if (!confirm('¿Estás seguro de vaciar el carrito?')) return;
    startTransition(async () => {
      try {
        await clearCart();
      } catch (err) {
        console.error(err);
      }
    });
  }, [clearCart]);

  const shipping = subtotal >= 500 ? 0 : 15;
  const discount = descuentoPromo;
  const total = subtotal + shipping - discount;

  const handlePromoCode = async () => {
    const codigo = promoCode.trim().toUpperCase();
    if (!codigo) return;

    setPromoError(null);
    setPromoLoading(true);

    try {
      const res = await fetch('/api/codigos-promocionales/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ codigo, subtotal }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || 'No se pudo validar el código');
      }

      const data = await res.json();
      applyPromo({
        codigo: data.codigo,
        descuento: Number(data.descuento),
        esPorcentaje: Boolean(data.esPorcentaje),
      });
      setPromoCode(data.codigo);
    } catch (err: unknown) {
      setPromoError(
        err instanceof Error ? err.message : 'Código promocional inválido',
      );
      clearPromo();
    } finally {
      setPromoLoading(false);
    }
  };

  // Helper para obtener imagen del producto
  const getProductImage = (producto: any) => {
    if (producto?.imagenes && producto.imagenes.length > 0) {
      const principal = producto.imagenes.find((img: any) => img.esPrincipal);
      return principal?.url || producto.imagenes[0].url;
    }
    return null;
  };

  // Helper para formatear precio
  const formatPrice = (precio: number | string) => {
    const num = typeof precio === 'string' ? parseFloat(precio) : precio;
    return num.toLocaleString('es-BO', { minimumFractionDigits: 2 });
  };

  // Estado de carga inicial - Skeleton simple centrado para evitar CLS
  // (rendering-content-visibility + async-suspense-boundaries best practices)
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-deep">
        {/* Header skeleton - mismas dimensiones que el header real */}
        <section className="py-8 bg-surface-deep border-b border-line-soft">
          <div className="container-custom">
            <div className="flex items-center gap-2 text-sm text-content-muted mb-4">
              <div className="h-4 w-12 bg-surface-soft animate-pulse rounded" />
              <CaretRight size={16} className="text-content-faint" />
              <div className="h-4 w-16 bg-surface-soft animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="size-10 bg-surface-soft animate-pulse" />
              <div>
                <div className="h-8 w-24 bg-surface-soft animate-pulse rounded mb-1" />
                <div className="h-4 w-20 bg-surface-soft animate-pulse rounded" />
              </div>
            </div>
          </div>
        </section>

        {/* Content skeleton centrado - igual que carrito vacío */}
        <div 
          className="container-custom py-16 flex items-center justify-center" 
          style={{ minHeight: 'calc(100vh - 200px)' }}
        >
          <div className="text-center">
            <div className="size-24 bg-surface-soft animate-pulse mx-auto mb-6" />
            <div className="h-8 w-48 bg-surface-soft animate-pulse rounded mx-auto mb-2" />
            <div className="h-4 w-32 bg-surface-soft animate-pulse rounded mx-auto mb-6" />
            <div className="h-12 w-40 bg-surface-soft animate-pulse rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Carrito vacío - Mantener estructura consistente para evitar CLS
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-deep relative">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-150 bg-accent/3 rounded-full blur-[150px]" />
        </div>
        
        {/* Header consistente con el carrito lleno */}
        <section className="py-8 bg-surface-deep border-b border-line-soft">
          <div className="container-custom">
            <div className="flex items-center gap-2 text-sm text-content-muted mb-4">
              <Link href="/" className="hover:text-accent transition-colors">Inicio</Link>
              <CaretRight size={16} />
              <span className="text-accent">Carrito</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-10 bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Bag size={20} className="text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-content">Carrito</h1>
                <p className="text-sm text-content-muted">0 productos</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contenido vacío centrado */}
        <div className="container-custom py-16 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
          <div className="text-center relative z-10">
            <div className="size-24 bg-surface border border-line flex items-center justify-center mx-auto mb-6 relative group">
              <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Bag size={48} className="text-content-faint" />
            </div>
            <h2 className="text-2xl font-bold text-content mb-2">Tu carrito está vacío</h2>
            <p className="text-content-muted mb-6">
              Agrega productos para comenzar
            </p>
            <Link 
              href="/productos" 
              className="group inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:shadow-[0_0_25px_rgba(57,255,20,0.3)] transition-all relative overflow-hidden"
            >
              <span className="relative z-10">Explorar productos</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-0.5 transition-transform" />
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-deep relative">
      {/* Subtle background elements */}
      <div className="absolute top-0 right-0 size-125 bg-accent/3 rounded-full blur-[200px] pointer-events-none" />
      
      {/* Header */}
      <section className="bg-surface border-b border-line-soft relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/20 to-transparent" />
        <div className="container-custom py-6">
          <div className="flex items-center gap-2 text-sm text-content-muted mb-4">
            <Link href="/" className="hover:text-accent transition-colors">Inicio</Link>
            <CaretRight size={16} />
            <span className="text-accent">Carrito</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-accent/10 border border-accent/30 flex items-center justify-center">
                <Bag size={20} className="text-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-content">
                  Carrito
                </h1>
                <p className="text-sm text-content-muted">{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
              </div>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                aria-label="Vaciar carrito"
                className="flex items-center gap-2 text-sm text-content-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger transition-colors group"
              >
                <Trash size={16} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                Vaciar carrito
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div className="container-custom py-4">
          <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm">
            {error}
          </div>
        </div>
      )}

      <div className="container-custom py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const precio = typeof item.precioUnitario === 'string' 
                ? parseFloat(item.precioUnitario) 
                : item.precioUnitario;
              const imageUrl = getProductImage(item.producto);
              const isUpdating = updatingId === item.id || isPending;

              return (
                <div 
                  key={item.id} 
                  className={`group bg-surface border border-line-soft p-4 transition-all duration-300 hover:border-line-med relative overflow-hidden ${isUpdating ? 'opacity-50' : ''}`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    minHeight: '140px', // Reservar altura para evitar CLS
                    contentVisibility: 'auto', // Optimización de rendering
                    containIntrinsicSize: '0 140px' // Tamaño intrínseco para content-visibility
                  }}
                >
                  {/* Hover accent */}
                  <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="size-24 bg-surface-card flex items-center justify-center shrink-0 overflow-hidden border border-line-soft">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.producto.nombre}
                          width={96}
                          height={96}
                          className="object-contain"
                        />
                      ) : (
                        <Laptop size={40} className="text-placeholder-icon" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link 
                            href={`/productos/${item.producto.id}`}
                            className="font-semibold text-content hover:text-accent transition-colors line-clamp-1"
                          >
                            {item.producto.nombre}
                          </Link>
                          <p className="text-sm text-content-muted line-clamp-1">
                            {item.producto.descripcion.substring(0, 50)}...
                          </p>
                          {item.producto.marca && (
                            <p className="text-xs text-accent mt-1">{item.producto.marca.nombre}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isUpdating}
                          className="p-2 text-content-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger transition-colors disabled:opacity-50"
                          aria-label="Eliminar producto"
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-line-med rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                            disabled={isUpdating || item.cantidad <= 1}
                            aria-label="Reducir cantidad"
                            className="size-9 flex items-center justify-center text-content-secondary hover:text-content hover:bg-surface-soft focus-visible:outline-none focus-visible:bg-surface-soft focus-visible:text-accent transition-colors disabled:opacity-50"
                          >
                            <Minus size={16} aria-hidden="true" />
                          </button>
                          <span className="w-10 text-center text-content text-sm" aria-label={`Cantidad: ${item.cantidad}`}>
                            {isUpdating ? (
                              <CircleNotch size={16} className="animate-spin mx-auto" aria-hidden="true" />
                            ) : (
                              item.cantidad
                            )}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                            disabled={isUpdating}
                            aria-label="Aumentar cantidad"
                            className="size-9 flex items-center justify-center text-content-secondary hover:text-content hover:bg-surface-soft focus-visible:outline-none focus-visible:bg-surface-soft focus-visible:text-accent transition-colors disabled:opacity-50"
                          >
                            <Plus size={16} aria-hidden="true" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="font-bold text-content tabular-nums">${formatPrice(precio * item.cantidad)}</span>
                          {item.cantidad > 1 && (
                            <p className="text-xs text-content-muted tabular-nums">${formatPrice(precio)} c/u</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Continue shopping */}
            <Link 
              href="/productos" 
              className="group inline-flex items-center gap-2 text-sm text-content-muted hover:text-accent transition-colors mt-4"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Seguir comprando
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-line-soft p-6 sticky top-32 overflow-hidden">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-px bg-accent" />
              <div className="absolute top-0 left-0 h-8 w-px bg-accent" />
              <div className="absolute bottom-0 right-0 w-8 h-px bg-accent" />
              <div className="absolute bottom-0 right-0 h-8 w-px bg-accent" />
              
              <h2 className="font-bold text-content text-lg mb-6">Resumen del pedido</h2>

              {/* Promo code */}
              <div className="mb-6">
                <label className="block text-sm text-content-secondary mb-2">Código promocional</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="DESC10"
                    disabled={Boolean(promoAplicada)}
                    className="flex-1 h-10 px-3 bg-surface-card border border-line-med text-content text-sm placeholder:text-content-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent disabled:opacity-50 transition-colors"
                  />
                  <button
                    onClick={handlePromoCode}
                    disabled={Boolean(promoAplicada) || !promoCode || promoLoading}
                    className="px-4 h-10 bg-surface-soft text-content text-sm font-medium hover:bg-surface-hover hover:text-accent transition-colors disabled:opacity-50"
                  >
                    {promoLoading ? (
                      <CircleNotch size={16} className="animate-spin" />
                    ) : (
                      <Tag size={16} />
                    )}
                  </button>
                </div>
                {promoAplicada && (
                  <p className="text-xs text-accent mt-2 flex items-center gap-1">
                    <Check size={12} />
                    Código aplicado: {promoAplicada.codigo}
                  </p>
                )}
                {promoAplicada && (
                  <button
                    onClick={clearPromo}
                    className="text-xs text-content-muted hover:text-danger mt-2"
                  >
                    Quitar código
                  </button>
                )}
                {promoError && (
                  <p className="text-xs text-danger mt-2">{promoError}</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-content-secondary">
                  <span>Subtotal ({items.length} productos)</span>
                  <span className="text-content tabular-nums">${formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-content-secondary">
                  <span>Envío</span>
                  <span className={`tabular-nums ${shipping === 0 ? 'text-accent' : 'text-content'}`}>
                    {shipping === 0 ? 'Gratis' : `$${formatPrice(shipping)}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-accent">
                    <span>
                      Descuento {promoAplicada?.esPorcentaje ? `(${promoAplicada.descuento}%)` : '(código)'}
                    </span>
                    <span className="tabular-nums">-${formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t border-line-med pt-3 flex justify-between font-bold text-lg text-content">
                  <span>Total</span>
                  <span className="text-accent tabular-nums">${formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout button */}
              <Link 
                href="/checkout"
                className="group w-full py-3.5 bg-accent text-accent-contrast font-semibold hover:shadow-[0_0_25px_rgba(57,255,20,0.3)] transition-all flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <Lock size={16} className="relative z-10" />
                <span className="relative z-10">Proceder al pago</span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              </Link>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-line-med space-y-3">
                <div className="flex items-center gap-3 text-sm text-content-muted">
                  <div className="size-6 bg-accent/10 flex items-center justify-center">
                    <Truck size={14} className="text-accent" />
                  </div>
                  <span>Envío gratis en compras +$500</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-content-muted">
                  <div className="size-6 bg-accent/10 flex items-center justify-center">
                    <Lock size={14} className="text-accent" />
                  </div>
                  <span>Pago seguro garantizado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
