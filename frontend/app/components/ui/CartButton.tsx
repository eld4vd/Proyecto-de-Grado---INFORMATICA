'use client';

import Link from 'next/link';
import { ShoppingCart } from '@phosphor-icons/react';
import { useCart } from '../../lib/cart-context';

export function CartButton() {
  const { itemCount, loading } = useCart();

  return (
    <Link 
      href="/carrito" 
      aria-label={`Carrito de compras${itemCount > 0 ? `, ${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}` : ''}`}
      className="relative flex items-center gap-2 px-3 py-2 bg-surface-soft hover:bg-surface-hover border border-line-med hover:border-accent text-content text-sm transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <ShoppingCart size={16} className="text-content-secondary group-hover:text-accent transition-colors" aria-hidden="true" />
      <span className="hidden sm:inline">Carrito</span>
      {!loading && itemCount > 0 && (
        <span 
          className="size-5 absolute -top-1.5 -right-1.5 bg-accent text-accent-contrast text-[10px] font-bold flex items-center justify-center rounded-full"
          aria-hidden="true"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
