import { cache } from 'react';
import { redirect } from 'next/navigation';
import { serverFetch } from '../../../lib/server-fetch';
import ClienteDetalleClient from './ClienteDetalleClient';

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  nitCi: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  direcciones?: {
    id: string;
    calle: string;
    ciudad: string;
    departamento: string;
    codigoPostal: string | null;
    esPredeterminada: boolean;
  }[];
  ordenes?: {
    id: string;
    numeroOrden: string;
    estado: string;
    estadoPago: string;
    total: string | number;
    createdAt: string;
  }[];
}

const getCliente = cache((id: string) =>
  serverFetch<Cliente>(`/api/clientes/${id}`, { cache: 'no-store' })
);

export default async function DetalleClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await getCliente(id);

  if (!cliente) {
    redirect('/admin/clientes');
  }

  return <ClienteDetalleClient initialCliente={cliente} />;
}
