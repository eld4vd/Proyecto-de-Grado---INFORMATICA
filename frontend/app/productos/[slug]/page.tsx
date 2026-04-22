import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Truck, ShieldCheck, ArrowCounterClockwise, CaretRight, Laptop } from '@phosphor-icons/react/dist/ssr';
import { getProduct, getProducts, getFeaturedProducts } from '../../lib/api';
import type { Producto } from '../../lib/types';
import { ProductActions } from './ProductActions';
import { ProductGallery } from './ProductGallery';
import { ProductReviews } from './ProductReviews';
import {
  getMainImage,
  getCategoryName,
  getCategorySlug,
  formatPrice,
  hasOffer,
  getDiscountPercent,
} from '../../lib/product-utils';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Pre-renderiza las páginas de productos conocidos en build time.
 * Productos nuevos se renderizan on-demand y se cachean (ISR).
 */
export async function generateStaticParams() {
  try {
    const { data: products } = await getProducts({ activo: true, take: 100 });
    return products.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  if (!product) {
    return {
      title: 'Producto no encontrado | SicaBit',
    };
  }

  return {
    title: `${product.nombre} | SicaBit`,
    description: product.descripcion,
    openGraph: {
      title: product.nombre,
      description: product.descripcion,
      images: product.imagenes?.[0]?.url ? [product.imagenes[0].url] : [],
    },
  };
}



export default async function ProductoPage({ params }: ProductPageProps) {
  const { slug } = await params;
  // async-parallel: Ejecutar ambos fetches en paralelo (Promise.all)
  const [product, relatedResponse] = await Promise.all([
    getProduct(slug),
    getFeaturedProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const relatedProducts = relatedResponse
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  const categoryName = getCategoryName(product);
  const categorySlug = getCategorySlug(product);
  const mainImage = getMainImage(product);

  return (
    <div className="min-h-screen bg-surface-deep relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 size-150 bg-accent/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 size-100 bg-accent/2 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Breadcrumb */}
      <div className="bg-surface/80 backdrop-blur-sm border-b border-line-soft relative z-10">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-content-muted hover:text-content transition-colors">
              Inicio
            </Link>
            <CaretRight size={16} weight="bold" className="text-content-faint" />
            <Link href="/productos" className="text-content-muted hover:text-content transition-colors">
              Productos
            </Link>
            <CaretRight size={16} weight="bold" className="text-content-faint" />
            {categorySlug ? (
              <Link 
                href={`/productos?categoria=${categorySlug}`} 
                className="text-content-muted hover:text-content transition-colors"
              >
                {categoryName}
              </Link>
            ) : (
              <span className="text-content-muted">
                {categoryName}
              </span>
            )}
            <CaretRight size={16} weight="bold" className="text-content-faint" />
            <span className="text-accent font-medium truncate max-w-50">{product.nombre}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Main product section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product images */}
          <ProductGallery 
            imagenes={product.imagenes || []}
            productName={product.nombre}
            destacado={product.destacado}
            stock={product.stock}
          />

          {/* Product info */}
          <div>
            {/* Brand & category */}
            <div className="flex items-center gap-3 mb-2">
              {product.marca && (
                <>
                  <span className="text-sm font-medium text-accent">{product.marca.nombre}</span>
                  <span className="text-content-faint">•</span>
                </>
              )}
              <span className="text-sm text-content-muted">{categoryName}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-content mb-4">
              {product.nombre}
            </h1>

            {/* SKU */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-content-faint">SKU: {product.sku || product.id.slice(0, 8)}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              {hasOffer(product) ? (
                <>
                  <span className="text-3xl font-bold text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] tabular-nums">${formatPrice(product.precioOferta!)}</span>
                  <span className="text-xl text-content-muted line-through tabular-nums">${formatPrice(product.precio)}</span>
                  <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-sm font-bold rounded">
                    -{getDiscountPercent(product.precio, product.precioOferta!)}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-accent drop-shadow-[0_0_10px_rgba(57,255,20,0.3)] tabular-nums">${formatPrice(product.precio)}</span>
              )}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`size-2 rounded-full ${
                product.stock > 10 ? 'bg-accent' : product.stock > 0 ? 'bg-star' : 'bg-danger'
              }`} />
              <span className={`text-sm font-medium ${
                product.stock > 10 ? 'text-accent' : product.stock > 0 ? 'text-star' : 'text-danger'
              }`}>
                {product.stock > 10 
                  ? 'En stock' 
                  : product.stock > 0 
                    ? `Solo ${product.stock} disponibles` 
                    : 'Agotado'
                }
              </span>
            </div>

            {/* Short description */}
            <p className="text-content-secondary mb-6 leading-relaxed">
              {product.descripcion}
            </p>

            {/* Quantity, Add to cart & Actions */}
            <ProductActions 
              productId={product.id} 
              productName={product.nombre} 
              stock={product.stock} 
            />

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface border border-line-soft rounded-sm relative overflow-hidden">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-accent via-accent/50 to-transparent" />
              <div className="flex items-center gap-3">
                <div className="size-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <Truck size={20} weight="duotone" className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-content">Envío gratis</p>
                  <p className="text-xs text-content-muted">En 24-48h</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} weight="duotone" className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-content">Garantía</p>
                  <p className="text-xs text-content-muted">1 año oficial</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                  <ArrowCounterClockwise size={20} weight="duotone" className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-content">Devolución</p>
                  <p className="text-xs text-content-muted">30 días</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product details tabs */}
        <div className="mt-16 relative z-10">
          <div className="border-b border-line-soft mb-8">
            <div className="flex gap-8">
              <button className="pb-4 border-b-2 border-accent text-accent font-semibold relative">
                Especificaciones
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent shadow-[0_0_10px_rgba(57,255,20,0.5)]" />
              </button>
              <button className="pb-4 border-b-2 border-transparent text-content-muted hover:text-content transition-colors">
                Descripción
              </button>
            </div>
          </div>

          {/* Specifications */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-content mb-4">Especificaciones técnicas</h3>
              {product.especificaciones && product.especificaciones.length > 0 ? (
                <div className="bg-surface border border-line-soft rounded-sm overflow-hidden relative">
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 w-20 h-0.5 bg-accent" />
                  {product.especificaciones.map((spec, index) => (
                    <div 
                      key={spec.id}
                      className={`flex py-3 px-4 ${index % 2 === 0 ? 'bg-surface-card' : ''}`}
                    >
                      <span className="w-1/3 text-sm font-medium text-content-muted">{spec.nombre}</span>
                      <span className="w-2/3 text-sm text-content">{spec.valor}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface border border-line-soft rounded-xl p-6 text-center">
                  <p className="text-content-muted">No hay especificaciones disponibles</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold text-content mb-4">Descripción completa</h3>
              <div className="bg-surface border border-line-soft rounded-sm p-6 relative overflow-hidden">
                {/* Top accent */}
                <div className="absolute top-0 left-0 w-20 h-0.5 bg-accent" />
                <p className="text-content-secondary leading-relaxed whitespace-pre-line">
                  {product.descripcion}
                </p>
              </div>

              {/* Categories */}
              {product.productoCategorias && product.productoCategorias.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-content mb-3">Categorías</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.productoCategorias.map((pc) => (
                      <Link
                        key={pc.categoria.id}
                        href={`/productos?cat=${pc.categoria.id}`}
                        className="px-3 py-1.5 bg-accent/10 text-accent text-sm rounded-sm hover:bg-accent/20 hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all duration-300"
                      >
                        {pc.categoria.nombre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <ProductReviews productId={product.id} productName={product.nombre} />

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-content">Productos relacionados</h2>
              <div className="flex-1 h-px bg-linear-to-r from-accent/30 to-transparent" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/productos/${item.slug}`}
                  className="group bg-surface border border-line-soft hover:border-accent/30 transition-all duration-300 overflow-hidden rounded-sm relative">
                  {/* Hover accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-accent to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <div className="aspect-square bg-surface-card p-4 flex items-center justify-center">
                    {getMainImage(item) ? (
                      <Image
                        src={getMainImage(item)!}
                        alt={item.nombre}
                        width={150}
                        height={150}
                        sizes="(max-width: 768px) 45vw, 150px"
                        className="object-contain max-h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="size-16 bg-surface-soft rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Laptop size={32} weight="duotone" className="text-placeholder-icon" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-accent font-medium">{getCategoryName(item)}</span>
                    <h3 className="font-medium text-content mt-1 line-clamp-2 group-hover:text-accent transition-colors text-sm">
                      {item.nombre}
                    </h3>
                    {item.marca && (
                      <p className="text-xs text-content-muted mt-1">{item.marca.nombre}</p>
                    )}
                    {hasOffer(item) ? (
                      <div className="flex items-baseline gap-2 mt-2">
                        <p className="text-lg font-bold text-red-500 tabular-nums">${formatPrice(item.precioOferta!)}</p>
                        <p className="text-sm text-content-muted line-through tabular-nums">${formatPrice(item.precio)}</p>
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-content mt-2 tabular-nums">${formatPrice(item.precio)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
