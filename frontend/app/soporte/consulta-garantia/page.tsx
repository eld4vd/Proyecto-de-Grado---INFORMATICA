import Link from 'next/link';
import {
  ShieldCheck,
  CaretRight,
  CheckCircle,
  XCircle,
  ListNumbers,
  Clock,
  Wrench,
  WhatsappLogo,
  Warning,
  Info,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Consulta de garantía | Soporte SicaBit',
  description: 'Consulta la cobertura de garantía de tus productos, proceso de reclamos y condiciones de servicio.',
};

const warrantyTiers = [
  { category: 'Laptops y PCs', period: '24 meses', details: 'Garantía oficial del fabricante. Incluye defectos de hardware y componentes.' },
  { category: 'Monitores', period: '12 meses', details: 'Cobertura contra defectos de pantalla, píxeles muertos (según política del fabricante) y fuente.' },
  { category: 'Periféricos (mouse, teclado)', period: '12 meses', details: 'Defectos de fabricación en switches, sensores, conectividad y cables.' },
  { category: 'Auriculares y parlantes', period: '6 – 12 meses', details: 'Según marca. Cubre defectos en drivers de audio, micrófono y conectividad.' },
  { category: 'Componentes (RAM, SSD, GPU)', period: '12 – 36 meses', details: 'Varía por marca y componente. Algunas memorias RAM tienen garantía de por vida del fabricante.' },
  { category: 'Accesorios', period: '3 – 6 meses', details: 'Cables, adaptadores y accesorios menores. Cubre defectos de fabricación.' },
];

const claimSteps = [
  { step: 1, title: 'Reúne tu documentación', description: 'Ten a mano tu factura de compra, número de orden y fotos/video del problema.' },
  { step: 2, title: 'Contáctanos', description: 'Comunícate vía WhatsApp o formulario de contacto indicando el problema y tu número de orden.' },
  { step: 3, title: 'Evaluación', description: 'Nuestro equipo técnico evaluará el caso y te indicará los siguientes pasos (envío del producto, diagnóstico remoto, etc.).' },
  { step: 4, title: 'Resolución', description: 'Según el caso: reparación, reemplazo o reembolso. Te mantendremos informado en todo momento.' },
];

const covered = [
  'Defectos de fabricación',
  'Fallas en componentes de hardware',
  'Problemas de software preinstalado',
  'Píxeles muertos (según política del fabricante)',
  'Fallas en la batería (capacidad < 80% durante el período de garantía)',
];

const notCovered = [
  'Daño por golpes, caídas o líquidos',
  'Modificaciones no autorizadas o apertura del equipo',
  'Desgaste natural (arañazos superficiales, desgaste de teclas)',
  'Daño por voltaje o uso de cargadores no originales',
  'Problemas causados por malware o software de terceros',
  'Pérdida de datos (siempre realiza respaldos)',
];

export default function ConsultaGarantiaPage() {
  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Header */}
      <section className="border-b border-line-soft bg-surface">
        <div className="container-custom py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm text-content-muted mb-6">
            <Link href="/soporte" className="hover:text-accent transition-colors">Soporte</Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-content">Consulta de garantía</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-14 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <ShieldCheck size={28} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-content font-heading">
                Consulta de garantía
              </h1>
              <p className="text-content-secondary mt-1">
                Consulta el periodo de garantía de tu producto y accede a la cobertura.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Warranty Periods */}
      <section className="border-b border-line-soft py-12 md:py-16">
        <div className="container-custom">
          <div className="flex items-center gap-2 mb-8">
            <Clock size={20} weight="duotone" className="text-accent" />
            <h2 className="text-xl font-bold text-content font-heading">Periodos de garantía por categoría</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-line-soft">
                  <th className="py-3 pr-4 text-sm font-semibold text-content">Categoría</th>
                  <th className="py-3 pr-4 text-sm font-semibold text-content">Periodo</th>
                  <th className="py-3 text-sm font-semibold text-content hidden sm:table-cell">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {warrantyTiers.map((tier) => (
                  <tr key={tier.category} className="border-b border-line-soft last:border-0">
                    <td className="py-4 pr-4 text-sm font-medium text-content">{tier.category}</td>
                    <td className="py-4 pr-4 text-sm text-accent font-semibold whitespace-nowrap">{tier.period}</td>
                    <td className="py-4 text-sm text-content-muted hidden sm:table-cell">{tier.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* What's Covered / Not Covered */}
      <section className="border-b border-line-soft py-12 md:py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-surface border border-line-soft p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle size={20} weight="fill" className="text-emerald-400" />
                <h2 className="text-lg font-bold text-content font-heading">Qué cubre la garantía</h2>
              </div>
              <ul className="space-y-3">
                {covered.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-content-secondary">
                    <CheckCircle size={16} weight="fill" className="text-emerald-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface border border-line-soft p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <XCircle size={20} weight="fill" className="text-red-400" />
                <h2 className="text-lg font-bold text-content font-heading">Qué NO cubre la garantía</h2>
              </div>
              <ul className="space-y-3">
                {notCovered.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-content-secondary">
                    <XCircle size={16} weight="fill" className="text-red-400 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Process */}
      <section className="border-b border-line-soft py-12 md:py-16">
        <div className="container-custom">
          <div className="flex items-center gap-2 mb-8">
            <ListNumbers size={20} weight="duotone" className="text-accent" />
            <h2 className="text-xl font-bold text-content font-heading">Proceso de reclamo</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {claimSteps.map((s) => (
              <div key={s.step} className="bg-surface border border-line-soft p-6 relative">
                <span className="text-4xl font-black text-accent/15 absolute top-4 right-4">{s.step}</span>
                <h3 className="font-bold text-content mb-2">{s.title}</h3>
                <p className="text-sm text-content-muted leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="space-y-4">
            <div className="bg-accent/5 border border-accent/20 p-5 flex items-start gap-3">
              <Info size={20} weight="fill" className="text-accent mt-0.5 shrink-0" />
              <p className="text-sm text-content-secondary">
                <strong className="text-content">Importante:</strong> Conserva siempre tu factura de compra. Es el documento principal para hacer válida tu garantía.
                Sin ella, no podremos procesar tu reclamo.
              </p>
            </div>
            <div className="bg-yellow-400/5 border border-yellow-400/20 p-5 flex items-start gap-3">
              <Warning size={20} weight="fill" className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-sm text-content-secondary">
                <strong className="text-content">Garantía extendida:</strong> Algunos fabricantes ofrecen extensión de garantía registrando el producto
                en su sitio web oficial. Consulta con nuestro equipo si tu producto es elegible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-line-soft py-12">
        <div className="container-custom text-center">
          <p className="text-content-muted mb-4">¿Necesitas hacer un reclamo de garantía?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/59170000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold hover:bg-[#20BD5A] transition-colors"
            >
              <WhatsappLogo size={18} weight="fill" />
              Iniciar reclamo por WhatsApp
            </a>
            <Link
              href="/soporte/contacto-directo"
              className="inline-flex items-center gap-2 px-6 py-3 border border-line-med text-content font-semibold hover:border-accent/50 hover:text-accent transition-colors"
            >
              Enviar formulario
              <CaretRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
