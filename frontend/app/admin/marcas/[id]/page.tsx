import { cache } from 'react';
import { redirect } from 'next/navigation';
import { serverFetch } from '../../../lib/server-fetch';
import EditMarcaClient from './EditMarcaClient';

interface Marca {
  id: string;
  nombre: string;
  slug: string;
  logoUrl: string | null;
  activo: boolean;
}

const getMarca = cache((id: string) =>
  serverFetch<Marca>(`/api/marcas/${id}`, { cache: 'no-store' })
);

export default async function EditarMarcaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const marca = await getMarca(id);

  if (!marca) {
    redirect('/admin/marcas');
  }

  return <EditMarcaClient id={id} initialMarca={marca} />;
}
