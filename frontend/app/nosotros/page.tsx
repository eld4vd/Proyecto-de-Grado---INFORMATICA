import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck, Truck, Headphones, CaretRight, ArrowRight,
} from '@phosphor-icons/react/dist/ssr';
import { AnimatedCounter, FadeIn, BrandLogos } from './NosotrosClient';

export const metadata = {
  title: 'Nosotros | SicaBit',
  description:
    'Conoce más sobre SicaBit, tu tienda de confianza en tecnología en Bolivia. Más de 10 años ofreciendo productos originales.',
  openGraph: {
    title: 'Nosotros | SicaBit',
    description: 'Tu tienda de confianza en tecnología. Más de una década de innovación.',
  },
};

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Productos originales',
    description:
      'Somos distribuidores oficiales. Todos nuestros productos incluyen garantía de fábrica y factura legal.',
  },
  {
    icon: Truck,
    title: 'Envío a toda Bolivia',
    description:
      'Enviamos a los 9 departamentos con empaque seguro y seguimiento en tiempo real de tu pedido.',
  },
  {
    icon: Headphones,
    title: 'Soporte técnico',
    description:
      'Nuestro equipo te asesora antes, durante y después de tu compra. Atención real, no bots.',
  },
];

const brands = [
  { name: 'ASUS', src: '/brands/asus.webp' },
  { name: 'AMD', src: '/brands/amd.webp' },
  { name: 'NVIDIA', src: '/brands/nvidia-logo-vert.webp' },
  { name: 'Logitech', src: '/brands/Logitech.webp' },
  { name: 'Razer', src: '/brands/Razer.webp' },
  { name: 'Corsair', src: '/brands/Corsair.webp' },
  { name: 'ROG', src: '/brands/rog.webp' },
  { name: 'Lenovo Legion', src: '/brands/legion-logo.webp' },
];

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-surface-deep">
      {/* ─── HERO: STATEMENT ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-surface via-surface to-surface-deep" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-200 bg-accent rounded-full blur-[200px] opacity-[0.04]"
        />

        <div className="container-custom relative z-10 pt-4 pb-14 md:pt-6 md:pb-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-content-muted mb-6 md:mb-10">
            <Link href="/" className="hover:text-accent transition-colors">Inicio</Link>
            <CaretRight size={14} weight="bold" aria-hidden="true" />
            <span className="text-accent">Nosotros</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div className="max-w-4xl lg:max-w-2xl">
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-content font-heading leading-[1.05] tracking-tight"
                style={{ textWrap: 'balance' }}
              >
                Tecnología real
                <br />
                para personas
                <br />
                <span className="text-accent">reales.</span>
              </h1>

              <p className="mt-6 md:mt-8 text-lg md:text-xl text-content-secondary max-w-xl leading-relaxed">
                Desde 2015, SicaBit lleva productos originales de las mejores
                marcas del mundo a toda Bolivia. Sin rodeos.
              </p>
            </div>

            <FadeIn delay={0.1}>
              <div className="relative w-full max-w-xl ml-auto">
                <div className="absolute -inset-4 bg-accent/10 blur-2xl rounded-3xl" aria-hidden="true" />
                <Image
                  src="/hero/Tienda-nosotros-hero.webp"
                  alt="Fachada de la tienda SicaBit con exhibicion de componentes electronicos"
                  width={720}
                  height={720}
                  priority
                  className="relative w-full h-auto rounded-2xl border border-line-soft object-cover shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="border-y border-line-soft bg-surface">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-line-soft">
            {[
              { value: 10, suffix: '+', label: 'Años' },
              { value: 500, suffix: '+', label: 'Productos' },
              { value: 15, suffix: '+', label: 'Marcas' },
              { value: 50, suffix: 'k+', label: 'Clientes' },
            ].map((stat) => (
              <div key={stat.label} className="py-8 md:py-10 text-center">
                <div className="text-3xl md:text-4xl font-black text-accent font-heading">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-content-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PILLARS: HOW WE DO IT ─── */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-black text-content font-heading text-center mb-4">
              Cómo lo hacemos
            </h2>
            <p className="text-content-muted text-center max-w-md mx-auto mb-14">
              Tres compromisos que mantenemos desde el día uno.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => (
              <FadeIn key={pillar.title} delay={i * 0.1}>
                <div className="group h-full bg-surface border border-line-soft p-8 hover:border-accent/40 transition-colors duration-300">
                  <pillar.icon
                    size={32}
                    weight="duotone"
                    className="text-accent mb-5 group-hover:scale-110 transition-transform origin-left"
                  />
                  <h3 className="text-lg font-bold text-content mb-3 font-heading group-hover:text-accent transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-content-muted leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MISSION STATEMENT (full-width accent) ─── */}
      <section className="bg-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.15),transparent_70%)]" />
        <div className="container-custom py-16 md:py-24 relative z-10">
          <FadeIn>
            <blockquote
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-accent-contrast font-heading leading-tight text-center"
              style={{ textWrap: 'balance' }}
            >
              &ldquo;La mejor tecnología no tiene que ser complicada ni cara.
              Solo tiene que llegar a las manos correctas.&rdquo;
            </blockquote>
            <p className="text-center text-accent-contrast/60 mt-6 text-sm font-medium tracking-wider uppercase">
              — Nuestra filosofía
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── OUR STORY (compact) ─── */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeIn>
              <span className="text-xs text-accent font-bold tracking-widest uppercase">Nuestra historia</span>
              <h2 className="text-3xl md:text-4xl font-black text-content mt-3 mb-6 font-heading leading-tight">
                De una tienda local a referentes en tech
              </h2>
              <div className="space-y-4 text-content-secondary leading-relaxed">
                <p>
                  En 2015 abrimos nuestra primera tienda en Sucre con una idea
                  simple: que comprar tecnología en Bolivia no sea un problema sino
                  una experiencia.
                </p>
                <p>
                  Hoy trabajamos con más de 15 marcas premium, enviamos a los
                  9 departamentos y seguimos con el mismo compromiso: productos
                  reales, precios claros y soporte de verdad.
                </p>
              </div>

              <Link
                href="/productos"
                className="group inline-flex items-center gap-2 mt-8 text-accent font-semibold text-sm hover:gap-3 transition-all"
              >
                Explorar productos
                <ArrowRight size={16} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </FadeIn>

            {/* Partner brands grid */}
            <FadeIn delay={0.15}>
              <div className="bg-surface border border-line-soft p-8">
                <p className="text-xs text-content-faint font-bold tracking-widest uppercase mb-6">
                  Marcas que distribuimos
                </p>
                <BrandLogos brands={brands} />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-line-soft">
        <div className="container-custom py-20 md:py-28">
          <FadeIn>
            <div className="max-w-2xl mx-auto text-center">
              <h2
                className="text-3xl md:text-4xl font-black text-content font-heading mb-4"
                style={{ textWrap: 'balance' }}
              >
                ¿Listo para encontrar lo que buscas?
              </h2>
              <p className="text-content-muted mb-8 max-w-md mx-auto">
                Explora nuestro catálogo con los mejores precios y garantía oficial.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/productos"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-accent text-accent-contrast font-bold text-sm hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] transition-all"
                >
                  Ver productos
                  <ArrowRight size={16} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/soporte/contacto-directo"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-line-med text-content font-bold text-sm hover:border-accent/50 hover:text-accent transition-colors"
                >
                  Contacto
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
