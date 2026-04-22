import Link from 'next/link';
import {
  Package,
  CaretRight,
  ClockCounterClockwise,
  Truck,
  CheckCircle,
  MapPin,
  Hourglass,
  XCircle,
  ArrowRight,
  SignIn,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Seguimiento de pedido | Soporte SicaBit',
  description: 'Rastrea el estado de tu envío, conoce los plazos de entrega y gestiona tus órdenes en SicaBit.',
};

const orderStatuses = [
  {
    icon: ClockCounterClockwise,
    title: 'Procesando',
    description: 'Tu pedido ha sido recibido y estamos preparándolo para envío.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10 border-yellow-400/20',
  },
  {
    icon: Package,
    title: 'Empaquetado',
    description: 'Tu pedido está empaquetado y listo para ser enviado.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10 border-blue-400/20',
  },
  {
    icon: Truck,
    title: 'En camino',
    description: 'Tu pedido está en ruta hacia la dirección de entrega.',
    color: 'text-accent',
    bgColor: 'bg-accent/10 border-accent/20',
  },
  {
    icon: CheckCircle,
    title: 'Entregado',
    description: 'Tu pedido fue entregado exitosamente.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10 border-emerald-400/20',
  },
  {
    icon: XCircle,
    title: 'Cancelado',
    description: 'El pedido fue cancelado. Si no lo solicitaste, contáctanos.',
    color: 'text-red-400',
    bgColor: 'bg-red-400/10 border-red-400/20',
  },
];

const deliveryTimes = [
  { zone: 'Sucre (ciudad)', time: '24 – 48 horas', icon: MapPin },
  { zone: 'Ciudades capitales', time: '3 – 5 días hábiles', icon: Truck },
  { zone: 'Zonas intermedias', time: '5 – 8 días hábiles', icon: Hourglass },
];

const trackingSteps = [
  { step: 1, title: 'Inicia sesión', description: 'Accede a tu cuenta con tu email y contraseña.' },
  { step: 2, title: 'Ve a "Mis Pedidos"', description: 'En tu panel de cuenta, selecciona la sección "Mis Pedidos".' },
  { step: 3, title: 'Selecciona tu orden', description: 'Haz clic en la orden que deseas rastrear para ver los detalles.' },
  { step: 4, title: 'Revisa el estado', description: 'Verás el estado actual, número de seguimiento y fecha estimada de entrega.' },
];

export default function SeguimientoPedidoPage() {
  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Header */}
      <section className="border-b border-line-soft bg-surface">
        <div className="container-custom py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm text-content-muted mb-6">
            <Link href="/soporte" className="hover:text-accent transition-colors">Soporte</Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-content">Seguimiento de pedido</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-14 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Package size={28} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-content font-heading">
                Seguimiento de pedido
              </h1>
              <p className="text-content-secondary mt-1">
                Rastrea el estado de tu envío y gestiona tus órdenes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access to Orders */}
      <section className="border-b border-line-soft py-8">
        <div className="container-custom">
          <div className="bg-accent/5 border border-accent/20 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-accent/10 border border-accent/20 flex items-center justify-center">
                <SignIn size={24} weight="duotone" className="text-accent" />
              </div>
              <div>
                <h2 className="font-bold text-content">Rastrea tu pedido ahora</h2>
                <p className="text-sm text-content-muted">Ingresa a tu cuenta para ver el estado de tus órdenes.</p>
              </div>
            </div>
            <Link
              href="/cuenta"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:shadow-[0_0_25px_rgba(57,255,20,0.25)] transition-all whitespace-nowrap"
            >
              Ir a mi cuenta
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* How to Track */}
      <section className="border-b border-line-soft py-12 md:py-16">
        <div className="container-custom">
          <h2 className="text-xl font-bold text-content font-heading mb-8">¿Cómo rastrear tu pedido?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trackingSteps.map((s) => (
              <div key={s.step} className="bg-surface border border-line-soft p-6 relative">
                <span className="text-4xl font-black text-accent/15 absolute top-4 right-4">{s.step}</span>
                <h3 className="font-bold text-content mb-2">{s.title}</h3>
                <p className="text-sm text-content-muted leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Statuses */}
      <section className="border-b border-line-soft py-12 md:py-16">
        <div className="container-custom">
          <h2 className="text-xl font-bold text-content font-heading mb-8">Estados de pedido</h2>
          <div className="max-w-2xl space-y-4">
            {orderStatuses.map((status) => {
              const Icon = status.icon;
              return (
                <div key={status.title} className="flex items-start gap-4 bg-surface border border-line-soft p-5">
                  <div className={`size-11 ${status.bgColor} border flex items-center justify-center shrink-0`}>
                    <Icon size={22} weight="duotone" className={status.color} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${status.color}`}>{status.title}</h3>
                    <p className="text-sm text-content-muted">{status.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery Times */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <h2 className="text-xl font-bold text-content font-heading mb-8">Tiempos de entrega estimados</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {deliveryTimes.map((dt) => {
              const Icon = dt.icon;
              return (
                <div key={dt.zone} className="bg-surface border border-line-soft p-6 text-center">
                  <Icon size={32} weight="thin" className="mx-auto mb-3 text-accent" />
                  <h3 className="font-bold text-content mb-1">{dt.zone}</h3>
                  <p className="text-lg text-accent font-semibold">{dt.time}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 bg-surface border border-line-soft p-5">
            <p className="text-sm text-content-muted leading-relaxed">
              <strong className="text-content">Nota:</strong> Los tiempos de entrega son estimados y pueden variar según disponibilidad del producto y
              condiciones logísticas. Una vez despachado tu pedido, recibirás un email con el número de seguimiento del courier.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-line-soft py-12">
        <div className="container-custom text-center">
          <p className="text-content-muted mb-4">¿Problemas con tu pedido?</p>
          <Link
            href="/soporte/contacto-directo"
            className="inline-flex items-center gap-2 px-6 py-3 border border-line-med text-content font-semibold hover:border-accent/50 hover:text-accent transition-colors"
          >
            Contactar con soporte
            <CaretRight size={14} weight="bold" />
          </Link>
        </div>
      </section>
    </div>
  );
}
