import Link from 'next/link';
import Image from 'next/image';
import { Star, Laptop, ArrowRight, Fire, CaretRight, Sparkle, Tag, Lightning, Percent } from '@phosphor-icons/react/dist/ssr';
import { getProductsServer } from '../lib/server-api';
import type { Producto } from '../lib/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ofertas | SicaBit',
  description: 'Las mejores ofertas en tecnología. Descuentos en laptops, componentes y accesorios en SicaBit Bolivia.',
};

function getMainImage(producto: Producto): string | null {
  if (producto.imagenes && producto.imagenes.length > 0) {
    const principal = producto.imagenes.find(img => img.esPrincipal);
    return principal?.url || producto.imagenes[0].url;
  }
  return null;
}

function getCategoryName(producto: Producto): string {
  if (producto.productoCategorias && producto.productoCategorias.length > 0) {
    return producto.productoCategorias[0].categoria.nombre;
  }
  return 'General';
}

function formatPrice(precio: number | string): string {
  const num = typeof precio === 'string' ? parseFloat(precio) : precio;
  return num.toLocaleString('es-BO', { minimumFractionDigits: 2 });
}

function getDiscountPercent(precio: number | string, precioOferta: number | string): number {
  const original = typeof precio === 'string' ? parseFloat(precio) : precio;
  const oferta = typeof precioOferta === 'string' ? parseFloat(precioOferta) : precioOferta;
  if (original <= 0) return 0;
  return Math.round((1 - oferta / original) * 100);
}

export default async function OfertasPage() {
  const { data: productos } = await getProductsServer({ enOferta: true, activo: true, take: 50 });

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-card border-b border-line">
        <div className="absolute inset-0 bg-linear-to-br from-red-500/5 via-transparent to-accent/3 pointer-events-none" />

        <div className="container-custom py-10 md:py-14 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full mb-5">
              <Fire size={16} weight="fill" className="text-red-500" />
              <span className="text-sm font-semibold text-red-500">Ofertas activas</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-content tracking-tight mb-4">
              Ofertas y Descuentos
            </h1>
            <p className="text-content-secondary text-base md:text-lg mb-6 max-w-lg">
              Productos seleccionados con precios reducidos. 
              Aprovecha las ofertas antes de que se acaben.
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-content-muted">
              <span className="flex items-center gap-2">
                <Percent size={16} weight="bold" className="text-red-500" />
                Descuentos reales
              </span>
              <span className="flex items-center gap-2">
                <Lightning size={16} weight="fill" className="text-accent" />
                Envío rápido
              </span>
              <span className="flex items-center gap-2">
                <Tag size={16} weight="duotone" className="text-accent" />
                Stock limitado
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <section className="border-b border-line bg-surface">
        <div className="container-custom py-3">
          <div className="flex items-center gap-2 text-sm text-content-muted">
            <Link href="/" className="hover:text-content transition-colors">Inicio</Link>
            <CaretRight size={14} />
            <span className="text-red-500 font-medium">Ofertas</span>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="container-custom py-8 md:py-12">
        {productos.length === 0 ? (
          <div className="text-center py-20">
            <Sparkle size={48} weight="duotone" className="text-content-muted mx-auto mb-4" />
            <h2 className="text-xl font-bold text-content mb-2">Próximamente</h2>
            <p className="text-content-muted mb-6">Estamos preparando ofertas increíbles para ti.</p>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-contrast font-medium rounded-lg hover:brightness-110 transition"
            >
              Ver todos los productos
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-content-muted">
                {productos.length} {productos.length === 1 ? 'oferta disponible' : 'ofertas disponibles'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {productos.map((producto) => {
                const imagen = getMainImage(producto);
                const categoria = getCategoryName(producto);
                const precioOriginal = typeof producto.precio === 'string' ? parseFloat(producto.precio) : producto.precio;
                const precioOferta = producto.precioOferta != null
                  ? (typeof producto.precioOferta === 'string' ? parseFloat(producto.precioOferta) : producto.precioOferta)
                  : null;
                const discount = precioOferta != null ? getDiscountPercent(precioOriginal, precioOferta) : 0;

                return (
                  <Link
                    key={producto.id}
                    href={`/productos/${producto.slug}`}
                    className="group"
                  >
                    <div className="bg-surface-card border border-line-soft rounded-2xl overflow-hidden hover:border-red-500/30 hover:shadow-lg transition-[border-color,box-shadow] duration-300">
                      {/* Image */}
                      <div className="relative aspect-square bg-linear-to-br from-surface-raised to-surface overflow-hidden">
                        {/* Discount badge */}
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                            <Percent size={12} />
                            -{discount}%
                          </span>
                        </div>

                        {producto.stock <= 5 && producto.stock > 0 && (
                          <div className="absolute top-2.5 right-2.5 z-10">
                            <span className="inline-flex items-center px-2 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-md">
                              ¡Últimas {producto.stock}!
                            </span>
                          </div>
                        )}

                        {imagen ? (
                          <Image
                            src={imagen}
                            alt={producto.nombre}
                            fill
                            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Laptop size={64} className="text-content-muted/30" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3.5 md:p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-medium text-accent uppercase tracking-wide">
                            {categoria}
                          </span>
                          {producto.marca && (
                            <span className="text-[11px] text-content-muted">
                              {producto.marca.nombre}
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-content text-sm leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                          {producto.nombre}
                        </h3>

                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-lg font-bold text-red-500 tabular-nums">
                            ${formatPrice(precioOferta!)}
                          </span>
                          <span className="text-sm text-content-muted line-through tabular-nums">
                            ${formatPrice(precioOriginal)}
                          </span>
                        </div>

                        {producto.stock > 0 ? (
                          <p className="text-[11px] text-green-500 mt-1.5 font-medium">En stock</p>
                        ) : (
                          <p className="text-[11px] text-content-muted mt-1.5">Agotado</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 px-6 py-3 border border-accent text-accent font-medium rounded-lg hover:bg-accent hover:text-accent-contrast transition-colors"
              >
                Ver todos los productos
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
