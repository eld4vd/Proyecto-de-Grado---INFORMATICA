import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Completa tu compra de forma segura en SicaBit. Pago con tarjeta, QR o transferencia bancaria.',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
