import Link from 'next/link';
import {
  Lifebuoy,
  CaretRight,
  Truck,
  CreditCard,
  ArrowUUpLeft,
  CheckCircle,
  Info,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Centro de ayuda | Soporte SicaBit',
  description: 'Políticas de envío, métodos de pago, devoluciones y toda la información que necesitas sobre SicaBit.',
};

const shippingInfo = [
  { zone: 'Sucre (ciudad)', time: '24 – 48 horas', free: 'Gratis en compras mayores a Bs. 500' },
  { zone: 'Ciudades capitales', time: '3 – 5 días hábiles', free: 'Costo según peso y destino' },
  { zone: 'Zonas intermedias', time: '5 – 8 días hábiles', free: 'Costo según peso y destino' },
];

const paymentMethods = [
  'Tarjetas de crédito y débito (Visa, Mastercard)',
  'Transferencia bancaria',
  'Pago por QR',
  'Pago contra entrega (solo Sucre)',
  'Cuotas sin interés con tarjetas seleccionadas',
];

const returnPolicy = [
  { label: 'Plazo de devolución', detail: '7 días hábiles desde la recepción del producto.' },
  { label: 'Condición', detail: 'Producto en empaque original, sin uso y con todos los accesorios.' },
  { label: 'Proceso', detail: 'Contáctanos por WhatsApp o formulario indicando tu número de orden.' },
  { label: 'Reembolso', detail: 'Se procesa en 5 a 10 días hábiles al método de pago original.' },
  { label: 'Cambios', detail: 'Puedes cambiar un producto por otro dentro del mismo plazo. Se ajusta la diferencia de precio.' },
];

export default function CentroAyudaPage() {
  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Header */}
      <section className="border-b border-line-soft bg-surface">
        <div className="container-custom py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm text-content-muted mb-6">
            <Link href="/soporte" className="hover:text-accent transition-colors">Soporte</Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-content">Centro de ayuda</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-14 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Lifebuoy size={28} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-content font-heading">
                Centro de ayuda
              </h1>
              <p className="text-content-secondary mt-1">
                Políticas de envío, pagos, devoluciones e información general.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Envíos */}
      <section className="border-b border-line-soft py-12 md:py-16">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Truck size={20} weight="duotone" className="text-accent" />
            </div>
            <h2 className="text-xl font-bold text-content font-heading">Envíos y entregas</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {shippingInfo.map((s) => (
              <div key={s.zone} className="bg-surface border border-line-soft p-5">
                <h3 className="font-bold text-content mb-1">{s.zone}</h3>
                <p className="text-accent font-semibold mb-2">{s.time}</p>
                <p className="text-sm text-content-muted">{s.free}</p>
              </div>
            ))}
          </div>
          <div className="bg-accent/5 border border-accent/20 p-4 flex items-start gap-3">
            <Info size={18} weight="fill" className="text-accent mt-0.5 shrink-0" />
            <p className="text-sm text-content-secondary">
              Realizamos envíos a las 9 ciudades capitales y zonas intermedias a través de empresas de courier aliadas. Una vez despachado, recibirás un email con el número de seguimiento.
            </p>
          </div>
        </div>
      </section>

      {/* Métodos de pago */}
      <section className="border-b border-line-soft py-12 md:py-16">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <CreditCard size={20} weight="duotone" className="text-accent" />
            </div>
            <h2 className="text-xl font-bold text-content font-heading">Métodos de pago</h2>
          </div>
          <div className="bg-surface border border-line-soft p-6 max-w-2xl">
            <ul className="space-y-3">
              {paymentMethods.map((method) => (
                <li key={method} className="flex items-start gap-2 text-sm text-content-secondary">
                  <CheckCircle size={16} weight="fill" className="text-accent mt-0.5 shrink-0" />
                  {method}
                </li>
              ))}
            </ul>
            <p className="text-sm text-content-muted mt-4 pt-4 border-t border-line-soft">
              Emitimos factura electrónica. Ingresa tu NIT y razón social al momento de la compra. Si olvidaste solicitarla, contáctanos dentro de las 48 horas.
            </p>
          </div>
        </div>
      </section>

      {/* Devoluciones y cambios */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="size-10 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <ArrowUUpLeft size={20} weight="duotone" className="text-accent" />
            </div>
            <h2 className="text-xl font-bold text-content font-heading">Devoluciones y cambios</h2>
          </div>
          <div className="max-w-2xl space-y-4">
            {returnPolicy.map((item) => (
              <div key={item.label} className="bg-surface border border-line-soft p-5">
                <h3 className="font-bold text-content mb-1">{item.label}</h3>
                <p className="text-sm text-content-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-line-soft py-12">
        <div className="container-custom text-center">
          <p className="text-content-muted mb-4">¿Necesitas más ayuda?</p>
          <Link
            href="/soporte/contacto-directo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:shadow-[0_0_25px_rgba(57,255,20,0.25)] transition-all"
          >
            Contactar con soporte
            <CaretRight size={14} weight="bold" />
          </Link>
        </div>
      </section>
    </div>
  );
}
