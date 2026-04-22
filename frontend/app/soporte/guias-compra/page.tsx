import Link from 'next/link';
import {
  BookOpen,
  CaretRight,
  Laptop,
  Monitor,
  Mouse,
  Keyboard,
  Headphones,
  GameController,
  DesktopTower,
  CheckCircle,
  Lightning,
  Coins,
  Star,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Guías de compra | Soporte SicaBit',
  description: 'Guías y recomendaciones para elegir el producto ideal según tus necesidades y presupuesto.',
};

const guides = [
  {
    icon: Laptop,
    title: 'Cómo elegir la laptop perfecta',
    category: 'Laptops',
    points: [
      { label: 'Procesador', tip: 'Intel Core i5/i7 o AMD Ryzen 5/7 para uso general. Para gaming, mínimo i7/Ryzen 7 de última generación.' },
      { label: 'RAM', tip: '8 GB mínimo para uso diario, 16 GB para gaming/edición, 32 GB para trabajo profesional pesado.' },
      { label: 'Almacenamiento', tip: 'SSD de 512 GB mínimo. Evita HDD si buscas velocidad. NVMe ofrece el mejor rendimiento.' },
      { label: 'Pantalla', tip: 'Full HD (1920x1080) mínimo. IPS para buenos colores. 144Hz si es para gaming.' },
      { label: 'Tarjeta gráfica', tip: 'Integrada para ofimática. RTX 3060+ para gaming. RTX 4070+ para edición profesional.' },
    ],
  },
  {
    icon: Monitor,
    title: 'Guía para elegir monitor',
    category: 'Monitores',
    points: [
      { label: 'Tamaño', tip: '24" para oficina, 27" para gaming/edición, 32"+ para productividad multitarea.' },
      { label: 'Resolución', tip: 'Full HD para 24", QHD (2K) para 27", 4K para 32" y edición profesional.' },
      { label: 'Tasa de refresco', tip: '60Hz para oficina, 144Hz para gaming competitivo, 240Hz para esports.' },
      { label: 'Panel', tip: 'IPS para mejores colores y ángulos de visión. VA para alto contraste. TN solo si priorizas respuesta rápida.' },
      { label: 'Conectividad', tip: 'HDMI 2.0+, DisplayPort 1.4 para alta resolución. USB-C es un plus para laptops.' },
    ],
  },
  {
    icon: DesktopTower,
    title: 'Armar tu PC de escritorio',
    category: 'PC Escritorio',
    points: [
      { label: 'Uso', tip: 'Define primero el uso: gaming, edición, ofimática o programación. Esto determina todos los componentes.' },
      { label: 'Procesador + GPU', tip: 'Para gaming: prioriza GPU (RTX 4060+). Para edición: equilibra CPU y GPU. Para oficina: gráficos integrados.' },
      { label: 'Fuente de poder', tip: 'Calcula el consumo total y agrega 20% de margen. Mínimo certificación 80+ Bronze.' },
      { label: 'Refrigeración', tip: 'Disipador stock para CPUs básicos. Tower cooler para i5/Ryzen 5. Líquida para i7/Ryzen 7+ con OC.' },
      { label: 'Gabinete', tip: 'Buen flujo de aire > apariencia. Asegúrate de que sea compatible con tu placa y GPU.' },
    ],
  },
  {
    icon: Mouse,
    title: 'Mouse: gaming vs. productividad',
    category: 'Mouse',
    points: [
      { label: 'Sensor', tip: 'Para gaming: sensor óptico de alta precisión (PixArt 3395 o similar). Para oficina: cualquier sensor óptico moderno.' },
      { label: 'Peso', tip: 'Menos de 80g para gaming FPS competitivo. 90-120g para uso general y ergonomía.' },
      { label: 'Forma', tip: 'Ergonómico (asimétrico) para sesiones largas. Ambidiestro (simétrico) para versatilidad.' },
      { label: 'Conectividad', tip: 'Inalámbrico 2.4GHz para la menor latencia sin cable. Bluetooth para portabilidad.' },
    ],
  },
  {
    icon: Keyboard,
    title: 'Teclados mecánicos vs. membrana',
    category: 'Teclados',
    points: [
      { label: 'Mecánico', tip: 'Mayor durabilidad (50M+ pulsaciones), tacto preciso, personalizable. Ideal para gaming y escritura intensiva.' },
      { label: 'Membrana', tip: 'Más silencioso y económico. Bueno para uso casual y oficina con presupuesto ajustado.' },
      { label: 'Switches', tip: 'Lineales (Red) para gaming. Táctiles (Brown) para escritura. Clicky (Blue) para quienes disfrutan el sonido.' },
      { label: 'Layout', tip: 'Full-size si usas numpad. TKL (sin numpad) para más espacio de mouse. 65%/75% para portabilidad.' },
    ],
  },
  {
    icon: Headphones,
    title: 'Auriculares: qué buscar',
    category: 'Auriculares',
    points: [
      { label: 'Tipo', tip: 'Over-ear para aislamiento y comodidad. In-ear para portabilidad. On-ear equilibra ambos.' },
      { label: 'Gaming', tip: 'Prioriza sonido envolvente 7.1 (virtual), micrófono con cancelación de ruido y comodidad para sesiones largas.' },
      { label: 'Música', tip: 'Respuesta en frecuencia amplia (20Hz-20kHz), drivers de 40mm+ y pads de espuma viscoelástica.' },
      { label: 'Conectividad', tip: 'Cable 3.5mm para menor latencia. USB para audio digital. Bluetooth 5.0+ para inalámbrico.' },
    ],
  },
];

