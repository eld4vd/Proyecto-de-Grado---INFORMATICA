'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, CreditCard, User, MapPin, Calendar, CircleNotch, Check, X, FileText } from '@phosphor-icons/react';
import Link from 'next/link';
import { StatusBadge } from '../../components/StatusBadge';

interface ItemOrden {
  id: string;
  cantidad: number;
  precioUnitario: string | number;
  subtotal: string | number;
  nombreProducto: string | null;
  sku: string | null;
  producto?: {
    id: string;
    nombre: string;
    imagenes?: { url: string; esPrincipal: boolean }[];
  };
}

interface Pago {
  id: string;
  monto: string | number;
  metodoPago: string;
  transaccionId: string | null;
  estado: string;
  fechaPago: string | null;
}

interface Envio {
  id: string;
  numeroSeguimiento: string | null;
  transportista: string | null;
  estado: string;
  enviadoEn: string | null;
  entregadoEn: string | null;
}

interface Orden {
  id: string;
  numeroOrden: string;
  estado: string;
  estadoPago: string;
  subtotal: string | number;
  descuento: string | number;
  costoEnvio: string | number;
  total: string | number;
  direccionEnvioTexto: string | null;
  notas: string | null;
  createdAt: string;
  cliente?: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string | null;
  };
  items?: ItemOrden[];
  pagos?: Pago[];
  envio?: Envio | null;
}

const ESTADOS_ORDEN = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
const ESTADOS_PAGO = ['PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO'];

export interface OrdenDetalleClientProps {
  id: string;
  initialOrden: Orden;
}

