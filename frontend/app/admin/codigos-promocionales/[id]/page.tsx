import { cache } from 'react';
import { redirect } from 'next/navigation';
import { serverFetch } from '../../../lib/server-fetch';
import EditCodigoPromocionalClient from '../EditCodigoPromocionalClient';

interface CodigoPromocional {
  id: string;
  codigo: string;
  descuento: number;
  esPorcentaje: boolean;
  activo: boolean;
  fechaExpiracion: string | null;
  usosMaximos: number | null;
  usosActuales: number;
  createdAt: string;
}

const getCodigo = cache((id: string) =>
  serverFetch<CodigoPromocional>(`/api/codigos-promocionales/admin/${id}`, {
    cache: 'no-store',
  }),
);

export default async function EditarCodigoPromocionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const codigo = await getCodigo(id);

  if (!codigo) {
    redirect('/admin/codigos-promocionales');
  }

  return <EditCodigoPromocionalClient id={id} initialCodigo={codigo} />;
}
