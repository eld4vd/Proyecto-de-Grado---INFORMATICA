'use client';

import { useState, useEffect, useCallback, useTransition, memo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Sliders, GridFour, Rows, ShoppingCart, Heart, CaretRight, X, MagnifyingGlass, Laptop, CircleNotch, User, SignIn, Sparkle, Check } from '@phosphor-icons/react';
import type { Producto, Categoria, Marca, PaginatedResponse } from '../lib/types';
import { useCart } from '../lib/cart-context';
import { useFavoritos } from '../lib/favoritos-context';

interface ProductsContentProps {
  initialProducts: PaginatedResponse<Producto>;
  categories: Categoria[];
  brands: Marca[];
}

// Helper para generar slug desde nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Helper para encontrar categoría por slug
function findCategoryBySlug(categories: Categoria[], slug: string): Categoria | undefined {
  return categories.find(cat => generateSlug(cat.nombre) === slug);
}

// Helper functions (moved outside component for memoization - Vercel Rule 5.4)
function getMainImage(producto: Producto): string | null {
  if (producto.imagenes && producto.imagenes.length > 0) {
    const principal = producto.imagenes.find(img => img.esPrincipal);
    return principal?.url || producto.imagenes[0].url;
  }
  return null;
}

function getCategoryName(producto: Producto): string {
  if (producto.productoCategorias && producto.productoCategorias.length > 0) {
    const categoria = producto.productoCategorias[0].categoria;
    if (categoria.categoriaPadre) {
      return `${categoria.categoriaPadre.nombre} > ${categoria.nombre}`;
    }
    return categoria.nombre;
  }
  return 'Sin categoría';
}

function formatPrice(precio: number | string): string {
  const num = typeof precio === 'string' ? parseFloat(precio) : precio;
  return num.toLocaleString('es-BO', { minimumFractionDigits: 2 });
}

// Memoized ProductCard component (Vercel Rule 5.4: Extract to Memoized Components)
interface ProductCardProps {
  product: Producto;
  viewMode: 'grid' | 'list';
  isFavorito: boolean;
  onAddToCart: (e: React.MouseEvent, productId: string, productName: string) => void;
  onAddToWishlist: (e: React.MouseEvent, productId: string, productName: string) => void;
}

