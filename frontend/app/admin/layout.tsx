import type { Metadata } from 'next';
import AdminShell from './AdminShell';

export const metadata: Metadata = {
  title: {
    default: 'Panel de Administración',
    template: '%s | Admin SicaBit',
  },
  description: 'Panel de administración de SicaBit. Gestiona productos, categorías, marcas, clientes y órdenes.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
