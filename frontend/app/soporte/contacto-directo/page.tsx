import Link from 'next/link';
import {
  ChatCircle,
  CaretRight,
  WhatsappLogo,
  Phone,
  Envelope,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle,
  Star,
} from '@phosphor-icons/react/dist/ssr';
import { ContactForm } from '../SoporteClient';

export const metadata = {
  title: 'Contacto directo | Soporte SicaBit',
  description: 'Comunícate directamente con nuestro equipo vía WhatsApp, teléfono o formulario de contacto.',
};

const schedules = [
  { day: 'Lunes\u00a0-\u00a0Viernes', hours: '9:00\u00a0-\u00a019:00', active: true },
  { day: 'Sábados', hours: '9:00\u00a0-\u00a014:00', active: true },
  { day: 'Domingos', hours: 'Cerrado', active: false },
];

export default function ContactoDirectoPage() {
  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Header */}
      <section className="border-b border-line-soft bg-surface">
        <div className="container-custom py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm text-content-muted mb-6">
            <Link href="/soporte" className="hover:text-accent transition-colors">Soporte</Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-content">Contacto directo</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-14 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <ChatCircle size={28} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-content font-heading">
                Contacto directo
              </h1>
              <p className="text-content-secondary mt-1">
                Comunícate directamente con nuestro equipo vía WhatsApp o formulario.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="border-b border-line-soft">
        <div className="container-custom py-8">
          <div className="grid sm:grid-cols-3 gap-4">
            <a
              href="https://wa.me/59170000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-[#25D366] text-white hover:bg-[#20BD5A] transition-colors group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="size-11 bg-white/15 flex items-center justify-center relative z-10">
                <WhatsappLogo size={22} weight="fill" />
              </div>
              <div className="relative z-10">
                <p className="font-semibold">WhatsApp</p>
                <p className="text-sm text-white/75">Respuesta inmediata</p>
              </div>
            </a>
            <a
              href="tel:+59133334444"
              className="flex items-center gap-4 p-5 bg-surface border border-line-soft hover:border-accent/30 transition-colors group"
            >
              <div className="size-11 bg-info/10 border border-info/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone size={20} weight="duotone" className="text-info" />
              </div>
              <div>
                <p className="font-semibold text-content">Teléfono</p>
                <p className="text-sm text-content-secondary">+591 3 333 4444</p>
              </div>
            </a>
            <a
              href="mailto:soporte@sicabit.com"
              className="flex items-center gap-4 p-5 bg-surface border border-line-soft hover:border-accent/30 transition-colors group"
            >
              <div className="size-11 bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Envelope size={20} weight="duotone" className="text-accent" />
              </div>
              <div>
                <p className="font-semibold text-content">Email</p>
                <p className="text-sm text-content-secondary">soporte@sicabit.com</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-surface border border-line-soft p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-accent via-accent/50 to-transparent" />

                <div className="flex items-center gap-3 mb-8">
                  <div className="size-11 bg-accent/10 border border-accent/30 flex items-center justify-center">
                    <ChatCircle size={20} weight="duotone" className="text-accent" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-content text-lg">Envíanos un mensaje</h2>
                    <p className="text-sm text-content-muted">Te responderemos lo antes posible</p>
                  </div>
                </div>

                <ContactForm />

                <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-line-soft">
                  {[
                    { icon: ShieldCheck, text: 'Datos protegidos' },
                    { icon: CheckCircle, text: 'Respuesta en 24h' },
                    { icon: Star, text: '4.9★ satisfacción' },
                  ].map((badge) => {
                    const BadgeIcon = badge.icon;
                    return (
                      <div key={badge.text} className="flex items-center gap-1.5">
                        <BadgeIcon size={14} weight="fill" className="text-accent" />
                        <span className="text-xs text-content-muted">{badge.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-4">
              {/* Horarios */}
              <div className="bg-surface border border-line-soft p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-9 bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Clock size={18} weight="duotone" className="text-accent" />
                  </div>
                  <h3 className="font-semibold text-content">Horarios de atención</h3>
                </div>
                <div className="space-y-2.5 text-sm">
                  {schedules.map((s) => (
                    <div
                      key={s.day}
                      className="flex items-center justify-between py-1.5 border-b border-line-soft last:border-0"
                    >
                      <span className="text-content-muted">{s.day}</span>
                      <span className={s.active ? 'text-content font-medium' : 'text-content-faint'}>
                        {s.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="bg-surface border border-line-soft overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-9 bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <MapPin size={18} weight="duotone" className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-content">Nuestra ubicación</h3>
                      <p className="text-xs text-content-muted">Sucre, Bolivia</p>
                    </div>
                  </div>
                  <p className="text-sm text-content-secondary pl-12">Av. Principal #123, Zona Central</p>
                </div>
                <div className="relative h-52 bg-surface-card border-t border-line-soft">
                  <iframe
                    title="Ubicación de SicaBit"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d121058.92836895652!2d-63.24869!3d-17.78629!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x93f1e80f3adf4cf1%3A0x4636a557da0e1864!2sSanta%20Cruz%20de%20la%20Sierra!5e0!3m2!1ses!2sbo!4v1"
                    className="absolute inset-0 w-full h-full border-0 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* Trust signal */}
              <div className="bg-surface border border-line-soft p-5">
                <div className="flex items-center gap-3">
                  <div className="size-9 bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} weight="duotone" className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content">Tu información está segura</p>
                    <p className="text-xs text-content-muted">No compartimos tus datos con terceros</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
