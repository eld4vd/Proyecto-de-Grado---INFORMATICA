import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta',
  description: 'Regístrate en SicaBit para acceder a ofertas exclusivas, seguimiento de pedidos y envío gratis en tu primera compra.',
};

export default function RegistroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
