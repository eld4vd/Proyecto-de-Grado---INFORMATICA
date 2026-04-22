'use client';

import { useEffect, useLayoutEffect, useState, useCallback, useTransition, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SquaresFour, Package, Users, ShoppingCart, Tag, Gear, SignOut, List, X, CaretRight, Bell, CircleNotch, SidebarSimple, Sidebar, IconContext } from '@phosphor-icons/react';
import { useAuth } from '../lib/auth-context';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useNotifications, NotificationPanel } from './components/NotificationPanel';

// Menú del sidebar
const menuItems = [
  { label: 'Dashboard', icon: SquaresFour, href: '/admin/dashboard' },
  { label: 'Marcas', icon: Tag, href: '/admin/marcas' },
  { label: 'Categorías', icon: Package, href: '/admin/categorias' },
  { label: 'Productos', icon: Package, href: '/admin/productos' },
  { label: 'Clientes', icon: Users, href: '/admin/clientes' },
  { label: 'Órdenes', icon: ShoppingCart, href: '/admin/ordenes' },
  { label: 'Códigos Promo', icon: Tag, href: '/admin/codigos-promocionales' },
  { label: 'Configuración', icon: Gear, href: '/admin/configuracion' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Notificaciones
  const {
    notifications,
    unreadCount,
    readIds,
    isOpen: notificationsOpen,
    toggle: toggleNotifications,
    close: closeNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Redirigir si no es admin (usa el contexto global, sin llamada HTTP duplicada)
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/login?type=admin');
    }
  }, [isLoading, user, router]);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    const userName = user?.nombre || 'Administrador';
    setShowLogoutConfirm(false);
    
    // Mostrar toast de "Cerrando sesión…"
    showToast({
      type: 'info',
      title: 'Cerrando sesión…',
      message: 'Por favor espera un momento.',
      duration: 1500,
    });
    
    startTransition(async () => {
      // Esperar 1 segundo antes de cerrar sesión
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await logout();
      
      // Mostrar toast de despedida
      showToast({
        type: 'success',
        title: 'Sesión cerrada',
        message: `${userName}, has cerrado sesión del panel de administración.`,
        duration: 4000,
      });
      
      router.push('/login');
      router.refresh();
    });
  }, [user?.nombre, showToast, logout, router]);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleOpenSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const handleToggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleCloseLogoutConfirm = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  // Cerrar sidebar en cambio de ruta (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // ── Persistencia de scroll por ruta ──
  // Guardamos scrollTop solo al salir de la ruta (no en cada evento scroll)
  const scrollRef = useRef(0);

  // 1) Capturar scroll en un ref (sin escritura a sessionStorage en cada evento)
  useEffect(() => {
    const main = document.getElementById('admin-main-content');
    if (!main) return;
    const onScroll = () => {
      scrollRef.current = main.scrollTop;
    };
    main.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      main.removeEventListener('scroll', onScroll);
      // Solo guardar si no fue bloqueado por persistCurrentScroll (AdminTable)
      const lockKey = `admin-scroll-lock:${pathname}`;
      if (sessionStorage.getItem(lockKey)) {
        sessionStorage.removeItem(lockKey);
      } else {
        sessionStorage.setItem(`admin-scroll:${pathname}`, String(scrollRef.current));
      }
    };
  }, [pathname]);

  // 2) Restaurar scroll antes del paint (con reintentos para server components)
  useLayoutEffect(() => {
    const main = document.getElementById('admin-main-content');
    if (!main) return;
    const saved = sessionStorage.getItem(`admin-scroll:${pathname}`);
    if (!saved) return;
    const target = parseInt(saved, 10);
    if (target <= 0) return;

    main.scrollTop = target;

    // Reintentar periódicamente (~1s) mientras el contenido carga
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (Math.abs(main.scrollTop - target) <= 2 || attempts >= 20) {
        clearInterval(timer);
        return;
      }
      main.scrollTop = target;
    }, 50);

    return () => clearInterval(timer);
  }, [pathname]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0f1a]">
        <div className="text-center">
          <CircleNotch size={40} className="text-admin-primary animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-400">Cargando panel…</p>
        </div>
      </div>
    );
  }

  return (
    <IconContext.Provider value={{ weight: 'duotone' }}>
    <div className="admin-layout fixed inset-0 z-50 flex bg-[#0b0f1a]">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-[#0f1419] border-r border-[#1e293b] transition-all duration-300 lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}
      >
        {/* Subtle glow accent */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-admin-primary/5 to-transparent pointer-events-none" />
        
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e293b] relative">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 transition-opacity group overflow-hidden ${
            sidebarCollapsed ? 'lg:justify-center lg:w-full' : ''
          }`}>
            <div className="size-8 bg-admin-primary flex items-center justify-center relative overflow-hidden group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-shadow shrink-0">
              <span className="text-white font-black text-sm relative z-10">SB</span>
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
            <span className={`text-lg font-bold text-white whitespace-nowrap transition-opacity duration-300 ${
              sidebarCollapsed ? 'lg:hidden' : ''
            }`}>
              Admin
            </span>
          </Link>
          <button 
            onClick={handleCloseSidebar}
            className="lg:hidden p-1 text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
            aria-label="Cerrar menú"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                title={sidebarCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-200 relative group overflow-hidden ${
                  isActive
                    ? 'bg-admin-primary/10 text-admin-primary border-l-2 border-admin-primary -ml-px'
                    : 'text-gray-400 hover:text-white hover:bg-[#1e293b]'
                } ${
                  sidebarCollapsed ? 'lg:justify-center' : ''
                }`}
              >
                <item.icon className={`size-5 shrink-0 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} aria-hidden="true" />
                <span className={`whitespace-nowrap transition-opacity duration-300 ${
                  sidebarCollapsed ? 'lg:hidden' : ''
                }`}>
                  {item.label}
                </span>
                {/* Hover sweep effect */}
                {!isActive && (
                  <div className="absolute inset-0 bg-linear-to-r from-admin-primary/0 via-admin-primary/5 to-admin-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                )}
                {/* Tooltip para sidebar colapsado */}
                {sidebarCollapsed && (
                  <span className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-[#1e293b] text-white text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-[opacity,visibility] z-50 border border-[#334155]">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1e293b]">
          <div className={`flex items-center gap-3 mb-4 ${
            sidebarCollapsed ? 'lg:justify-center' : ''
          }`}>
            <div className="size-10 bg-[#1e293b] flex items-center justify-center shrink-0">
              <span className="text-admin-primary font-bold">
                {user?.nombre?.charAt(0) || user?.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`flex-1 min-w-0 transition-opacity duration-300 ${
              sidebarCollapsed ? 'lg:hidden' : ''
            }`}>
              <p className="text-sm font-medium text-white truncate">
                {user?.nombre || 'Administrador'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            title={sidebarCollapsed ? 'Cerrar sesión' : undefined}
            aria-label="Cerrar sesión"
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#1e293b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419] ${
              sidebarCollapsed ? 'lg:justify-center' : 'justify-center'
            }`}
          >
            <SignOut size={16} className="shrink-0" aria-hidden="true" />
            <span className={`transition-opacity duration-300 ${
              sidebarCollapsed ? 'lg:hidden' : ''
            }`}>
              Cerrar sesión
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-[#0f1419] border-b border-[#1e293b] shrink-0 relative">
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-admin-primary/20 to-transparent" />
          
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={handleOpenSidebar}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
              aria-label="Abrir menú"
              aria-expanded={sidebarOpen}
            >
              <List size={20} aria-hidden="true" />
            </button>
            {/* Desktop collapse button */}
            <button
              onClick={handleToggleSidebarCollapse}
              className="hidden lg:flex p-2 text-gray-400 hover:text-admin-primary transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
              title={sidebarCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
              aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
              aria-expanded={!sidebarCollapsed}
            >
              {sidebarCollapsed ? (
                <Sidebar size={20} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
              ) : (
                <SidebarSimple size={20} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative" data-notification-bell>
              <button 
                onClick={toggleNotifications}
                className="relative p-2 text-gray-400 hover:text-white transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
                aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
                aria-expanded={notificationsOpen}
              >
                <Bell size={20} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-size-4.5 flex items-center justify-center px-1 text-[10px] font-bold bg-admin-primary text-white leading-none" aria-hidden="true">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationPanel
                notifications={notifications}
                readIds={readIds}
                unreadCount={unreadCount}
                isOpen={notificationsOpen}
                onClose={closeNotifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
              />
            </div>
            <Link 
              href="/"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-admin-primary border border-[#334155] hover:border-admin-primary transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
            >
              Ver tienda
              <CaretRight size={12} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main id="admin-main-content" className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleCloseSidebar}
          aria-label="Cerrar menú"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleCloseSidebar()}
        />
      )}

      {/* Diálogo de confirmación de logout */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={handleCloseLogoutConfirm}
        onConfirm={handleLogoutConfirm}
        title="Cerrar sesión"
        message={`¿Estás seguro que deseas cerrar la sesión de administrador${user?.nombre ? `, ${user.nombre}` : ''}? Tendrás que volver a iniciar sesión para acceder al panel.`}
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
        type="danger"
        isLoading={isPending}
      />
    </div>
    </IconContext.Provider>
  );
}
