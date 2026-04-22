'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/app/lib/auth-context';
import { Package, Clock, Truck, CheckCircle, XCircle, CaretRight, Bag, CircleNotch, ArrowsClockwise, Calendar, MapPin, Laptop, ArrowLeft, Eye } from '@phosphor-icons/react';

interface Orden {
  id: string;
  numeroOrden: string;
  estado: string;
  estadoPago: string;
  subtotal: string | number;
  costoEnvio: string | number;
  total: string | number;
  direccionEnvioTexto: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    cantidad: number;
    precioUnitario: string | number;
    nombreProducto: string;
    producto: {
      id: string;
      nombre: string;
      imagenes: Array<{ url: string; esPrincipal: boolean }>;
    };
  }>;
  pagos: Array<{
    metodoPago: string;
    estado: string;
  }>;
}

// rendering-hoist-jsx: funciones puras fuera del componente para evitar re-creación
function formatPrice(precio: number | string) {
  const num = typeof precio === 'string' ? parseFloat(precio) : precio;
  return num.toLocaleString('es-BO', { minimumFractionDigits: 2 });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-BO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// js-index-maps: mapa estático de configuraciones de estado
const ESTADO_CONFIGS: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string; size?: number }> }> = {
  'PENDIENTE': { label: 'Pendiente', color: 'text-yellow-500 bg-yellow-500/10', icon: Clock },
  'PAGADO': { label: 'Pagado', color: 'text-blue-500 bg-blue-500/10', icon: CheckCircle },
  'ENVIADO': { label: 'En camino', color: 'text-purple-500 bg-purple-500/10', icon: Truck },
  'ENTREGADO': { label: 'Entregado', color: 'text-accent bg-accent/10', icon: CheckCircle },
  'CANCELADO': { label: 'Cancelado', color: 'text-red-500 bg-red-500/10', icon: XCircle },
};

const DEFAULT_ESTADO_CONFIG = { label: '', color: 'text-content-muted bg-gray-500/10', icon: Package as React.ComponentType<{ className?: string; size?: number }> };

function getEstadoConfig(estado: string) {
  return ESTADO_CONFIGS[estado] || { ...DEFAULT_ESTADO_CONFIG, label: estado };
}

const METODO_PAGO_LABELS: Record<string, string> = {
  // minúsculas (el backend aplica .toLowerCase() al guardar)
  'tarjeta_credito': 'Tarjeta de crédito/débito',
  'transferencia': 'Transferencia bancaria',
  'contra_entrega': 'Pago contra entrega',
  'tarjeta': 'Tarjeta de crédito/débito',
  'qr': 'Pago QR',
  'efectivo': 'Pago en efectivo',
  // mayúsculas (por retrocompatibilidad)
  'TARJETA_CREDITO': 'Tarjeta de crédito/débito',
  'TRANSFERENCIA': 'Transferencia bancaria',
  'CONTRA_ENTREGA': 'Pago contra entrega',
};

function getMetodoPagoLabel(metodo: string) {
  return METODO_PAGO_LABELS[metodo] || metodo;
}

function getProductImage(item: Orden['items'][0]) {
  if (item.producto?.imagenes && item.producto.imagenes.length > 0) {
    const principal = item.producto.imagenes.find(img => img.esPrincipal);
    return principal?.url || item.producto.imagenes[0].url;
  }
  return null;
}