const ProductCard = memo(function ProductCard({
  product,
  viewMode,
  isFavorito,
  onAddToCart,
  onAddToWishlist
}: ProductCardProps) {
  return (
    <Link 
      href={`/productos/${product.slug}`}
      className={`group bg-surface border border-line-soft rounded-xl overflow-hidden hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-[border-color,box-shadow] duration-300 ${
        viewMode === 'list' ? 'flex' : ''
      }`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: viewMode === 'list' ? '0 200px' : '0 400px' }}
    >
      {/* Image */}
      <div className={`relative bg-linear-to-br from-surface-raised to-surface ${
        viewMode === 'list' ? 'w-48 shrink-0' : 'aspect-square'
      }`}>
        {/* Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
          <div className="flex flex-col gap-1">
            {product.destacado && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-accent text-accent-contrast uppercase tracking-wider">
                Destacado
              </span>
            )}
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="px-2 py-0.5 bg-[#ff9500] text-black text-[10px] font-bold rounded uppercase">
              ¡Últimos {product.stock}!
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2 py-0.5 bg-danger text-white text-[10px] font-bold rounded uppercase">
              Agotado
            </span>
          )}
        </div>

        <div className="w-full h-full flex items-center justify-center p-3">
          {getMainImage(product) ? (
            <Image
              src={getMainImage(product)!}
              alt={product.nombre}
              width={180}
              height={180}
              className="object-contain max-h-full group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-surface-soft rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
              <Laptop size={40} className="text-placeholder-icon" />
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
          <button 
            onClick={(e) => onAddToWishlist(e, product.id, product.nombre)}
            className={`p-2.5 backdrop-blur-sm border transition-colors ${
              isFavorito
                ? 'bg-danger border-danger'
                : 'bg-black/70 border-transparent hover:bg-danger/20 hover:border-danger/30'
            }`}
            aria-label={isFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart 
              className={`size-4 ${isFavorito ? 'text-content fill-white' : 'text-content'}`} 
            />
          </button>
          <button 
            onClick={(e) => onAddToCart(e, product.id, product.nombre)}
            aria-label="Agregar al carrito"
            className="p-2.5 bg-accent hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ShoppingCart size={16} className="text-accent-contrast" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-center' : ''}`}>
        {/* Category & Brand */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] text-accent font-medium uppercase tracking-wider truncate">
            {getCategoryName(product)}
          </span>
          {product.marca && (
            <span className="text-[11px] text-content-muted truncate">
              {product.marca.nombre}
            </span>
          )}
        </div>
        
        {/* Name */}
        <h3 className="font-medium text-content text-sm mb-2 line-clamp-2 group-hover:text-accent transition-colors leading-snug min-h-11">
          {product.nombre}
        </h3>
        
        {/* SKU - Optional */}
        <p className="text-[10px] text-content-faint mb-3 truncate">
          SKU: {product.sku}
        </p>
        
        {/* Price & Stock */}
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-line group-hover:border-accent/20 transition-colors">
          <div>
            <span className="text-xl font-bold text-content group-hover:text-accent transition-colors tabular-nums">
              ${formatPrice(product.precio)}
            </span>
          </div>
          {product.stock > 0 ? (
            <span className="text-[11px] text-green-500 font-medium flex items-center gap-1">
              <span className="size-1.5 bg-green-500 rounded-full" aria-hidden="true"></span>
              En stock
            </span>
          ) : (
            <span className="text-[11px] text-red-500 font-medium">
              Sin stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
});

// Componente de paginación mejorada
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showPages = 5;
    
    if (totalPages <= showPages + 2) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar la primera página
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('ellipsis');
      }
      
      // Páginas alrededor de la actual
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }
      
      // Siempre mostrar la última página
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-content-secondary hover:text-content bg-surface border border-line-med rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent transition-colors"
      >
        ← Anterior
      </button>
      
      {/* Números de página */}
      <div className="flex items-center gap-1 mx-2">
        {getPageNumbers().map((page, index) => (
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-content-muted">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`size-10 text-sm font-medium rounded-lg transition-colors ${
                currentPage === page
                  ? 'bg-accent text-accent-contrast font-bold'
                  : 'text-content-secondary hover:text-content bg-surface border border-line-med hover:border-accent'
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>
      
      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-content-secondary hover:text-content bg-surface border border-line-med rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent transition-colors"
      >
        Siguiente →
      </button>
    </div>
  );
}

export default function ProductsContent({ 
  initialProducts, 
  categories, 
  brands 
}: ProductsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { addItem } = useCart();
  const { isFavorito, toggleFavorito } = useFavoritos();
  
  // Leer parámetro categoria (slug) de la URL
  const categoriaSlug = searchParams.get('categoria');
  const initialCategory = categoriaSlug 
    ? findCategoryBySlug(categories, categoriaSlug)?.id || ''
    : searchParams.get('cat') || '';
  
  const [products, setProducts] = useState(initialProducts.data);
  const [meta, setMeta] = useState(initialProducts.meta);
  const [isPending, startTransition] = useTransition();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('marca') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para autenticación y modal
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'cart' | 'wishlist', productId: string, productName: string } | null>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Actualizar URL cuando cambia la categoría
  const updateURL = useCallback((categoryId: string, brandId: string) => {
    const params = new URLSearchParams();
    
    if (categoryId) {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        params.set('categoria', generateSlug(category.nombre));
      }
    }
    
    if (brandId) {
      const brand = brands.find(b => b.id === brandId);
      if (brand) {
        params.set('marca', generateSlug(brand.nombre));
      }
    }
    
    const queryString = params.toString();
    const newURL = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(newURL, { scroll: false });
  }, [categories, brands, pathname, router]);

  // Manejar cambio de categoría
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    updateURL(categoryId, selectedBrand);
  };

  // Manejar cambio de marca
  const handleBrandChange = (brandId: string) => {
    setSelectedBrand(brandId);
    setCurrentPage(1);
    updateURL(selectedCategory, brandId);
  };

  // Fetch products cuando cambian los filtros
  const fetchProducts = useCallback(async () => {
    startTransition(async () => {
      try {
        const params = new URLSearchParams();
        
        if (searchQuery) params.set('search', searchQuery);
        if (selectedCategory) params.set('categoriaId', selectedCategory);
        if (selectedBrand) params.set('marcaId', selectedBrand);
        params.set('activo', 'true');
        params.set('skip', ((currentPage - 1) * 12).toString());
        params.set('take', '12');
        
        // Ordenamiento
        if (sortBy === 'price-asc') {
          params.set('orderBy', 'precio');
          params.set('orderDir', 'asc');
        } else if (sortBy === 'price-desc') {
          params.set('orderBy', 'precio');
          params.set('orderDir', 'desc');
        } else if (sortBy === 'newest') {
          params.set('orderBy', 'createdAt');
          params.set('orderDir', 'desc');
        }

        const res = await fetch(`/api/productos?${params}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.data || []);
          setMeta(data.meta || { total: 0, skip: 0, take: 12, totalPages: 0 });
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    });
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, currentPage]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedBrand, sortBy, currentPage, fetchProducts]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSearchQuery('');
    setCurrentPage(1);
    router.push(pathname, { scroll: false });
  };

  const hasFilters = selectedCategory || selectedBrand || searchQuery;

  // Handlers para carrito y wishlist
  const handleAddToCart = useCallback(async (e: React.MouseEvent, productId: string, productName: string) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setPendingAction({ type: 'cart', productId, productName });
      setShowLoginModal(true);
      return;
    }

    startTransition(async () => {
      try {
        await addItem(productId, 1);
        // Mostrar feedback visual (opcional)
      } catch (err) {
        console.error('Error al agregar al carrito:', err);
      }
    });
  }, [isAuthenticated, addItem]);

  const handleAddToWishlist = useCallback(async (e: React.MouseEvent, productId: string, productName: string) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setPendingAction({ type: 'wishlist', productId, productName });
      setShowLoginModal(true);
      return;
    }

    startTransition(async () => {
      try {
        await toggleFavorito(productId);
      } catch (err) {
        console.error('Error al actualizar favorito:', err);
      }
    });
  }, [isAuthenticated, toggleFavorito]);

  const handleLoginRedirect = useCallback(() => {
    const currentUrl = window.location.pathname + window.location.search;
    router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
  }, [router]);

  const handleRegisterRedirect = useCallback(() => {
    const currentUrl = window.location.pathname + window.location.search;
    router.push(`/registro?redirect=${encodeURIComponent(currentUrl)}`);
  }, [router]);

  // Contenido dinámico del modal según la acción
  const getModalContent = () => {
    if (!pendingAction) return null;

    if (pendingAction.type === 'wishlist') {
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
    }

    return {
      icon: <ShoppingCart size={32} className="text-accent" />,
      iconBg: 'bg-accent/10',
      title: '¡Inicia sesión para comprar!',
      description: 'Para agregar productos al carrito necesitas una cuenta. Es rápido y obtendrás beneficios exclusivos.',
      benefits: [
        'Guarda tu carrito y accede desde cualquier dispositivo',
        'Seguimiento de pedidos en tiempo real',
        'Ofertas y descuentos exclusivos'
      ]
    };
  };

  const modalContent = getModalContent();

  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Modal de Login */}
      {showLoginModal && modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowLoginModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-surface-card border border-line-med rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button 
              onClick={() => setShowLoginModal(false)}
              aria-label="Cerrar modal"
              className="absolute top-4 right-4 text-content-muted hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] rounded-md transition-colors"
            >
              <X size={20} aria-hidden="true" />
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
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-accent-contrast font-semibold rounded-lg hover:bg-accent-hover transition-colors"
              >
                <SignIn size={20} />
                Iniciar sesión
              </button>
              
              <button
                onClick={handleRegisterRedirect}
                className="w-full flex items-center justify-center gap-2 py-3 border border-accent text-accent font-semibold rounded-lg hover:bg-accent hover:text-accent-contrast transition-colors"
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

      {/* Header fijo con Breadcrumb */}
      <div className="shrink-0 px-4 md:px-8 lg:px-12 py-4 border-b border-line-soft relative">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/10 to-transparent" />
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-content-muted">
          <Link href="/" className="hover:text-accent transition-colors">Inicio</Link>
          <CaretRight size={16} />
          <span className="text-content-bright">Productos</span>
          {selectedCategory && (
            <>
              <CaretRight size={16} />
              <span className="text-accent">
                {categories.find(c => c.id === selectedCategory)?.nombre}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex">
        {/* Sidebar - Desktop - Sticky */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-line-soft relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-accent/3 to-transparent pointer-events-none" />
          <div className="sticky top-15 max-h-[calc(100vh-60px)] overflow-y-auto p-4 space-y-4 z-10">
            {/* MagnifyingGlass */}
            <div className="bg-surface border border-line-soft p-5 hover:border-line-med transition-colors">
              <h3 className="text-sm font-semibold text-content mb-4">Buscar</h3>
              <div className="relative">
                <input
                  type="search"
                  name="search"
                  autoComplete="off"
                  spellCheck={false}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos…"
                  className="w-full h-11 pl-11 pr-4 bg-surface-card border border-line text-content placeholder:text-content-muted focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors"
                />
                <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-content-muted" aria-hidden="true" />
              </div>
            </div>

            {/* Categories */}
            <div className="bg-surface border border-line-soft p-5 hover:border-line-med transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-content">Categorías</h3>
                <span className="text-xs text-content-muted">{categories.length}</span>
              </div>
              <div className="space-y-1">
                {/* Ordenar categorías: seleccionada primero, luego el resto */}
                {[...categories]
                  .sort((a, b) => {
                    if (a.id === selectedCategory) return -1;
                    if (b.id === selectedCategory) return 1;
                    return 0;
                  })
                  .map((cat) => {
                  const count = cat._count?.productoCategorias || 0;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(isSelected ? '' : cat.id)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 transition-colors group ${
                        isSelected 
                          ? 'bg-accent/10 text-accent border border-accent/30' 
                          : 'text-content-secondary hover:bg-surface-soft hover:text-content border border-transparent'
                      }`}
                    >
                      <span className="flex-1 text-left text-sm truncate">{cat.nombre}</span>
                      <span className={`text-xs px-2 py-0.5 transition-colors ${
                        isSelected
                          ? 'bg-accent/20 text-accent'
                          : 'bg-surface-hover text-content-muted group-hover:bg-line-med group-hover:text-content-secondary'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div className="bg-surface border border-line-soft rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-content mb-4">Marcas</h3>
              <div className="space-y-1">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandChange(selectedBrand === brand.id ? '' : brand.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedBrand === brand.id 
                        ? 'bg-accent/10 text-accent' 
                        : 'text-content-secondary hover:bg-surface-soft hover:text-content'
                    }`}
                  >
                    {brand.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="w-full py-3 text-sm text-accent hover:text-content border border-accent/30 hover:border-accent rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col">
          {/* Header fijo dentro del main */}
          <div className="shrink-0 px-4 md:px-6 py-4 border-b border-line-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-content text-wrap-balance">
                  {selectedCategory 
                    ? categories.find(c => c.id === selectedCategory)?.nombre || 'Productos'
                    : 'Todos los Productos'
                  }
                </h1>
                <p className="text-content-muted text-sm mt-1">
                  {isPending ? (
                    'Cargando productos…'
                  ) : (
                    <>
                      <span className="text-content font-medium">
                        {meta.total > 0 
                          ? `Mostrando ${meta.skip + 1}-${Math.min(meta.skip + products.length, meta.total)}`
                          : '0 productos'
                        }
                      </span>
                      {meta.total > 0 && (
                        <span> de {meta.total.toLocaleString('es-ES')} productos</span>
                      )}
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <button 
                  onClick={() => setShowFilters(true)}
                  aria-label="Abrir filtros"
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-surface border border-line-med rounded-lg text-content text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent touch-action-manipulation"
                >
                  <Sliders size={16} aria-hidden="true" />
                  Filtros
                </button>

                {/* View toggle */}
                <div className="flex items-center bg-surface border border-line rounded-lg p-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    aria-label="Vista de cuadrícula"
                    aria-pressed={viewMode === 'grid'}
                    className={`p-2.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${viewMode === 'grid' ? 'bg-accent text-accent-contrast' : 'text-content-muted hover:text-content'}`}
                  >
                    <GridFour size={16} aria-hidden="true" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    aria-label="Vista de lista"
                    aria-pressed={viewMode === 'list'}
                    className={`p-2.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${viewMode === 'list' ? 'bg-accent text-accent-contrast' : 'text-content-muted hover:text-content'}`}
                  >
                    <Rows size={16} aria-hidden="true" />
                  </button>
                </div>

                {/* Sort */}
                <label className="sr-only" htmlFor="sort-select">Ordenar por</label>
                <select 
                  id="sort-select"
                  name="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 px-4 bg-surface border border-line rounded-lg text-content text-sm focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/50 cursor-pointer"
                >
                  <option value="relevance">Más relevantes</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                  <option value="newest">Más recientes</option>
                </select>
              </div>
            </div>

            {/* Active filters */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-sm text-content-muted">Filtros activos:</span>
                {selectedCategory && (
                  <button
                    onClick={() => handleCategoryChange('')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent text-sm rounded-full hover:bg-accent/20 transition-colors"
                  >
                    <span>{categories.find(c => c.id === selectedCategory)?.nombre}</span>
                    <X size={12} />
                  </button>
                )}
                {selectedBrand && (
                  <button
                    onClick={() => handleBrandChange('')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent text-sm rounded-full hover:bg-accent/20 transition-colors"
                  >
                    {brands.find(b => b.id === selectedBrand)?.nombre}
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Área de productos */}
          <div className="p-4 md:p-6">
            {/* Loading overlay */}
            {isPending && (
              <div className="flex justify-center py-12">
                <CircleNotch size={32} className="text-accent animate-spin" />
              </div>
            )}

            {/* Products Grid - Using Memoized ProductCard (Vercel Rule 5.4) */}
            {!isPending && (
              <div className={`grid gap-3 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    isFavorito={isFavorito(product.id)}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isPending && meta.totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={meta.totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* Empty state */}
            {!isPending && products.length === 0 && (
              <div className="text-center py-16" role="status" aria-live="polite">
                <div className="size-20 rounded-full bg-surface-raised flex items-center justify-center mx-auto mb-4">
                  <MagnifyingGlass size={32} className="text-content-muted" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-content mb-2 text-wrap-balance">No se encontraron productos</h3>
                <p className="text-content-muted mb-6">Intenta ajustar los filtros o buscar algo diferente</p>
                <button 
                  onClick={clearFilters}
                  className="px-6 py-3 bg-accent hover:bg-accent-hover text-accent-contrast font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile filters drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-surface overflow-y-auto overscroll-contain">
            <div className="sticky top-0 bg-surface border-b border-line p-4 flex items-center justify-between">
              <h3 className="font-semibold text-content">Filtros</h3>
              <button 
                aria-label="Cerrar filtros"
                onClick={() => setShowFilters(false)} 
                className="p-2 text-content-secondary hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--monster] rounded-lg"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            
            <div className="p-4 space-y-6 touch-pan-y">
              {/* MagnifyingGlass */}
              <div>
                <label htmlFor="mobile-search" className="text-sm font-semibold text-content mb-3 block">Buscar</label>
                <input
                  id="mobile-search"
                  type="search"
                  name="search"
                  autoComplete="off"
                  spellCheck={false}
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchQuery(value);
                  }}
                  placeholder="Buscar productos…"
                  className="w-full h-11 px-4 bg-surface-card border border-line rounded-lg text-content placeholder:text-content-muted focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/50"
                />
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-sm font-semibold text-content mb-3">Categorías</h4>
                <div className="space-y-1">
                  {/* Ordenar categorías: seleccionada primero */}
                  {[...categories]
                    .sort((a, b) => {
                      if (a.id === selectedCategory) return -1;
                      if (b.id === selectedCategory) return 1;
                      return 0;
                    })
                    .map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(isSelected ? '' : cat.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-accent/10 text-accent' 
                            : 'text-content-secondary hover:bg-surface-soft hover:text-content'
                        }`}
                      >
                        <span className="text-sm">{cat.nombre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h4 className="text-sm font-semibold text-content mb-3">Marcas</h4>
                <div className="space-y-1">
                  {brands.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleBrandChange(selectedBrand === brand.id ? '' : brand.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                        selectedBrand === brand.id 
                          ? 'bg-accent/10 text-accent' 
                          : 'text-content-secondary hover:bg-surface-soft hover:text-content'
                      }`}
                    >
                      {brand.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Apply button */}
            <div className="sticky bottom-0 bg-surface border-t border-line p-4">
              <button 
                onClick={() => setShowFilters(false)}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-accent-contrast font-semibold rounded-lg transition-colors"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
