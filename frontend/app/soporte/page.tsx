import Link from 'next/link';
import {
  UserPlus,
  Wrench,
  Lifebuoy,
  Package,
  BookOpen,
  ShieldCheck,
  Question,
  ChatCircle,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Soporte | SicaBit',
  description:
    'Centro de soporte SicaBit. Encuentra ayuda técnica, seguimiento de pedidos, garantías y más.',
  openGraph: {
    title: 'Soporte | SicaBit',
    description: 'Centro de soporte SicaBit. ¿Cómo podemos ayudarte?',
  },
};

/* ─── Service Cards ─── */
const serviceCards = [
  {
    icon: UserPlus,
    title: 'Registro de cuenta',
    description:
      'Ingresa al mundo de SicaBit registrando tu cuenta para acceder a beneficios exclusivos.',
    href: '/soporte/registro-cuenta',
  },
  {
    icon: Wrench,
    title: 'Soporte Técnico',
    description: 'Todo lo que necesitas en cuanto a soporte técnico está aquí.',
    href: '/soporte/soporte-tecnico',
  },
  {
    icon: Lifebuoy,
    title: 'Centro de ayuda',
    description: 'Políticas de envío, pagos, devoluciones y toda la información que necesitas.',
    href: '/soporte/centro-ayuda',
  },
  {
    icon: Package,
    title: 'Seguimiento de pedido',
    description: 'Rastrea el estado de tu envío y gestiona tus órdenes.',
    href: '/soporte/seguimiento-pedido',
  },
  {
    icon: BookOpen,
    title: 'Guías de compra',
    description: 'Accede a recomendaciones y guías para elegir el producto ideal.',
    href: '/soporte/guias-compra',
  },
  {
    icon: ShieldCheck,
    title: 'Consulta de garantía',
    description:
      'Consulta el periodo de garantía de tu producto y accede a la cobertura.',
    href: '/soporte/consulta-garantia',
  },
  {
    icon: Question,
    title: 'Preguntas frecuentes',
    description: 'Respuestas rápidas a las consultas más comunes.',
    href: '/soporte/preguntas-frecuentes',
  },
  {
    icon: ChatCircle,
    title: 'Contacto directo',
    description:
      'Comunícate directamente con nuestro equipo vía WhatsApp o formulario.',
    href: '/soporte/contacto-directo',
  },
];

/* ═══════════════════════════════════════════════════════════
   SERVICE CARD COMPONENT
   ═══════════════════════════════════════════════════════════ */
function ServiceCard({ card }: { card: (typeof serviceCards)[number] }) {
  const Icon = card.icon;
  return (
    <Link
      href={card.href}
      className="group relative block bg-[#111] border border-[#2a2a2a] hover:border-accent hover:bg-accent p-8 md:p-10 text-center overflow-hidden transition-all duration-150"
    >
      <Icon
        size={48}
        weight="thin"
        className="mx-auto mb-4 text-[#a4a4a5] group-hover:text-black transition-colors duration-150"
      />
      <h3 className="text-lg font-bold text-content mb-2 group-hover:text-black transition-colors duration-150">
        {card.title}
      </h3>
      <p className="text-sm text-content-muted leading-relaxed group-hover:text-black/70 transition-colors duration-150">
        {card.description}
      </p>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function SoportePage() {
  return (
    <div className="min-h-screen bg-surface-deep">
      {/* ═══════════ SERVICE TYPE CARDS ═══════════ */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <h2
            className="text-xl md:text-2xl lg:text-3xl font-bold text-content text-center mb-10 md:mb-14 font-heading"
            style={{ textWrap: 'balance' }}
          >
            Puedes seleccionar el tipo de servicio para recibir soporte.
          </h2>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
            {serviceCards.slice(0, 3).map((card) => (
              <ServiceCard key={card.title} card={card} />
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
            {serviceCards.slice(3, 6).map((card) => (
              <ServiceCard key={card.title} card={card} />
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-5 max-w-full md:max-w-[66%] md:mx-auto">
            {serviceCards.slice(6, 8).map((card) => (
              <ServiceCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