const budgetTips = [
  { icon: Coins, title: 'Presupuesto ajustado', tip: 'Prioriza componentes esenciales (procesador, RAM, SSD). Puedes actualizar GPU o periféricos más adelante.' },
  { icon: Lightning, title: 'Mejor rendimiento', tip: 'Invierte en procesador y GPU de gama media-alta. Son los componentes que más impactan en la experiencia.' },
  { icon: Star, title: 'Sin límite', tip: 'Opta por componentes de última generación y periféricos premium. Invierte en buena silla y ergonomía.' },
];

export default function GuiasCompraPage() {
  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Header */}
      <section className="border-b border-line-soft bg-surface">
        <div className="container-custom py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm text-content-muted mb-6">
            <Link href="/soporte" className="hover:text-accent transition-colors">Soporte</Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-content">Guías de compra</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-14 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <BookOpen size={28} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-content font-heading">
                Guías de compra
              </h1>
              <p className="text-content-secondary mt-1">
                Accede a recomendaciones y guías para elegir el producto ideal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Budget Tips */}
      <section className="border-b border-line-soft py-10">
        <div className="container-custom">
          <h2 className="text-lg font-bold text-content font-heading mb-6">Según tu presupuesto</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {budgetTips.map((bt) => {
              const Icon = bt.icon;
              return (
                <div key={bt.title} className="bg-surface border border-line-soft p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon size={20} weight="duotone" className="text-accent" />
                    <h3 className="font-bold text-content">{bt.title}</h3>
                  </div>
                  <p className="text-sm text-content-muted leading-relaxed">{bt.tip}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="py-12 md:py-16">
        <div className="container-custom space-y-10">
          {guides.map((guide) => {
            const Icon = guide.icon;
            return (
              <div key={guide.title} className="bg-surface border border-line-soft p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="size-12 bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Icon size={24} weight="duotone" className="text-accent" />
                  </div>
                  <div>
                    <span className="text-xs text-accent font-medium uppercase tracking-wider">{guide.category}</span>
                    <h2 className="text-xl font-bold text-content font-heading">{guide.title}</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  {guide.points.map((point) => (
                    <div key={point.label} className="flex items-start gap-3">
                      <CheckCircle size={18} weight="fill" className="text-accent mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-content">{point.label}:</span>{' '}
                        <span className="text-sm text-content-secondary">{point.tip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-line-soft py-12">
        <div className="container-custom text-center">
          <p className="text-content-muted mb-4">¿Necesitas asesoría personalizada?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold hover:shadow-[0_0_25px_rgba(57,255,20,0.25)] transition-all"
            >
              Ver productos
              <CaretRight size={14} weight="bold" />
            </Link>
            <Link
              href="/soporte/contacto-directo"
              className="inline-flex items-center gap-2 px-6 py-3 border border-line-med text-content font-semibold hover:border-accent/50 hover:text-accent transition-colors"
            >
              Consultar con un experto
              <CaretRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
