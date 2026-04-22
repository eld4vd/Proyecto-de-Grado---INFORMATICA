import { Suspense } from 'react';
import { cache } from 'react';
import Link from 'next/link';
import { Package, Users, ShoppingCart, TrendUp, TrendDown, CurrencyDollar, Clock, Pulse } from '@phosphor-icons/react/dist/ssr';
import { serverFetch } from '../../lib/server-fetch';

// ============================================================================
// TYPES
// ============================================================================

interface StatItem {
  valor: string | number;
  positivo?: boolean;
  cambio?: number;
  total?: number;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalClients: number;
  totalProducts: number;
  ordersGrowth?: number;
  revenueGrowth?: number;
  clientsGrowth?: number;
  ventasMes?: StatItem;
  ordenesPendientes?: StatItem;
  productosActivos?: StatItem;
  clientesNuevos?: StatItem;
}

interface Order {
  id: string;
  numero: string;
  cliente: string;
  total: number;
  estado: string;
  fecha: string;
}

interface TopProduct {
  id: string;
  nombre: string;
  marca: string;
  ventas: number;
  precio: number;
}

// ============================================================================
// DATA FETCHING WITH REACT.CACHE (Vercel Best Practice: server-cache-react)
// Per-request deduplication - multiple calls execute query only once
// ============================================================================

const getStats = cache(() => 
  serverFetch<Stats>('/api/admin/stats', { cache: 'no-store' })
);

const getRecentOrders = cache(() => 
  serverFetch<Order[]>('/api/admin/recent-orders', { cache: 'no-store' })
);

const getTopProducts = cache(() => 
  serverFetch<TopProduct[]>('/api/admin/top-products', { cache: 'no-store' })
);

// ============================================================================
// CONSTANTS & UTILITIES
// ============================================================================

const estadoConfig = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-500/10 text-yellow-500' },
  procesando: { label: 'Procesando', color: 'bg-blue-500/10 text-blue-500' },
  enviado: { label: 'Enviado', color: 'bg-purple-500/10 text-purple-500' },
  completado: { label: 'Completado', color: 'bg-emerald-500/10 text-emerald-400' },
  cancelado: { label: 'Cancelado', color: 'bg-admin-danger/10 text-admin-danger' },
} as const;

function formatRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  return `hace ${diffDays}d`;
}

// ============================================================================
// SKELETON COMPONENTS (Vercel Best Practice: rendering-hoist-jsx)
// Hoisted static JSX to avoid re-creation on each render
// ============================================================================

const statsSkeletons = (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-[#0f1419] border border-[#1e293b] p-6 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 bg-[#1e293b] rounded" />
          <div className="size-10 bg-[#1e293b] rounded" />
        </div>
        <div className="h-8 w-32 bg-[#1e293b] rounded mb-2" />
        <div className="h-4 w-20 bg-[#1e293b] rounded" />
      </div>
    ))}
  </div>
);

const ordersListSkeleton = (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-4 bg-[#0b0f1a] border border-[#1e293b] animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-[#1e293b] rounded" />
            <div className="h-3 w-24 bg-[#1e293b] rounded" />
          </div>
          <div className="h-6 w-20 bg-[#1e293b] rounded" />
        </div>
      </div>
    ))}
  </div>
);

const productsListSkeleton = (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-[#0b0f1a] border border-[#1e293b] animate-pulse">
        <div className="size-8 bg-[#1e293b] rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 bg-[#1e293b] rounded" />
          <div className="h-3 w-24 bg-[#1e293b] rounded" />
        </div>
        <div className="h-5 w-16 bg-[#1e293b] rounded" />
      </div>
    ))}
  </div>
);

// ============================================================================
// ASYNC SERVER COMPONENTS (Vercel Best Practice: server-parallel-fetching)
// Each component fetches its own data - React parallelizes automatically
// ============================================================================

/**
 * Stats Cards Component
 * Fetches and displays dashboard statistics
 */
