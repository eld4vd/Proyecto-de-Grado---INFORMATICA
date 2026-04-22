import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión',
  description: 'Inicia sesión en tu cuenta SicaBit para acceder a tus pedidos, favoritos y ofertas exclusivas.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
