import { cache } from 'react';
import { serverFetch } from '../../lib/server-fetch';
import ClientesClient from './ClientesClient';

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  nitCi: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  _count?: {
    ordenes: number;
    direcciones: number;
  };
}

interface PaginationMeta {
  total: number;
  skip: number;
  take: number;
  totalPages: number;
}

interface ClientesResponse {
  data: Cliente[];
  meta: PaginationMeta;
}

const getClientes = cache(() =>
  serverFetch<ClientesResponse>('/api/clientes?skip=0&take=10', { cache: 'no-store' })
);

export default async function ClientesPage() {
  const response = await getClientes();

  return (
    <ClientesClient
      initialData={response?.data || []}
      initialMeta={response?.meta || { total: 0, skip: 0, take: 10, totalPages: 0 }}
    />
  );
}
