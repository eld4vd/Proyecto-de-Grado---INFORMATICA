import Link from 'next/link';
import {
  Wrench,
  CaretRight,
  Desktop,
  WifiHigh,
  HardDrive,
  Cpu,
  Bug,
  Gear,
  WhatsappLogo,
  ListNumbers,
  ArrowRight,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Soporte Técnico | Soporte SicaBit',
  description: 'Centro de soporte técnico SicaBit. Diagnóstico, resolución de problemas y asistencia para tus dispositivos.',
};

const categories = [
  {
    icon: Desktop,
    title: 'Problemas de rendimiento',
    description: 'Tu equipo va lento, se calienta demasiado o tiene reinicios inesperados.',
    tips: [
      'Verifica que los drivers estén actualizados',
      'Comprueba la temperatura del procesador con software de monitoreo',
      'Cierra procesos en segundo plano innecesarios',
      'Asegúrate de tener suficiente espacio libre en disco (mínimo 10%)',
    ],
  },
  {
    icon: WifiHigh,
    title: 'Conectividad y red',
    description: 'Problemas con WiFi, Bluetooth, Ethernet o conexión a internet.',
    tips: [
      'Reinicia el router y tu dispositivo',
      'Verifica que el adaptador de red esté habilitado',
      'Actualiza los drivers de red desde el administrador de dispositivos',
      'Prueba conectarte con cable Ethernet para descartar problemas de WiFi',
    ],
  },
  {
    icon: HardDrive,
    title: 'Almacenamiento y datos',
    description: 'Disco duro no detectado, archivos corruptos o pérdida de datos.',
    tips: [
      'Ejecuta un diagnóstico de disco con la herramienta del fabricante',
      'Verifica las conexiones SATA/NVMe si es un disco interno',
      'Realiza copias de seguridad frecuentes en la nube o disco externo',
      'No intentes formatear un disco con datos importantes sin respaldo',
    ],
  },
  {
    icon: Cpu,
    title: 'Hardware y componentes',
    description: 'Pantalla, teclado, mouse u otros periféricos no funcionan correctamente.',
    tips: [
      'Prueba el periférico en otro puerto USB o con otro cable',
      'Verifica que los drivers estén instalados correctamente',
      'En laptops, comprueba el estado de la batería desde configuración',
      'Para monitores sin imagen, verifica el cable y la fuente de alimentación',
    ],
  },
  {
    icon: Bug,
    title: 'Software y sistema operativo',
    description: 'Errores de Windows, pantallas azules (BSOD), virus o software malicioso.',
    tips: [
      'Ejecuta Windows Update para instalar las últimas actualizaciones',
      'Realiza un análisis completo con Windows Defender o tu antivirus',
      'Si persisten las pantallas azules, anota el código de error para diagnóstico',
      'Considera restaurar el sistema a un punto anterior si el problema es reciente',
    ],
  },
  {
    icon: Gear,
    title: 'Configuración y setup',
    description: 'Ayuda para configurar tu equipo nuevo, actualizaciones de BIOS o periféricos.',
    tips: [
      'Consulta el manual del fabricante para la configuración inicial',
      'Registra tu producto para activar la garantía completa',
      'Instala los drivers oficiales desde la web del fabricante',
      'Configura copias de seguridad automáticas desde el primer día',
    ],
  },
];

const steps = [
  { step: 1, title: 'Identifica el problema', description: 'Revisa la categoría que más se ajuste a tu situación y sigue los consejos básicos.' },
  { step: 2, title: 'Prueba las soluciones', description: 'Aplica los pasos de diagnóstico sugeridos. Muchos problemas se resuelven con pasos simples.' },
  { step: 3, title: 'Contáctanos', description: 'Si el problema persiste, comunícate con nuestro equipo técnico por WhatsApp o formulario.' },
  { step: 4, title: 'Seguimiento', description: 'Recibirás un número de caso y seguimiento hasta que tu problema esté completamente resuelto.' },
];

export default function SoporteTecnicoPage() {
  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Header */}
      <section className="border-b border-line-soft bg-surface">
        <div className="container-custom py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm text-content-muted mb-6">
            <Link href="/soporte" className="hover:text-accent transition-colors">Soporte</Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-content">Soporte Técnico</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-14 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Wrench size={28} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-content font-heading">
                Soporte Técnico
              </h1>
              <p className="text-content-secondary mt-1">
                Todo lo que necesitas en cuanto a soporte técnico está aquí.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-line-soft py-12 md:py-16">
        <div className="container-custom">
          <div className="flex items-center gap-2 mb-8">
            <ListNumbers size={20} weight="duotone" className="text-accent" />
            <h2 className="text-xl font-bold text-content font-heading">¿Cómo funciona?</h2>
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

      {/* Categories */}
      <section className="py-12 md:py-16">
        <div className="container-custom">
          <h2 className="text-xl font-bold text-content font-heading mb-8">Categorías de soporte</h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.title} className="bg-surface border border-line-soft p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-11 bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Icon size={22} weight="duotone" className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-content">{cat.title}</h3>
                      <p className="text-sm text-content-muted">{cat.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 pl-4">
                    {cat.tips.map((tip) => (
                      <li key={tip} className="text-sm text-content-secondary flex items-start gap-2">
                        <ArrowRight size={12} weight="bold" className="text-accent mt-1 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-line-soft py-12">
        <div className="container-custom text-center">
          <p className="text-content-muted mb-4">¿Necesitas ayuda personalizada?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/59170000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold hover:bg-[#20BD5A] transition-colors"
            >
              <WhatsappLogo size={18} weight="fill" />
              Chatear con soporte
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
