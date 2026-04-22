import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi Cuenta',
  description: 'Gestiona tu perfil, direcciones, pedidos y favoritos en SicaBit.',
};

export default function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