function PedidosContent() {
  const { user, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const ordenIdParam = searchParams.get('orden');
  const autoOpenedRef = useRef(false);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);

  // Auto-abrir el modal UNA sola vez cuando lleguen las órdenes con ?orden=ID
  useEffect(() => {
    if (ordenIdParam && ordenes.length > 0 && !autoOpenedRef.current) {
      const found = ordenes.find(o => o.id === ordenIdParam);
      if (found) {
        autoOpenedRef.current = true;
        setSelectedOrden(found);
      }
    }
  }, [ordenIdParam, ordenes]);

  useEffect(() => {
    const fetchOrdenes = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/ordenes/cliente/${user.id}`, {
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error('Error al cargar pedidos');
        }

        const data = await res.json();
        setOrdenes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchOrdenes();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-surface-deep flex items-center justify-center">
        <div className="text-center">
          <CircleNotch size={40} className="text-accent animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="text-content-secondary">Cargando pedidos…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-deep flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="text-content-faint mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-content mb-2">Inicia sesión</h1>
          <p className="text-content-muted mb-6">Para ver tus pedidos, debes iniciar sesión</p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold rounded-xl hover:bg-accent-hover transition-colors"
          >
            Iniciar sesión
            <CaretRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Header */}
      <section className="bg-linear-to-b from-surface to-transparent py-8">
        <div className="container-custom">
          <Link 
            href="/cuenta"
            className="inline-flex items-center gap-2 text-content-secondary hover:text-content transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Volver a mi cuenta
          </Link>
          <h1 className="text-3xl font-bold text-content">Mis pedidos</h1>
          <p className="text-content-secondary mt-2">
            {ordenes.length} {ordenes.length === 1 ? 'pedido realizado' : 'pedidos realizados'}
          </p>
        </div>
      </section>

      <div className="container-custom pb-12">
        {error ? (
          <div className="text-center py-12">
            <XCircle size={64} className="text-red-500 mx-auto mb-4" />
            <p className="text-content-secondary mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-soft border border-line-med text-content rounded-xl hover:border-accent transition-colors"
            >
              <ArrowsClockwise size={16} />
              Reintentar
            </button>
          </div>
        ) : ordenes.length === 0 ? (
          <div className="text-center py-12">
            <Bag size={64} className="text-content-faint mx-auto mb-4" aria-hidden="true" />
            <h2 className="text-xl font-bold text-content mb-2">No tienes pedidos aún</h2>
            <p className="text-content-muted mb-6">Cuando realices una compra, tus pedidos aparecerán aquí</p>
            <Link 
              href="/productos" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold rounded-xl hover:bg-accent-hover transition-colors"
            >
              Explorar productos
              <CaretRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ordenes.map(orden => {
              const estadoConfig = getEstadoConfig(orden.estado);
              const EstadoIcon = estadoConfig.icon;
              const totalItems = orden.items.reduce((sum, item) => sum + item.cantidad, 0);
              
              return (
                <div 
                  key={orden.id} 
                  className="bg-surface border border-line-soft rounded-2xl overflow-hidden hover:border-line-med transition-colors"
                >
                  {/* Order header */}
                  <div className="p-4 md:p-6 border-b border-line-soft">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-xl flex items-center justify-center ${estadoConfig.color}`}>
                          <EstadoIcon size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-content">{orden.numeroOrden}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoConfig.color}`}>
                              {estadoConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-content-muted mt-1">
                            <Calendar size={14} />
                            {formatDate(orden.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-accent tabular-nums">${formatPrice(orden.total)}</p>
                        <p className="text-sm text-content-muted">{totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Products preview */}
                  <div className="p-4 md:p-6">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {orden.items.slice(0, 4).map(item => {
                        // js-cache-property-access: cachear resultado para evitar doble llamada
                        const imgUrl = getProductImage(item);
                        return (
                          <div 
                            key={item.id}
                            className="size-16 bg-surface-soft rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                          >
                            {imgUrl ? (
                              <Image
                                src={imgUrl}
                                alt={item.nombreProducto || item.producto.nombre}
                                width={64}
                                height={64}
                                className="object-contain"
                              />
                            ) : (
                              <Laptop size={32} className="text-placeholder-icon" />
                            )}
                          </div>
                        );
                      })}
                      {orden.items.length > 4 && (
                        <div className="size-16 bg-surface-soft rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-content-secondary">+{orden.items.length - 4}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-line-soft">
                      {orden.direccionEnvioTexto && (
                        <div className="flex items-center gap-2 text-sm text-content-muted truncate max-w-[60%]">
                          <MapPin size={16} className="shrink-0" />
                          <span className="truncate">{orden.direccionEnvioTexto}</span>
                        </div>
                      )}
                      <button
                        onClick={() => setSelectedOrden(orden)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-surface-soft text-content text-sm font-medium rounded-xl hover:bg-surface-hover transition-colors ml-auto"
                      >
                        <Eye size={16} />
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrden && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrden(null)}>
          <div
            className="bg-surface border border-line-med rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`Detalles del pedido ${selectedOrden.numeroOrden}`}
          >
            {/* Modal header */}
            <div className="p-5 md:p-6 border-b border-line-soft flex items-center justify-between">
              <div className="flex items-center gap-4">
                {(() => {
                  const config = getEstadoConfig(selectedOrden.estado);
                  const Icon = config.icon;
                  return (
                    <div className={`size-11 rounded-xl flex items-center justify-center ${config.color}`}>
                      <Icon size={20} />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-lg font-bold text-content">{selectedOrden.numeroOrden}</h2>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoConfig(selectedOrden.estado).color}`}>
                      {getEstadoConfig(selectedOrden.estado).label}
                    </span>
                    <span className="text-xs text-content-muted">{formatDateTime(selectedOrden.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrden(null)}
                aria-label="Cerrar detalles del pedido"
                className="p-2 hover:bg-surface-soft rounded-xl transition-colors text-content-secondary hover:text-content"
              >
                <XCircle size={24} aria-hidden="true" />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-5 md:p-6 overflow-y-auto max-h-[calc(90vh-160px)] overscroll-contain">
              {/* Timeline */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wider mb-4">Seguimiento</h3>
                <div className="flex items-center gap-0">
                  {[
                    { label: 'Confirmado', check: true },
                    { label: 'Pagado', check: ['PAGADO', 'ENVIADO', 'ENTREGADO'].includes(selectedOrden.estado) },
                    { label: 'Enviado', check: ['ENVIADO', 'ENTREGADO'].includes(selectedOrden.estado) },
                    { label: 'Entregado', check: selectedOrden.estado === 'ENTREGADO' },
                  ].map((step, i) => (
                    <div key={step.label} className="flex-1 flex flex-col items-center relative">
                      {i > 0 && (
                        <div className={`absolute top-3 right-1/2 w-full h-0.5 ${step.check ? 'bg-accent' : 'bg-line-med'}`} />
                      )}
                      <div className={`relative z-10 size-6 rounded-full flex items-center justify-center ${
                        step.check
                          ? 'bg-accent text-accent-contrast'
                          : 'bg-surface-hover border border-line-med text-content-faint'
                      }`}>
                        {step.check ? <CheckCircle size={14} /> : <div className="size-2 rounded-full bg-current" />}
                      </div>
                      <span className={`text-[11px] mt-1.5 ${step.check ? 'text-accent font-medium' : 'text-content-faint'}`}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                {selectedOrden.estado === 'CANCELADO' && (
                  <div className="mt-3 flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <XCircle size={16} className="text-red-500 shrink-0" />
                    <span className="text-sm text-red-400">Este pedido fue cancelado</span>
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wider mb-3">
                  Productos ({selectedOrden.items.reduce((sum, item) => sum + item.cantidad, 0)} artículos)
                </h3>
                <div className="space-y-2">
                  {selectedOrden.items.map(item => {
                    const precio = typeof item.precioUnitario === 'string' ? parseFloat(item.precioUnitario) : item.precioUnitario;
                    const imgUrl = getProductImage(item);
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-surface-card rounded-xl">
                        <div className="size-14 bg-surface-hover rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={item.nombreProducto || item.producto.nombre}
                              width={56}
                              height={56}
                              className="object-contain"
                            />
                          ) : (
                            <Laptop size={24} className="text-placeholder-icon" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/productos/${item.producto.id}`}
                            className="text-content text-sm font-medium hover:text-accent transition-colors line-clamp-1"
                            onClick={() => setSelectedOrden(null)}
                          >
                            {item.nombreProducto || item.producto.nombre}
                          </Link>
                          <p className="text-content-muted text-xs mt-0.5">
                            Cant. {item.cantidad} × ${formatPrice(precio)}
                          </p>
                        </div>
                        <p className="text-content font-semibold text-sm">${formatPrice(precio * item.cantidad)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info grid: shipping + payment */}
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {/* Shipping */}
                <div className="p-4 bg-surface-card rounded-xl">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <MapPin size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Envío</span>
                  </div>
                  <p className="text-content-bright text-sm leading-relaxed">
                    {selectedOrden.direccionEnvioTexto || 'No especificada'}
                  </p>
                </div>

                {/* Payment */}
                <div className="p-4 bg-surface-card rounded-xl">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <Package size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Pago</span>
                  </div>
                  <p className="text-content-bright text-sm">
                    {selectedOrden.pagos?.[0]
                      ? getMetodoPagoLabel(selectedOrden.pagos[0].metodoPago)
                      : selectedOrden.estadoPago === 'APROBADO'
                        ? 'Pago aprobado (método no registrado)'
                        : 'Pago pendiente'}
                  </p>
                  {selectedOrden.pagos?.[0] && (
                    <p className={`text-xs mt-1 ${selectedOrden.pagos[0].estado === 'APROBADO' ? 'text-accent' : 'text-yellow-500'}`}>
                      {selectedOrden.pagos[0].estado === 'APROBADO' ? '✓ Pago confirmado' : '⏳ Pago pendiente'}
                    </p>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-surface-card rounded-xl p-4">
                <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-wider mb-3">Resumen</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-content-secondary">Subtotal</span>
                    <span className="text-content">${formatPrice(selectedOrden.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-secondary">Envío</span>
                    <span className={Number(selectedOrden.costoEnvio) === 0 ? 'text-accent' : 'text-content'}>
                      {Number(selectedOrden.costoEnvio) === 0 ? 'Gratis' : `$${formatPrice(selectedOrden.costoEnvio)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-line-med">
                    <span className="text-content">Total</span>
                    <span className="text-accent tabular-nums">${formatPrice(selectedOrden.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-5 md:p-6 border-t border-line-soft">
              <button
                onClick={() => setSelectedOrden(null)}
                className="w-full px-4 py-3 bg-surface-soft text-content font-medium rounded-xl hover:bg-surface-hover transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper con Suspense para useSearchParams
export default function PedidosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-deep flex items-center justify-center">
        <div className="text-center">
          <CircleNotch size={40} className="text-accent animate-spin mx-auto mb-4" />
          <p className="text-content-secondary">Cargando pedidos…</p>
        </div>
      </div>
    }>
      <PedidosContent />
    </Suspense>
  );
}
