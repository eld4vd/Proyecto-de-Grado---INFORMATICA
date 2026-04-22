import { cache } from 'react';
import { redirect } from 'next/navigation';
import { serverFetch } from '../../../lib/server-fetch';
import OrdenDetalleClient from './OrdenDetalleClient';

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
  items?: {
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
  }[];
  pagos?: {
    id: string;
    monto: string | number;
    metodoPago: string;
    transaccionId: string | null;
    estado: string;
    fechaPago: string | null;
  }[];
  envio?: {
    id: string;
    numeroSeguimiento: string | null;
    transportista: string | null;
    estado: string;
    enviadoEn: string | null;
    entregadoEn: string | null;
  } | null;
}

const getOrden = cache((id: string) =>
  serverFetch<Orden>(`/api/ordenes/${id}`, { cache: 'no-store' })
);

export default async function DetalleOrdenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orden = await getOrden(id);

  if (!orden) {
    redirect('/admin/ordenes');
  }

  return <OrdenDetalleClient id={id} initialOrden={orden} />;
}
