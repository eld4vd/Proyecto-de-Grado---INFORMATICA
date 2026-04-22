import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Carrito de Compras',
  description: 'Revisa tu carrito de compras y procede al checkout. Pago seguro y envío a todo Bolivia.',
};

export default function CarritoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
