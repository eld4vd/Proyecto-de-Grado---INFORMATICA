'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MagnifyingGlass, User, List, X, CaretDown, Laptop, Cpu, Monitor, Headphones, GameController, HardDrive, Phone, SquaresFour, SignOut, Package, CircleNotch } from '@phosphor-icons/react';
import { useAuth } from '../../lib/auth-context';
import { CartButton } from './CartButton';
import { ThemeToggle } from './ThemeToggle';
import { useToast } from './Toast';
import { ConfirmDialog } from './ConfirmDialog';

// Tipo para resultados de búsqueda
interface SearchResult {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  imagen: string | null;
  marca: string | null;
  categoria: string | null;
}

const categories = [
  { name: 'Laptops', icon: Laptop, href: '/productos?cat=laptops', sub: ['Gaming', 'Trabajo', 'Estudiantes'] },
  { name: 'Componentes', icon: Cpu, href: '/productos?cat=componentes', sub: ['Procesadores', 'Tarjetas Gráficas', 'RAM'] },
  { name: 'Monitores', icon: Monitor, href: '/productos?cat=monitores', sub: ['Gaming', 'Profesional', 'Ultrawide'] },
  { name: 'Periféricos', icon: Headphones, href: '/productos?cat=perifericos', sub: ['Teclados', 'Mouse', 'Headsets'] },
  { name: 'Gaming', icon: GameController, href: '/productos?cat=gaming', sub: ['Consolas', 'Accesorios', 'Sillas'] },
  { name: 'Almacenamiento', icon: HardDrive, href: '/productos?cat=almacenamiento', sub: ['SSD', 'HDD', 'NVMe'] },
];

