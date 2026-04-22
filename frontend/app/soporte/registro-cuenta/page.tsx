import Link from 'next/link';
import {
  UserPlus,
  CaretRight,
  Star,
  Truck,
  Tag,
  Heart,
  ShieldCheck,
  ClockCountdown,
  ArrowRight,
  ListNumbers,
  CheckCircle,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Registro de cuenta | Soporte SicaBit',
  description: 'Crea tu cuenta en SicaBit y accede a beneficios exclusivos: descuentos, seguimiento de pedidos y más.',
};

const benefits = [
  {
    icon: Tag,
    title: 'Descuentos exclusivos',
    description: 'Accede a ofertas y cupones solo para miembros registrados.',
  },
  {
    icon: Truck,
    title: 'Seguimiento de pedidos',
    description: 'Rastrea tus compras en tiempo real desde tu panel de cuenta.',
  },
  {
    icon: Heart,
    title: 'Lista de favoritos',
    description: 'Guarda productos que te interesan para comprarlos después.',
  },
  {
    icon: ClockCountdown,
    title: 'Historial de compras',
    description: 'Revisa todas tus compras anteriores y vuelve a comprar fácilmente.',
  },
  {
    icon: Star,
    title: 'Reseñas y valoraciones',
    description: 'Comparte tu experiencia y ayuda a otros compradores.',
  },
  {
    icon: ShieldCheck,
    title: 'Garantía simplificada',
    description: 'Gestiona reclamos de garantía directamente desde tu cuenta.',
  },
];

const steps = [
  {
    step: 1,
    title: 'Haz clic en "Registrarse"',
    description: 'Encontrarás el botón en la esquina superior derecha de la página, o puedes ir directamente desde el enlace de abajo.',
  },
  {
    step: 2,
    title: 'Completa tus datos',
    description: 'Ingresa tu nombre, email y crea una contraseña segura. También puedes registrarte con Google para mayor rapidez.',
  },
  {
    step: 3,
    title: 'Verifica tu email',
    description: 'Recibirás un correo de verificación. Haz clic en el enlace para activar tu cuenta.',
  },
  {
    step: 4,
    title: '¡Listo para comprar!',
    description: 'Ya puedes navegar, agregar a favoritos, comprar y rastrear tus pedidos.',
  },
];

const securityFeatures = [
  'Encriptación SSL en todas las transacciones',
  'Contraseñas almacenadas con hash seguro (bcrypt)',
  'No almacenamos datos de tarjetas de crédito',
  'Autenticación con Google (OAuth 2.0)',
  'Tu información nunca es compartida con terceros',
];

export default function RegistroCuentaPage() {
  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Header */}
      <section className="border-b border-line-soft bg-surface">
        <div className="container-custom py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm text-content-muted mb-6">
            <Link href="/soporte" className="hover:text-accent transition-colors">Soporte</Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-content">Registro de cuenta</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-14 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <UserPlus size={28} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-content font-heading">
                Registro de cuenta
              </h1>
              <p className="text-content-secondary mt-1">
                Ingresa al mundo de SicaBit registrando tu cuenta para acceder a beneficios exclusivos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-b border-line-soft py-8">
        <div className="container-custom">
          <div className="bg-accent/5 border border-accent/20 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-content text-lg">¿Aún no tienes cuenta?</h2>
              <p className="text-sm text-content-muted">Regístrate en menos de un minuto y empieza a disfrutar todos los beneficios.</p>
            </div>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:shadow-[0_0_25px_rgba(57,255,20,0.25)] transition-all whitespace-nowrap"
            >
              Crear mi cuenta
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b border-line-soft py-12 md:py-16">
        <div className="container-custom">
          <h2 className="text-xl font-bold text-content font-heading mb-8">Beneficios de tener cuenta</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="bg-surface border border-line-soft p-6">
                  <Icon size={32} weight="thin" className="mb-3 text-accent" />
                  <h3 className="font-bold text-content mb-2">{b.title}</h3>
                  <p className="text-sm text-content-muted leading-relaxed">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Register */}
      <section className="border-b border-line-soft py-12 md:py-16">
        <div className="container-custom">
          <div className="flex items-center gap-2 mb-8">
            <ListNumbers size={20} weight="duotone" className="text-accent" />
            <h2 className="text-xl font-bold text-content font-heading">¿Cómo registrarme?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s) => (
              <div key={s.step} className="bg-surface border border-line-soft p-6 relative">
                <span className="text-4xl font-black text-accent/15 absolute top-4 right-4">{s.step}</span>
                <h3 className="font-bold text-content mb-2">{s.title}</h3>
                <p className="text-sm text-content-muted leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <div className="bg-surface border border-line-soft p-6 md:p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="size-11 bg-accent/10 border border-accent/20 flex items-center justify-center">
                <ShieldCheck size={22} weight="duotone" className="text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-content font-heading">Tu seguridad es prioridad</h2>
                <p className="text-sm text-content-muted">Protegemos tu información con las mejores prácticas de la industria.</p>
              </div>
            </div>
            <ul className="space-y-3">
              {securityFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-content-secondary">
                  <CheckCircle size={16} weight="fill" className="text-accent mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-line-soft py-12">
        <div className="container-custom text-center">
          <p className="text-content-muted mb-4">¿Ya tienes cuenta?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:shadow-[0_0_25px_rgba(57,255,20,0.25)] transition-all"
            >
              Iniciar sesión
              <ArrowRight size={14} weight="bold" />
            </Link>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 px-6 py-3 border border-line-med text-content font-semibold hover:border-accent/50 hover:text-accent transition-colors"
            >
              Crear cuenta nueva
              <CaretRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