export default function OrdenDetalleClient({ id, initialOrden }: OrdenDetalleClientProps) {
  const router = useRouter();
  const [orden, setOrden] = useState<Orden | null>(initialOrden);
  const [loading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Actualizar estado
  const updateEstado = async (nuevoEstado: string) => {
    if (!orden) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/ordenes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrden(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Actualizar estado de pago
  const updateEstadoPago = async (nuevoEstado: string) => {
    if (!orden) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/ordenes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ estadoPago: nuevoEstado }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrden(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear precio
  const formatPrice = (precio: string | number): string => {
    const num = typeof precio === 'string' ? parseFloat(precio) : precio;
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(num);
  };

  // Mapear estados
  const getEstadoStatus = (estado: string): 'active' | 'inactive' | 'pending' | 'warning' => {
    switch (estado) {
      case 'ENTREGADO': case 'APROBADO': return 'active';
      case 'CANCELADO': case 'RECHAZADO': return 'inactive';
      case 'ENVIADO': case 'REEMBOLSADO': case 'EN_CAMINO': return 'warning';
      default: return 'pending';
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center min-h-100">
          <CircleNotch size={32} className="text-admin-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!orden) return null;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/ordenes"
            scroll={false}
            className="p-2 text-gray-500 hover:text-white hover:bg-[#1e293b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
            aria-label="Volver a lista de órdenes"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Orden #{orden.numeroOrden}
            </h1>
            <p className="text-gray-500">{formatDate(orden.createdAt)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <StatusBadge status={getEstadoStatus(orden.estado)} label={orden.estado} />
          <StatusBadge status={getEstadoStatus(orden.estadoPago)} label={`Pago: ${orden.estadoPago}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Items y totales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-[#0f1419] border border-[#1e293b]">
            <div className="p-4 border-b border-[#1e293b] flex items-center gap-2">
              <Package size={16} className="text-admin-primary" aria-hidden="true" />
              <h3 className="text-lg font-medium text-white">Productos</h3>
              <span className="ml-auto text-sm text-gray-500 tabular-nums">
                {orden.items?.length || 0} items
              </span>
            </div>
            
            <div className="divide-y divide-[#1e293b]">
              {orden.items?.map((item) => {
                const imagen = item.producto?.imagenes?.find(i => i.esPrincipal)?.url 
                  || item.producto?.imagenes?.[0]?.url;
                return (
                  <div key={item.id} className="p-4 flex items-center gap-4">
                    {imagen ? (
                      <Image src={imagen} alt="" width={48} height={48} className="size-12 object-cover" />
                    ) : (
                      <div className="size-12 bg-[#1e293b] flex items-center justify-center">
                        <Package size={20} className="text-gray-500" aria-hidden="true" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {item.nombreProducto || item.producto?.nombre || 'Producto'}
                      </p>
                      <p className="text-sm text-gray-500">
                        SKU: {item.sku || '-'} × {item.cantidad}
                      </p>
                    </div>
                    <div className="text-right tabular-nums">
                      <p className="text-admin-primary font-medium">{formatPrice(item.subtotal)}</p>
                      <p className="text-xs text-gray-500">{formatPrice(item.precioUnitario)} c/u</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totales */}
            <div className="p-4 border-t border-[#1e293b] space-y-2 tabular-nums">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(orden.subtotal)}</span>
              </div>
              {parseFloat(String(orden.descuento)) > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>Descuento</span>
                  <span className="text-admin-danger">-{formatPrice(orden.descuento)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>Envío</span>
                <span>{formatPrice(orden.costoEnvio)}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-[#334155]">
                <span>Total</span>
                <span className="text-admin-primary">{formatPrice(orden.total)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {orden.notas && (
            <div className="bg-[#0f1419] border border-[#1e293b] p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-gray-500" aria-hidden="true" />
                <h3 className="font-medium text-white">Notas</h3>
              </div>
              <p className="text-gray-400">{orden.notas}</p>
            </div>
          )}
        </div>

        {/* Columna derecha - Info */}
        <div className="space-y-6">
          {/* Actualizar estado */}
          <div className="bg-[#0f1419] border border-[#1e293b] p-4">
            <h3 className="font-medium text-white mb-3">Estado de la orden</h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Cambiar estado de la orden">
              {ESTADOS_ORDEN.map((estado) => (
                <button
                  key={estado}
                  onClick={() => updateEstado(estado)}
                  disabled={updating || orden.estado === estado}
                  aria-pressed={orden.estado === estado}
                  className={`px-3 py-1.5 text-xs border transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary ${
                    orden.estado === estado
                      ? 'bg-admin-primary text-white border-admin-primary'
                      : 'bg-transparent text-gray-400 border-[#334155] hover:border-admin-primary hover:text-white'
                  }`}
                >
                  {estado}
                </button>
              ))}
            </div>
          </div>

          {/* Actualizar estado de pago */}
          <div className="bg-[#0f1419] border border-[#1e293b] p-4">
            <h3 className="font-medium text-white mb-3">Estado de pago</h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Cambiar estado de pago">
              {ESTADOS_PAGO.map((estado) => (
                <button
                  key={estado}
                  onClick={() => updateEstadoPago(estado)}
                  disabled={updating || orden.estadoPago === estado}
                  aria-pressed={orden.estadoPago === estado}
                  className={`px-3 py-1.5 text-xs border transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary ${
                    orden.estadoPago === estado
                      ? 'bg-admin-primary text-white border-admin-primary'
                      : 'bg-transparent text-gray-400 border-[#334155] hover:border-admin-primary hover:text-white'
                  }`}
                >
                  {estado}
                </button>
              ))}
            </div>
          </div>

          {/* Cliente */}
          <div className="bg-[#0f1419] border border-[#1e293b] p-4">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-admin-primary" aria-hidden="true" />
              <h3 className="font-medium text-white">Cliente</h3>
            </div>
            {orden.cliente && (
              <div className="space-y-2">
                <Link 
                  href={`/admin/clientes/${orden.cliente.id}`}
                  className="font-medium text-white hover:text-admin-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
                >
                  {orden.cliente.nombre} {orden.cliente.apellido}
                </Link>
                <p className="text-sm text-gray-400">{orden.cliente.email}</p>
                {orden.cliente.telefono && (
                  <p className="text-sm text-gray-500">{orden.cliente.telefono}</p>
                )}
              </div>
            )}
          </div>

          {/* Dirección de envío */}
          {orden.direccionEnvioTexto && (
            <div className="bg-[#0f1419] border border-[#1e293b] p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-admin-primary" aria-hidden="true" />
                <h3 className="font-medium text-white">Dirección de envío</h3>
              </div>
              <p className="text-gray-400 whitespace-pre-line">{orden.direccionEnvioTexto}</p>
            </div>
          )}

          {/* Información de envío */}
          {orden.envio && (
            <div className="bg-[#0f1419] border border-[#1e293b] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck size={16} className="text-admin-primary" aria-hidden="true" />
                <h3 className="font-medium text-white">Envío</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado:</span>
                  <StatusBadge status={getEstadoStatus(orden.envio.estado)} label={orden.envio.estado} />
                </div>
                {orden.envio.transportista && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transportista:</span>
                    <span className="text-gray-300">{orden.envio.transportista}</span>
                  </div>
                )}
                {orden.envio.numeroSeguimiento && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Seguimiento:</span>
                    <span className="text-gray-300">{orden.envio.numeroSeguimiento}</span>
                  </div>
                )}
                {orden.envio.enviadoEn && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Enviado:</span>
                    <span className="text-gray-300">{formatDate(orden.envio.enviadoEn).split(',')[0]}</span>
                  </div>
                )}
                {orden.envio.entregadoEn && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entregado:</span>
                    <span className="text-gray-300">{formatDate(orden.envio.entregadoEn).split(',')[0]}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pagos */}
          {orden.pagos && orden.pagos.length > 0 && (
            <div className="bg-[#0f1419] border border-[#1e293b] p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-admin-primary" aria-hidden="true" />
                <h3 className="font-medium text-white">Pagos</h3>
              </div>
              <div className="space-y-3">
                {orden.pagos.map((pago) => (
                  <div key={pago.id} className="p-2 bg-[#1e293b] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium tabular-nums">{formatPrice(pago.monto)}</span>
                      <StatusBadge status={getEstadoStatus(pago.estado)} label={pago.estado} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {pago.metodoPago} {pago.transaccionId && `• ${pago.transaccionId}`}
                    </p>
                    {pago.fechaPago && (
                      <p className="text-xs text-gray-500">{formatDate(pago.fechaPago)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