async function StatsCards() {
  const stats = await getStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Ventas del mes */}
      <div className="group bg-[#0f1419] border border-[#1e293b] p-6 hover:border-admin-primary/30 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-admin-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500 font-medium">Ventas del Mes</p>
          <div className="size-10 bg-admin-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CurrencyDollar size={20} weight="duotone" className="text-admin-primary" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-white tabular-nums">
            ${stats?.ventasMes?.valor || '0.00'}
          </p>
          {stats?.ventasMes && (
            <div className="flex items-center gap-1.5">
              {stats.ventasMes.positivo ? (
                <TrendUp size={16} weight="duotone" className="text-emerald-400" aria-hidden="true" />
              ) : (
                <TrendDown size={16} weight="duotone" className="text-admin-danger" aria-hidden="true" />
              )}
              <span className={`text-sm font-medium tabular-nums ${
                stats.ventasMes.positivo ? 'text-emerald-400' : 'text-admin-danger'
              }`}>
                {stats.ventasMes.cambio}% vs mes anterior
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Órdenes Pendientes */}
      <div className="group bg-[#0f1419] border border-[#1e293b] p-6 hover:border-yellow-500/30 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-yellow-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500 font-medium">Órdenes Pendientes</p>
          <div className="size-10 bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock size={20} weight="duotone" className="text-yellow-500" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-white tabular-nums">
            {stats?.ordenesPendientes?.valor || 0}
          </p>
          <p className="text-sm text-gray-500 tabular-nums">
            de {stats?.ordenesPendientes?.total || 0} totales
          </p>
        </div>
      </div>

      {/* Productos Activos */}
      <div className="group bg-[#0f1419] border border-[#1e293b] p-6 hover:border-blue-500/30 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500 font-medium">Productos Activos</p>
          <div className="size-10 bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Package size={20} weight="duotone" className="text-blue-500" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-white tabular-nums">
            {stats?.productosActivos?.valor || 0}
          </p>
          <p className="text-sm text-gray-500">en catálogo</p>
        </div>
      </div>

      {/* Clientes Nuevos */}
      <div className="group bg-[#0f1419] border border-[#1e293b] p-6 hover:border-purple-500/30 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500 font-medium">Clientes Nuevos</p>
          <div className="size-10 bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={20} weight="duotone" className="text-purple-500" aria-hidden="true" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-white tabular-nums">
            {stats?.clientesNuevos?.valor || 0}
          </p>
          {stats?.clientesNuevos && (
            <div className="flex items-center gap-1.5">
              {stats.clientesNuevos.positivo ? (
                <TrendUp size={16} weight="duotone" className="text-emerald-400" aria-hidden="true" />
              ) : (
                <TrendDown size={16} weight="duotone" className="text-admin-danger" aria-hidden="true" />
              )}
              <span className={`text-sm font-medium tabular-nums ${
                stats.clientesNuevos.positivo ? 'text-emerald-400' : 'text-admin-danger'
              }`}>
                {stats.clientesNuevos.cambio}% este mes
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Recent Orders Component
 * Fetches and displays recent orders independently
 */
async function RecentOrders() {
  const recentOrders = await getRecentOrders();

  return (
    <div className="group bg-[#0f1419] border border-[#1e293b] hover:border-[#334155] transition-colors">
      <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShoppingCart size={20} weight="duotone" className="text-admin-primary" aria-hidden="true" />
          Órdenes Recientes
        </h2>
        <span className="text-xs text-gray-500">Últimas 5</span>
      </div>
      <div className="p-6">
        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div 
                key={order.id}
                className="flex items-center justify-between p-4 bg-[#0b0f1a] border border-[#1e293b] hover:border-admin-primary/20 transition-colors duration-200 group/item"
                style={{ 
                  contentVisibility: 'auto',
                  containIntrinsicSize: '0 76px'
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm font-medium text-white group-hover/item:text-admin-primary transition-colors">
                      {order.numero}
                    </p>
                    <span className={`text-xs px-2 py-0.5 ${
                      estadoConfig[order.estado as keyof typeof estadoConfig]?.color || 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {estadoConfig[order.estado as keyof typeof estadoConfig]?.label || order.estado}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{order.cliente}</p>
                  <p className="text-xs text-gray-600">{formatRelativeTime(order.fecha)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-admin-primary tabular-nums">${order.total}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12" role="status" aria-live="polite">
            <ShoppingCart size={48} weight="duotone" className="text-gray-700 mx-auto mb-3" aria-hidden="true" />
            <p className="text-gray-500 text-sm">No hay órdenes recientes</p>
          </div>
        )}
        <Link 
          href="/admin/ordenes"
          className="group/btn block mt-6 text-center py-3 text-sm text-admin-primary bg-[#0b0f1a] border border-[#1e293b] hover:border-admin-primary transition-colors relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
        >
          <span className="relative z-10">Ver todas las órdenes →</span>
          <div className="absolute inset-0 bg-admin-primary/5 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Top Products Component
 * Fetches and displays top selling products independently
 */
async function TopProducts() {
  const topProducts = await getTopProducts();

  return (
    <div className="group bg-[#0f1419] border border-[#1e293b] hover:border-[#334155] transition-colors">
      <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendUp size={20} weight="duotone" className="text-admin-primary" aria-hidden="true" />
          Productos Más Vendidos
        </h2>
        <span className="text-xs text-gray-500">Top 5</span>
      </div>
      <div className="p-6">
        {topProducts && topProducts.length > 0 ? (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div 
                key={product.id}
                className="flex items-center gap-4 p-4 bg-[#0b0f1a] border border-[#1e293b] hover:border-admin-primary/20 transition-colors duration-200 group/item"
                style={{ 
                  contentVisibility: 'auto',
                  containIntrinsicSize: '0 76px'
                }}
              >
                <div className={`size-8 flex items-center justify-center shrink-0 ${
                  index === 0 ? 'bg-admin-primary text-white' : 
                  index === 1 ? 'bg-gray-300 text-black' : 
                  index === 2 ? 'bg-amber-600 text-black' : 
                  'bg-[#1e293b] text-gray-400'
                }`}>
                  <span className="font-bold text-sm tabular-nums">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover/item:text-admin-primary transition-colors">
                    {product.nombre}
                  </p>
                  <p className="text-xs text-gray-500">{product.marca}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600 tabular-nums">{product.ventas} ventas</span>
                    {index < 3 && (
                      <span className="text-xs text-admin-primary/60" aria-hidden="true">🔥</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-admin-primary tabular-nums">${product.precio}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12" role="status" aria-live="polite">
            <Package size={48} weight="duotone" className="text-gray-700 mx-auto mb-3" aria-hidden="true" />
            <p className="text-gray-500 text-sm">No hay datos de ventas aún</p>
          </div>
        )}
        <Link 
          href="/admin/productos"
          className="group/btn block mt-6 text-center py-3 text-sm text-admin-primary bg-[#0b0f1a] border border-[#1e293b] hover:border-admin-primary transition-colors relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419]"
        >
          <span className="relative z-10">Ver todos los productos →</span>
          <div className="absolute inset-0 bg-admin-primary/5 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT (Vercel Best Practice: async-suspense-boundaries)
// Uses Suspense for streaming - shell renders immediately, data streams in
// ============================================================================

export default function AdminDashboardPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl relative">
      {/* Subtle background glow */}
      <div 
        className="absolute top-0 right-0 size-96 bg-admin-primary/3 rounded-full blur-[150px] pointer-events-none" 
        aria-hidden="true" 
      />
      
      {/* Header - Static, renders immediately */}
      <header className="mb-8 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 bg-admin-primary/10 border border-admin-primary/30 flex items-center justify-center">
            <Pulse size={20} weight="duotone" className="text-admin-primary" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-white text-wrap-balance">Dashboard</h1>
        </div>
        <p className="text-gray-400 ml-13">Resumen general de tu tienda en tiempo real</p>
      </header>

      {/* Stats Cards - Streams independently */}
      <Suspense fallback={statsSkeletons}>
        <StatsCards />
      </Suspense>

      {/* Pulse Status Banner - Static */}
      <div className="relative bg-linear-to-r from-admin-primary/5 to-transparent border border-admin-primary/20 p-6 mb-8 overflow-hidden">
        <div 
          className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,#6366f1/5_50%,transparent_100%)] animate-[gradient-shift_4s_ease_infinite]" 
          aria-hidden="true" 
        />
        <div className="flex items-start gap-4 relative z-10">
          <div className="size-12 bg-admin-primary/10 border border-admin-primary/30 flex items-center justify-center shrink-0">
            <Pulse size={24} weight="duotone" className="text-admin-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2 text-wrap-balance">
              Sistema Activo y Monitoreando
              <span className="flex items-center gap-1 text-xs font-medium text-admin-primary bg-admin-primary/10 px-2 py-0.5">
                <span className="size-1.5 bg-admin-primary rounded-full animate-pulse" aria-hidden="true" />
                <span className="sr-only">Estado: </span>LIVE
              </span>
            </h3>
            <p className="text-gray-400 text-sm">
              Todos los datos se actualizan en tiempo real. Las estadísticas reflejan el estado actual de tu tienda.
            </p>
          </div>
        </div>
      </div>

      {/* Two-column content - Each streams independently (parallel fetching) */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Suspense fallback={
          <div className="bg-[#0f1419] border border-[#1e293b] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-40 bg-[#1e293b] rounded animate-pulse" />
              <div className="h-4 w-16 bg-[#1e293b] rounded animate-pulse" />
            </div>
            {ordersListSkeleton}
          </div>
        }>
          <RecentOrders />
        </Suspense>

        <Suspense fallback={
          <div className="bg-[#0f1419] border border-[#1e293b] p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-48 bg-[#1e293b] rounded animate-pulse" />
              <div className="h-4 w-12 bg-[#1e293b] rounded animate-pulse" />
            </div>
            {productsListSkeleton}
          </div>
        }>
          <TopProducts />
        </Suspense>
      </div>
    </div>
  );
}
