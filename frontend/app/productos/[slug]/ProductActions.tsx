'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Heart, ShareNetwork, CircleNotch, Check, X, User, SignIn, Sparkle } from '@phosphor-icons/react';
import { useCart } from '../../lib/cart-context';
import { useFavoritos } from '../../lib/favoritos-context';
import { useAuth } from '../../lib/auth-context';

interface ProductActionsProps {
  productId: string;
  productName: string;
  stock: number;
}

export function ProductActions({ productId, productName, stock }: ProductActionsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isFavorito, toggleFavorito } = useFavoritos();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'cart' | 'buy' | 'wishlist' | null>(null);

  // useCallback para handleQuantityChange - rerender-functional-setstate
  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity(prev => {
      const newVal = prev + delta;
      if (newVal < 1) return 1;
      if (newVal > stock) return stock;
      return newVal;
    });
  }, [stock]);

  // useCallback + useTransition para handleAddToCart - rendering-usetransition-loading
  const handleAddToCart = useCallback(async () => {
    if (isAuthLoading) return;

    // Early return - js-early-exit
    if (!isAuthenticated) {
      setPendingAction('cart');
      setShowLoginModal(true);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await addItem(productId, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al agregar al carrito';
        setError(message);
      }
    });
  }, [isAuthLoading, isAuthenticated, addItem, productId, quantity]);

  // useCallback + useTransition para handleBuyNow
  const handleBuyNow = useCallback(async () => {
    if (isAuthLoading) return;

    // Early return
    if (!isAuthenticated) {
      setPendingAction('buy');
      setShowLoginModal(true);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await addItem(productId, quantity);
        router.push('/carrito');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al agregar al carrito';
        setError(message);
      }
    });
  }, [isAuthLoading, isAuthenticated, addItem, productId, quantity, router]);

  // useCallback para handleShare
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  }, [productName]);

  // useCallback para handleWishlist
  const handleWishlist = useCallback(async () => {
    if (isAuthLoading) return;

    // Early return
    if (!isAuthenticated) {
      setPendingAction('wishlist');
      setShowLoginModal(true);
      return;
    }

    try {
      await toggleFavorito(productId);
    } catch (err) {
      console.error('Error al actualizar favorito:', err);
    }
  }, [isAuthLoading, isAuthenticated, toggleFavorito, productId]);

  // useCallback para redirects
  const handleLoginRedirect = useCallback(() => {
    const currentUrl = window.location.pathname;
    router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
  }, [router]);

  const handleRegisterRedirect = useCallback(() => {
    const currentUrl = window.location.pathname;
    router.push(`/registro?redirect=${encodeURIComponent(currentUrl)}`);
  }, [router]);

  // Contenido dinámico del modal según la acción
  const getModalContent = () => {
    switch (pendingAction) {
      case 'wishlist':
        return {
          icon: <Heart size={32} className="text-danger" />,
          iconBg: 'bg-danger/10',
          title: '¡Guarda tus favoritos!',
          description: 'Inicia sesión para guardar este producto en tu lista de favoritos y acceder a ella desde cualquier dispositivo.',
          benefits: [
            'Guarda productos que te interesan',
            'Recibe notificaciones de ofertas en tus favoritos',
            'Comparte tu wishlist con amigos y familia'
          ]
        };
      case 'buy':
        return {
          icon: <ShoppingCart size={32} className="text-accent" />,
          iconBg: 'bg-accent/10',
          title: '¡Inicia sesión para comprar!',
          description: 'Para realizar tu compra de forma rápida y segura necesitas una cuenta.',
          benefits: [
            'Compra en segundos con un solo clic',
            'Guarda tus direcciones de envío',
            'Seguimiento de pedidos en tiempo real'
          ]
        };
      default: // 'cart'
        return {
          icon: <ShoppingCart size={32} className="text-accent" />,
          iconBg: 'bg-accent/10',
          title: '¡Inicia sesión para continuar!',
          description: 'Para agregar productos al carrito necesitas una cuenta. Es rápido y obtendrás beneficios exclusivos.',
          benefits: [
            'Guarda tu carrito y accede desde cualquier dispositivo',
            'Seguimiento de pedidos en tiempo real',
            'Ofertas y descuentos exclusivos'
          ]
        };
    }
  };

  const modalContent = getModalContent();

  return (
    <>
      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-surface-card border border-line-med rounded-sm p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-accent via-accent/50 to-transparent" />
            {/* Close button */}
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-content-muted hover:text-content transition-colors"
            >
              <X size={20} />
            </button>

            {/* Icon */}
            <div className={`size-16 ${modalContent.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {modalContent.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-content text-center mb-2">
              {modalContent.title}
            </h3>

            {/* Description */}
            <p className="text-content-secondary text-center mb-8">
              {modalContent.description}
            </p>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              {modalContent.benefits.map((benefit, index) => (
                <div key={benefit} className="flex items-center gap-3 text-sm text-content-bright">
                  <div className="size-5 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                    {index === modalContent.benefits.length - 1 ? (
                      <Sparkle size={12} className="text-accent" />
                    ) : (
                      <Check size={12} className="text-accent" />
                    )}
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLoginRedirect}
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-accent-contrast font-semibold rounded-sm hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all duration-300 relative overflow-hidden group"
              >
                {/* Sweep effect */}
                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <SignIn size={20} className="relative z-10" />
                <span className="relative z-10">Iniciar sesión</span>
              </button>
              
              <button
                onClick={handleRegisterRedirect}
                className="w-full flex items-center justify-center gap-2 py-3 border border-accent text-accent font-semibold rounded-sm hover:bg-accent hover:text-accent-contrast transition-colors duration-300"
              >
                <User size={20} />
                Crear cuenta gratis
              </button>
            </div>

            {/* Footer text */}
            <p className="text-xs text-content-muted text-center mt-6">
              ¿Tienes dudas? <Link href="/soporte/contacto-directo" className="text-accent hover:underline">Contáctanos</Link>
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded-sm text-danger text-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-danger" />
          <span className="ml-2">{error}</span>
        </div>
      )}

      {/* Quantity & Add to cart */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Quantity selector */}
        <div className="flex items-center border border-line-med rounded-sm overflow-hidden hover:border-accent/30 transition-colors">
          <button 
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1 || isPending}
            className="p-3 text-content-secondary hover:text-accent hover:bg-surface-soft transition-colors disabled:opacity-50"
          >
            <Minus size={16} />
          </button>
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= stock) {
                setQuantity(val);
              }
            }}
            min={1}
            max={stock}
            className="w-14 text-center font-medium bg-transparent text-content border-x border-line-med py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
          />
          <button 
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= stock || isPending}
            className="p-3 text-content-secondary hover:text-accent hover:bg-surface-soft transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Add to cart */}
        <button 
          onClick={handleAddToCart}
          disabled={stock === 0 || isPending || isAuthLoading}
          className={`flex-1 flex items-center justify-center gap-2 px-8 py-3 font-semibold transition-all duration-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group ${
            added 
              ? 'bg-accent-hover text-accent-contrast' 
              : 'bg-accent text-accent-contrast hover:bg-accent-hover hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]'
          }`}
        >
          {/* Sweep effect */}
          <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          {isPending ? (
            <CircleNotch size={20} className="animate-spin relative z-10" />
          ) : added ? (
            <>
              <Check size={20} className="relative z-10" />
              <span className="relative z-10">¡Agregado!</span>
            </>
          ) : (
            <>
              <ShoppingCart size={20} className="relative z-10" />
              <span className="relative z-10">Agregar al carrito</span>
            </>
          )}
        </button>

        {/* Wishlist */}
        <button 
          onClick={handleWishlist}
          className={`p-3 border transition-colors duration-300 rounded-sm ${
            isFavorito(productId)
              ? 'bg-danger border-danger text-content shadow-[0_0_15px_rgba(255,60,60,0.3)]'
              : 'border-line-med text-content-secondary hover:text-danger hover:border-danger hover:shadow-[0_0_15px_rgba(255,60,60,0.3)]'
          }`}
          aria-label={isFavorito(productId) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart className={`size-5 ${isFavorito(productId) ? 'fill-white' : ''}`} />
        </button>

        {/* Share */}
        <button 
          onClick={handleShare}
          className="p-3 border border-line-med text-content-secondary hover:text-accent hover:border-accent hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all duration-300 rounded-sm"
        >
          <ShareNetwork size={20} />
        </button>
      </div>

      {/* Buy now */}
      <button 
        onClick={handleBuyNow}
        disabled={stock === 0 || isPending || isAuthLoading}
        className="w-full py-3 border border-accent text-accent font-semibold hover:bg-accent hover:text-accent-contrast hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all duration-300 mb-8 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Procesando...' : 'Comprar ahora'}
      </button>
    </>
  );
}
