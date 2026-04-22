import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, ShoppingCart, Laptop, Heart, Percent } from '@phosphor-icons/react/dist/ssr';
import { getFeaturedProductsCached } from '../lib/server-api';
import type { Producto } from '../lib/types';
import {
  getMainImage,
  getCategoryName,
  formatPrice,
  hasOffer,
  getDiscountPercent,
} from '../lib/product-utils';



export default async function FeaturedProducts() {
  const products = await getFeaturedProductsCached();

  // Early return si no hay productos (js-early-exit)
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-100 bg-accent/3 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="stagger">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 bg-accent/10 border border-accent/20 text-accent text-xs font-medium">
              <Star size={12} weight="fill" aria-hidden="true" />
              TOP VENTAS
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-content mb-2 tracking-tight">Productos Destacados</h2>
            <p className="text-content-muted">Lo más vendido de la semana</p>
          </div>
          <Link 
            href="/productos" 
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-surface-raised border border-line-med hover:border-accent text-content transition-all duration-300 hover:bg-accent/5 group"
          >
            Ver catálogo
            <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 stagger">
          {products.slice(0, 8).map((product) => (
            <Link 
              key={product.id} 
              href={`/productos/${product.slug}`}
              className="group bg-surface border border-line-soft overflow-hidden hover:border-accent/50 transition-all duration-300 hover-glow relative"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/0 to-transparent group-hover:via-accent/50 transition-all duration-500" />
              {/* Image */}
              <div className="relative aspect-square bg-linear-to-br from-surface-raised to-surface p-6">
                {hasOffer(product) ? (
                  <span className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md bg-red-500 text-white">
                    <Percent size={12} weight="bold" />
                    -{getDiscountPercent(product.precio, product.precioOferta!)}%
                  </span>
                ) : product.destacado ? (
                  <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-bold rounded-md bg-accent text-accent-contrast">
                    DESTACADO
                  </span>
                ) : null}
                
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="absolute top-4 right-4 px-2 py-1 bg-star text-black text-xs font-bold rounded-md">
                    ¡Últimas {product.stock}!
                  </span>
                )}

                {product.stock === 0 && (
                  <span className="absolute top-4 right-4 px-2 py-1 bg-danger text-white text-xs font-bold rounded-md">
                    AGOTADO
                  </span>
                )}

                {/* Product Image */}
                <div className="w-full h-full flex items-center justify-center">
                  {getMainImage(product) ? (
                    <Image
                      src={getMainImage(product)!}
                      alt={product.nombre}
                      width={180}
                      height={180}
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 180px"
                      className="object-contain max-h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-3/4 h-3/4 bg-surface-soft rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <Laptop size={64} weight="duotone" className="text-placeholder-icon" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Quick actions */}
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
                  <button aria-label="Añadir a favoritos" className="p-2.5 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors">
                    <Heart size={16} className="text-content" aria-hidden="true" />
                  </button>
                  <button aria-label="Añadir al carrito" className="p-2.5 bg-accent rounded-lg hover:bg-accent-hover transition-colors">
                    <ShoppingCart size={16} className="text-accent-contrast" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-accent font-medium">{getCategoryName(product)}</span>
                  {product.marca && (
                    <span className="text-xs text-content-muted">{product.marca.nombre}</span>
                  )}
                </div>
                
                <h3 className="font-semibold text-content text-sm md:text-base mb-1 line-clamp-1 group-hover:text-accent transition-colors">
                  {product.nombre}
                </h3>
                
                <p className="text-xs text-content-muted mb-3 line-clamp-1">
                  {product.descripcion.substring(0, 50)}…
                </p>
                
                <div className="flex items-center gap-2">
                  {hasOffer(product) ? (
                    <>
                      <span className="text-lg md:text-xl font-bold text-red-500 tabular-nums">${formatPrice(product.precioOferta!)}</span>
                      <span className="text-sm text-content-muted line-through tabular-nums">${formatPrice(product.precio)}</span>
                    </>
                  ) : (
                    <span className="text-lg md:text-xl font-bold text-content tabular-nums">${formatPrice(product.precio)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-10 md:hidden text-center">
          <Link 
            href="/productos" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-contrast font-bold transition-all duration-300 hover:scale-105 btn-sweep"
          >
            Ver todos los productos
            <ArrowRight size={20} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