const navLinks = [
  { name: 'Inicio', href: '/' },
  { name: 'Productos', href: '/productos' },
  { name: 'Ofertas', href: '/ofertas' },
  { name: 'Nosotros', href: '/nosotros' },
  { name: 'Soporte', href: '/soporte' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const { user, logout: authLogout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Estados para búsqueda en tiempo real
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Estado para controlar la visibilidad del top bar
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [isScrollSearchOpen, setIsScrollSearchOpen] = useState(false);
  const scrollSearchRef = useRef<HTMLDivElement>(null);

  // rerender-derived-state-no-effect: derivar iniciales del usuario durante render
  const userInitials = user
    ? user.nombre && user.apellido
      ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`
      : user.nombre
        ? user.nombre.charAt(0)
        : user.email.charAt(0)
    : '';

  // Búsqueda en tiempo real con debounce
  useEffect(() => {
    if (searchValue.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/productos/quick-search?q=${encodeURIComponent(searchValue)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error('Error en búsqueda:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inMainSearch = searchRef.current?.contains(target);
      const inScrollSearch = scrollSearchRef.current?.contains(target);
      if (!inMainSearch && !inScrollSearch) {
        setShowSearchResults(false);
        setIsScrollSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegar a producto por slug
  const handleProductClick = useCallback((slug: string) => {
    setShowSearchResults(false);
    setSearchValue('');
    setIsScrollSearchOpen(false);
    router.push(`/productos/${slug}`);
  }, [router]);

  // Efecto para detectar scroll y ocultar/mostrar top bar (con histéresis)
  // Ya usa { passive: true } - óptimo según client-passive-event-listeners
  useEffect(() => {
    const SHOW_AT = 30;
    const HIDE_AT = 120;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Functional setState - no necesita dependencias (rerender-functional-setstate)
      setIsTopBarVisible((prev) => {
        if (currentScrollY <= SHOW_AT) return true;
        if (currentScrollY >= HIDE_AT) return false;
        return prev;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar búsqueda expandida al volver arriba
  useEffect(() => {
    if (isTopBarVisible) setIsScrollSearchOpen(false);
  }, [isTopBarVisible]);

  // Mostrar diálogo de confirmación
  const handleLogoutClick = () => {
    setUserMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  // Manejar logout confirmado
  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    const userName = user?.nombre || 'Usuario';
    setShowLogoutConfirm(false);
    
    // Mostrar toast de "Cerrando sesión…"
    showToast({
      type: 'info',
      title: 'Cerrando sesión…',
      message: 'Por favor espera un momento.',
      duration: 1500,
    });
    
    // Esperar 1 segundo antes de cerrar sesión
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await authLogout();
    setIsLoggingOut(false);
    
    // Mostrar toast de despedida
    showToast({
      type: 'success',
      title: '¡Hasta pronto!',
      message: `${userName}, tu sesión se ha cerrado correctamente.`,
      duration: 4000,
    });
    
    // Redirigir al home
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar - se oculta al hacer scroll */}
      <div 
        className={`bg-surface-deep border-b border-line transition-all duration-300 overflow-hidden ${
          isTopBarVisible ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0 border-b-0'
        }`}
      >
        <div className="container-custom flex items-center justify-between py-2">
          <div className="flex items-center gap-6 text-xs">
            <span className="flex items-center gap-1.5 text-accent">
              <Phone size={12} />
              <span className="text-content-secondary">+591 123 456 789</span>
            </span>
            <span className="hidden md:inline text-content-muted">
              Envío gratis en compras +$500
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/soporte" className="text-content-secondary hover:text-content transition-colors">
              Soporte
            </Link>
            {/* Contenedor con ancho mínimo para evitar CLS durante carga */}
            <div style={{ minWidth: '120px' }}>
              {isLoading ? (
                <div className="auth-skeleton items-center gap-2">
                  <div className="h-4 w-24 bg-surface-hover animate-pulse rounded" />
                </div>
              ) : user ? (
                <div className="flex items-center gap-2">
                  <span className="text-content-secondary">
                    Hola, <span className="text-accent font-medium">{user.nombre || user.email}</span>
                  </span>
                  {user.role === 'admin' && (
                    <Link 
                      href="/admin/dashboard" 
                      className="px-2 py-1 bg-accent/10 text-accent font-medium border border-accent/20 hover:bg-accent/20 transition-colors"
                    >
                      Panel Admin
                    </Link>
                  )}
                </div>
              ) : (
                <Link href="/login" className="text-accent font-medium hover:text-accent-hover transition-colors">
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header - altura compacta al hacer scroll */}
      <div className={`bg-surface transition-all duration-300 ${
        isTopBarVisible ? '' : 'shadow-lg shadow-black/50'
      }`}>
        <div className="container-custom">
          <div className={`flex items-center transition-all duration-300 ${
            isTopBarVisible ? 'h-20 gap-8' : 'h-14 gap-4'
          }`}>
            {/* Logo - más compacto en scroll */}
            <Link href="/" className="flex items-center gap-1 shrink-0">
              <div className={`relative transition-all duration-300 ${
                isTopBarVisible ? 'size-20' : 'size-14'
              }`}>
                  <Image
                    src="/logo-sicabit.webp"
                    alt="SicaBit"
                    fill
                    sizes="80px"
                    className="object-contain"
                    loading="eager"
                    fetchPriority="low"
                  />
              </div>
              <div className={`hidden sm:block transition-all duration-300 ${
                isTopBarVisible ? 'opacity-100' : 'opacity-100'
              }`}>
                <span className={`font-black text-content tracking-tight transition-all duration-300 ${
                  isTopBarVisible ? 'text-2xl' : 'text-xl'
                }`}>
                  SICA<span className="text-accent">BIT</span>
                </span>
                <p className={`text-[10px] text-content-muted tracking-[0.2em] uppercase -mt-1 transition-all duration-300 ${
                  isTopBarVisible ? 'opacity-100 max-h-4' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>Tech Store</p>
              </div>
            </Link>

            {/* Category dropdown button - Desktop (oculto al hacer scroll) */}
            <div 
              className={`relative group/categories transition-all duration-300 ${
                isTopBarVisible ? 'hidden lg:block' : 'hidden'
              }`}
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <div
                className="flex items-center gap-2 px-4 py-2.5 bg-surface-soft hover:bg-surface-hover border border-line-med text-content text-sm font-medium transition-colors cursor-pointer"
              >
                <List size={16} />
                <span>Categorías</span>
              </div>

              {/* Mega menu - conectado sin espacio con padding invisible arriba */}
              {isCategoryOpen && (
                <div className="absolute left-0 z-50 pt-1 -top-1">
                  <div className="w-120 bg-surface-raised border border-line-med shadow-xl p-4 grid grid-cols-2 gap-1 mt-10.5">
                    {categories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover transition-colors group"
                      >
                        <cat.icon size={16} className="text-accent" />
                        <div>
                          <span className="text-sm text-content group-hover:text-accent transition-colors">
                            {cat.name}
                          </span>
                          <p className="text-[11px] text-content-faint">
                            {cat.sub.join(' · ')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Barra de búsqueda - oculta al hacer scroll */}
            <div className={`flex-1 max-w-xl transition-all duration-300 ${
              isTopBarVisible ? 'hidden md:flex' : 'hidden'
            }`} ref={searchRef}>
              <div className="relative w-full">
                <label htmlFor="header-search" className="sr-only">Buscar productos</label>
                <input
                  id="header-search"
                  type="search"
                  name="search"
                  autoComplete="off"
                  spellCheck={false}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => searchValue.length >= 2 && setShowSearchResults(true)}
                  placeholder="Buscar productos…"
                  className={`w-full pl-10 pr-4 bg-surface-card border border-line-med text-sm text-content placeholder:text-content-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-all duration-300 ${
                    isTopBarVisible ? 'h-10' : 'h-9'
                  }`}
                />
                {isSearching ? (
                  <CircleNotch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent animate-spin" aria-hidden="true" />
                ) : (
                  <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" aria-hidden="true" />
                )}

                {/* Resultados de búsqueda en tiempo real */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-line-med shadow-2xl z-50 max-h-100 overflow-y-auto md:w-2xl md:left-1/2 md:-translate-x-1/2 md:right-auto">
                    <div className="p-2 border-b border-line-med">
                      <span className="text-xs text-content-muted">{searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} para &quot;{searchValue}&quot;</span>
                    </div>
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.slug)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-surface-soft transition-colors text-left group"
                      >
                        <div className="size-12 bg-surface-raised border border-line-med flex items-center justify-center shrink-0 overflow-hidden">
                          {product.imagen ? (
                            <Image
                              src={product.imagen}
                              alt={product.nombre}
                              width={48}
                              height={48}
                              className="object-contain"
                            />
                          ) : (
                            <Package size={20} className="text-content-faint" aria-hidden="true" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-content font-medium truncate group-hover:text-accent transition-colors">
                            {product.nombre}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-content-muted">
                            {product.marca && <span>{product.marca}</span>}
                            {product.categoria && (
                              <>
                                <span>•</span>
                                <span>{product.categoria}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-accent">
                            Bs. {product.precio.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </button>
                    ))}
                    <Link
                      href={`/productos?search=${encodeURIComponent(searchValue)}`}
                      onClick={() => setShowSearchResults(false)}
                      className="block p-3 text-center text-sm text-accent hover:bg-surface-soft transition-colors border-t border-line-med"
                    >
                      Ver todos los resultados →
                    </Link>
                  </div>
                )}

                {/* Sin resultados */}
                {showSearchResults && searchValue.length >= 2 && searchResults.length === 0 && !isSearching && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-line-med shadow-2xl z-50 p-6 text-center md:w-2xl md:left-1/2 md:-translate-x-1/2 md:right-auto">
                    <Package size={40} className="text-content-faint mx-auto mb-2" aria-hidden="true" />
                    <p className="text-sm text-content-secondary">No se encontraron productos para &quot;{searchValue}&quot;</p>
                    <Link
                      href="/productos"
                      onClick={() => setShowSearchResults(false)}
                      className="inline-block mt-3 text-xs text-accent hover:underline"
                    >
                      Ver todos los productos
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation - Desktop (más visible al scroll) */}
            <nav className={`hidden items-center gap-0.5 ${
              isTopBarVisible ? 'xl:flex' : 'lg:flex'
            }`}>
              {navLinks.map((link) => {
                const isActive = link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1.5 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-accent text-black'
                        : 'text-content-secondary hover:text-content hover:bg-surface-soft'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* Buscar - aparece al hacer scroll (desktop) */}
              {!isTopBarVisible && (
                <button
                  onClick={() => setIsScrollSearchOpen(!isScrollSearchOpen)}
                  aria-label="Buscar productos"
                  className="hidden md:flex p-2.5 text-content-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
                >
                  <MagnifyingGlass size={20} aria-hidden="true" />
                </button>
              )}

              {/* MagnifyingGlass mobile */}
              <button 
                aria-label="Buscar productos"
                className="md:hidden p-3 text-content-secondary hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
              >
                <MagnifyingGlass size={20} aria-hidden="true" />
              </button>

              {/* User */}
              {isLoading ? (
                <div className="auth-skeleton hidden sm:flex items-center p-3" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <div className="size-5 bg-surface-hover animate-pulse rounded-full" />
                </div>
              ) : user ? (
                <div className="hidden sm:flex items-center relative" style={{ minWidth: '44px', minHeight: '44px' }}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-label="Menú de usuario"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 p-2.5 text-content-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
                  >
                    <span className="size-8 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center text-xs font-bold text-accent uppercase">
                      {userInitials}
                    </span>
                    <CaretDown className={`size-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>

                  {/* User menu dropdown */}
                  {userMenuOpen && (
                    <>
                      <div className="absolute right-0 top-full mt-2 w-56 bg-surface-raised border border-line-med shadow-xl z-50">
                        <div className="p-3 border-b border-line-med">
                          <p className="text-sm text-content font-medium truncate">{user.email}</p>
                          <p className="text-xs text-content-muted capitalize">{user.role}</p>
                        </div>
                        <div className="py-1">
                          {user.role === 'admin' ? (
                            <Link
                              href="/admin/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-content hover:bg-surface-hover transition-colors"
                            >
                              <SquaresFour size={16} className="text-accent" />
                              <span className="text-sm">Panel de Administración</span>
                            </Link>
                          ) : (
                            <>
                              <Link
                                href="/cuenta"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-content hover:bg-surface-hover transition-colors"
                              >
                                <User size={16} className="text-content-secondary" />
                                <span className="text-sm">Mi cuenta</span>
                              </Link>
                            </>
                          )}
                          <button
                            onClick={handleLogoutClick}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-danger hover:bg-surface-hover transition-colors"
                          >
                            <SignOut size={16} />
                            <span className="text-sm">Cerrar sesión</span>
                          </button>
                        </div>
                      </div>
                      {/* Overlay para cerrar el menú */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                    </>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  aria-label="Iniciar sesión"
                  className="hidden sm:flex items-center p-3 text-content-secondary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <User size={20} aria-hidden="true" />
                </Link>
              )}

              {/* Cart */}
              <CartButton />

              {/* Mobile menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMenuOpen}
                className="xl:hidden p-3 text-content-secondary hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
              >
                {isMenuOpen ? <X size={24} aria-hidden="true" /> : <List size={24} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda expandible (aparece al hacer scroll y click en lupa) */}
      <div
        className={`bg-surface border-b border-line-med overflow-hidden transition-all duration-300 ${
          !isTopBarVisible && isScrollSearchOpen ? 'max-h-80 opacity-100 shadow-lg shadow-black/30' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-custom py-3" ref={scrollSearchRef}>
          <div className="relative">
            <label htmlFor="scroll-search" className="sr-only">Buscar productos</label>
            <input
              id="scroll-search"
              type="search"
              name="scroll-search"
              autoComplete="off"
              spellCheck={false}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => searchValue.length >= 2 && setShowSearchResults(true)}
              placeholder="¿Qué estás buscando?"
              className="w-full h-10 pl-10 pr-4 bg-surface-card border border-line-med text-sm text-content placeholder:text-content-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent"
            />
            {isSearching ? (
              <CircleNotch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent animate-spin" aria-hidden="true" />
            ) : (
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" aria-hidden="true" />
            )}

            {/* Resultados de búsqueda en overlay */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-line-med shadow-2xl z-50 max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-line-med">
                  <span className="text-xs text-content-muted">{searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}</span>
                </div>
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.slug)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-surface-soft transition-colors text-left group"
                  >
                    <div className="size-10 bg-surface-raised border border-line-med flex items-center justify-center shrink-0 overflow-hidden">
                      {product.imagen ? (
                        <Image src={product.imagen} alt={product.nombre} width={40} height={40} className="object-contain" />
                      ) : (
                        <Package size={16} className="text-content-faint" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-content font-medium truncate group-hover:text-accent transition-colors">{product.nombre}</p>
                      <div className="flex items-center gap-2 text-xs text-content-muted">
                        {product.marca && <span>{product.marca}</span>}
                        {product.categoria && <><span>•</span><span>{product.categoria}</span></>}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-accent shrink-0">Bs. {product.precio.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</p>
                  </button>
                ))}
                <Link
                  href={`/productos?search=${encodeURIComponent(searchValue)}`}
                  onClick={() => { setShowSearchResults(false); setIsScrollSearchOpen(false); }}
                  className="block p-3 text-center text-sm text-accent hover:bg-surface-soft transition-colors border-t border-line-med"
                >
                  Ver todos los resultados →
                </Link>
              </div>
            )}

            {showSearchResults && searchValue.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-line-med shadow-2xl z-50 p-6 text-center">
                <Package size={32} className="text-content-faint mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm text-content-secondary">Sin resultados para &quot;{searchValue}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className={`xl:hidden fixed inset-0 bg-surface z-40 overflow-y-auto transition-all duration-300 ${
          isTopBarVisible ? 'top-32' : 'top-14'
        }`}>
          {/* Mobile search */}
          <div className="p-4 border-b border-line">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos…"
                className="w-full h-10 pl-10 pr-4 bg-surface-card border border-line-med text-sm text-content placeholder:text-content-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent"
              />
              <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" aria-hidden="true" />
            </div>
          </div>

          {/* Mobile categories */}
          <div className="p-4 border-b border-line">
            <h3 className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">Categorías</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 bg-surface-soft hover:bg-surface-hover transition-colors"
                >
                  <cat.icon size={16} className="text-accent" aria-hidden="true" />
                  <span className="text-sm text-content">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile nav */}
          <nav className="p-4">
            <ul className="space-y-1">
              {navLinks.map((link) => {
                const isActive = link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
                return (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-accent text-black'
                          : 'text-content hover:bg-surface-soft'
                      }`}
                    >
                      <span>{link.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-line bg-surface">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-surface-soft">
                  <div className="size-9 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center">
                    <span className="text-xs font-bold text-accent uppercase">
                      {userInitials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-content text-sm truncate">{user.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : user.email}</p>
                    <p className="text-xs text-content-muted capitalize">{user.role}</p>
                  </div>
                </div>
                {user.role === 'admin' ? (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-3 bg-accent text-accent-contrast font-medium hover:bg-accent-hover transition-colors"
                  >
                    <SquaresFour size={16} aria-hidden="true" />
                    <span>Panel de Administración</span>
                  </Link>
                ) : (
                  <Link
                    href="/cuenta"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-center gap-2 p-3 bg-surface-soft text-content hover:bg-surface-hover transition-colors"
                  >
                    <User size={16} />
                    <span>Mi cuenta</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogoutClick();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full p-3 border border-line-med text-danger hover:bg-surface-soft transition-colors"
                >
                  <SignOut size={16} aria-hidden="true" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 bg-surface-soft hover:bg-surface-hover transition-colors"
              >
                <div className="size-9 bg-surface-hover flex items-center justify-center">
                  <User size={16} className="text-accent" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-medium text-content text-sm">Mi cuenta</p>
                  <p className="text-xs text-content-muted">Inicia sesión</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close mega menu */}
      {isCategoryOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsCategoryOpen(false)}
        />
      )}

      {/* Diálogo de confirmación de logout */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Cerrar sesión"
        message={`¿Estás seguro que deseas cerrar tu sesión${user?.nombre ? `, ${user.nombre}` : ''}? Tendrás que volver a iniciar sesión para acceder a tu cuenta.`}
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        type="danger"
        isLoading={isLoggingOut}
      />
    </header>
  );
}
