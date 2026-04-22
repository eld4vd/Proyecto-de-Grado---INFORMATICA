'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Envelope, Phone, Calendar, MapPin, Bag, CircleNotch, User, CreditCard } from '@phosphor-icons/react';
import Link from 'next/link';
import { StatusBadge } from '../../components/StatusBadge';

interface Direccion {
  id: string;
  calle: string;
  ciudad: string;
  departamento: string;
  codigoPostal: string | null;
  esPredeterminada: boolean;
}

interface Orden {
  id: string;
  numeroOrden: string;
  estado: string;
  estadoPago: string;
  total: string | number;
  createdAt: string;
}

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  nitCi: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  direcciones?: Direccion[];
  ordenes?: Orden[];
}

export interface ClienteDetalleClientProps {
  initialCliente: Cliente;
}

export default function ClienteDetalleClient({ initialCliente }: ClienteDetalleClientProps) {
  const router = useRouter();
  const [cliente] = useState<Cliente | null>(initialCliente);
  const [loading] = useState(false);

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

  // Mapear estado de orden
  const getEstadoStatus = (estado: string): 'active' | 'inactive' | 'pending' | 'warning' => {
    switch (estado) {
      case 'ENTREGADO': return 'active';
      case 'CANCELADO': return 'inactive';
      case 'ENVIADO': return 'warning';
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

  if (!cliente) return null;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/clientes"
          scroll={false}
          className="p-2 text-gray-500 hover:text-white hover:bg-[#1e293b] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary"
          aria-label="Volver a lista de clientes"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {cliente.nombre} {cliente.apellido}
          </h1>
          <p className="text-gray-500">Detalles del cliente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info principal */}
        <div className="lg:col-span-1 space-y-6">
          {/* Información de contacto */}
          <div className="bg-[#0f1419] border border-[#1e293b] p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-16 bg-[#1e293b] flex items-center justify-center text-admin-primary text-2xl font-bold">
                {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-medium text-white">
                  {cliente.nombre} {cliente.apellido}
                </h2>
                <p className="text-sm text-gray-500">Cliente desde {formatDate(cliente.createdAt).split(',')[0]}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Envelope size={16} className="text-gray-500" aria-hidden="true" />
                <span className="text-gray-300">{cliente.email}</span>
              </div>
              
              {cliente.telefono && (
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-500" aria-hidden="true" />
                  <span className="text-gray-300">{cliente.telefono}</span>
                </div>
              )}
              
              {cliente.nitCi && (
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-gray-500" aria-hidden="true" />
                  <span className="text-gray-300">NIT/CI: {cliente.nitCi}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-gray-500" aria-hidden="true" />
                <div>
                  <span className="text-gray-500 text-sm">Último acceso:</span>
                  <p className="text-gray-300">{formatDate(cliente.lastLoginAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Direcciones */}
          <div className="bg-[#0f1419] border border-[#1e293b] p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-admin-primary" aria-hidden="true" />
              Direcciones
            </h3>
            
            {cliente.direcciones && cliente.direcciones.length > 0 ? (
              <div className="space-y-3">
                {cliente.direcciones.map((dir) => (
                  <div 
                    key={dir.id} 
                    className={`p-3 border ${dir.esPredeterminada ? 'border-admin-primary bg-admin-primary/5' : 'border-[#334155]'}`}
                  >
                    {dir.esPredeterminada && (
                      <span className="text-xs text-admin-primary font-medium mb-1 block">Predeterminada</span>
                    )}
                    <p className="text-gray-300">{dir.calle}</p>
                    <p className="text-gray-500 text-sm">
                      {dir.ciudad}, {dir.departamento}
                      {dir.codigoPostal && ` - ${dir.codigoPostal}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No hay direcciones registradas</p>
            )}
          </div>
        </div>

        {/* Órdenes */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f1419] border border-[#1e293b]">
            <div className="p-4 border-b border-[#1e293b] flex items-center gap-2">
              <Bag size={16} className="text-admin-primary" aria-hidden="true" />
              <h3 className="text-lg font-medium text-white">Historial de órdenes</h3>
              <span className="ml-auto text-sm text-gray-500 tabular-nums">
                {cliente.ordenes?.length || 0} órdenes
              </span>
            </div>
            
            {cliente.ordenes && cliente.ordenes.length > 0 ? (
              <div className="divide-y divide-[#1e293b]">
                {cliente.ordenes.map((orden) => (
                  <Link
                    key={orden.id}
                    href={`/admin/ordenes/${orden.id}`}
                    className="flex items-center justify-between p-4 hover:bg-surface-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-primary focus-visible:ring-inset"
                  >
                    <div>
                      <p className="font-medium text-white">#{orden.numeroOrden}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(orden.createdAt).split(',')[0]}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge 
                        status={getEstadoStatus(orden.estado)} 
                        label={orden.estado}
                      />
                      <span className="text-admin-primary font-medium tabular-nums">
                        {formatPrice(orden.total)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bag size={48} className="text-gray-600 mx-auto mb-3" aria-hidden="true" />
                <p className="text-gray-500">Este cliente no ha realizado órdenes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
