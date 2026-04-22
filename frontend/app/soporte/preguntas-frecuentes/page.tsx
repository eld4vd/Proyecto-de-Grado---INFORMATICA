import Link from 'next/link';
import {
  Question,
  CaretRight,
  WhatsappLogo,
  Truck,
  CreditCard,
  Package,
  UserCircle,
  ArrowUUpLeft,
  ShieldCheck,
} from '@phosphor-icons/react/dist/ssr';
import { FAQSection } from '../SoporteClient';

export const metadata = {
  title: 'Preguntas frecuentes | Soporte SicaBit',
  description: 'Respuestas rápidas a las consultas más comunes sobre envíos, pagos, garantías, devoluciones y más.',
};

const faqCategories = [
  {
    id: 'envios',
    title: 'Envíos y entregas',
    icon: Truck,
    faqs: [
      {
        question: '¿Cuánto tarda el envío?',
        answer: 'Los envíos dentro de Sucre se realizan en 24–48 horas. Para el resto de Bolivia, el plazo es de 3 a 5 días hábiles.',
      },
      {
        question: '¿Realizan envíos a todo Bolivia?',
        answer: 'Sí, realizamos envíos a las 9 ciudades capitales y a zonas intermedias a través de nuestras empresas de courier aliadas.',
      },
      {
        question: '¿Cuánto cuesta el envío?',
        answer: 'El envío es gratuito en compras superiores a Bs. 500 dentro de Sucre. Para otros departamentos, el costo varía según el peso y destino, y se calcula al finalizar tu compra.',
      },
      {
        question: '¿Puedo elegir una fecha de entrega?',
        answer: 'Actualmente no ofrecemos entregas programadas, pero puedes coordinar con nuestro equipo de logística vía WhatsApp para casos especiales.',
      },
    ],
  },
  {
    id: 'pagos',
    title: 'Pagos y facturación',
    icon: CreditCard,
    faqs: [
      {
        question: '¿Cuáles son los métodos de pago?',
        answer: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard), transferencia bancaria, QR y pago contra entrega en Sucre.',
      },
      {
        question: '¿Puedo pagar en cuotas?',
        answer: 'Sí, ofrecemos pago en cuotas sin interés con tarjetas de crédito seleccionadas. Las opciones disponibles se muestran al momento del pago.',
      },
      {
        question: '¿Emiten factura?',
        answer: 'Sí, emitimos factura electrónica. Asegúrate de ingresar tu NIT y razón social al momento de la compra. Si olvidaste solicitarla, contáctanos dentro de las 48 horas.',
      },
    ],
  },
  {
    id: 'productos',
    title: 'Productos y garantía',
    icon: ShieldCheck,
    faqs: [
      {
        question: '¿Tienen garantía los productos?',
        answer: 'Todos nuestros productos cuentan con garantía oficial de fábrica. El período varía según la marca y el producto, pero el mínimo es de 12 meses.',
      },
      {
        question: '¿Cómo hago válida la garantía?',
        answer: 'Para hacer válida la garantía necesitas tu factura de compra y el producto en su empaque original. Contáctanos vía WhatsApp o formulario para iniciar el proceso.',
      },
      {
        question: '¿Los productos son originales?',
        answer: 'Sí, todos nuestros productos son 100% originales y nuevos. Trabajamos directamente con distribuidores autorizados y marcas oficiales.',
      },
      {
        question: '¿Puedo ver el producto antes de comprarlo?',
        answer: 'Actualmente somos una tienda online, pero puedes solicitar fotos o videos adicionales de cualquier producto contactándonos por WhatsApp.',
      },
    ],
  },
  {
    id: 'cuenta',
    title: 'Cuenta y seguridad',
    icon: UserCircle,
    faqs: [
      {
        question: '¿Cómo creo mi cuenta?',
        answer: 'Haz clic en "Registrarse" en la parte superior de la página, ingresa tu email y crea una contraseña. También puedes registrarte con tu cuenta de Google.',
      },
      {
        question: '¿Olvidé mi contraseña, qué hago?',
        answer: 'En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?" e ingresa tu email. Te enviaremos un enlace para restablecerla.',
      },
      {
        question: '¿Mis datos están seguros?',
        answer: 'Absolutamente. Utilizamos encriptación SSL y no almacenamos datos de tarjetas de crédito. Tu información personal nunca es compartida con terceros.',
      },
    ],
  },
  {
    id: 'devoluciones',
    title: 'Devoluciones y cambios',
    icon: ArrowUUpLeft,
    faqs: [
      {
        question: '¿Aceptan devoluciones?',
        answer: 'Sí, aceptamos devoluciones dentro de los primeros 7 días hábiles desde la recepción del producto, siempre que esté en su empaque original y sin uso.',
      },
      {
        question: '¿Cómo solicito una devolución?',
        answer: 'Contáctanos por WhatsApp o a través del formulario de contacto indicando tu número de orden y el motivo. Nuestro equipo te guiará en el proceso.',
      },
      {
        question: '¿Puedo cambiar un producto por otro?',
        answer: 'Sí, puedes solicitar un cambio dentro de los primeros 7 días. Si el nuevo producto tiene un precio diferente, se ajustará la diferencia.',
      },
      {
        question: '¿Cuánto tardan en procesar el reembolso?',
        answer: 'Una vez recibido el producto devuelto, procesamos el reembolso en un plazo de 5 a 10 días hábiles según tu método de pago original.',
      },
    ],
  },
  {
    id: 'pedidos',
    title: 'Pedidos y seguimiento',
    icon: Package,
    faqs: [
      {
        question: '¿Cómo puedo rastrear mi pedido?',
        answer: 'Una vez realizado el envío, recibirás un correo con el número de seguimiento. También puedes verificar el estado desde tu cuenta en la sección "Mis Pedidos".',
      },
      {
        question: '¿Puedo cancelar un pedido?',
        answer: 'Puedes cancelar tu pedido siempre que no haya sido despachado. Contáctanos lo antes posible por WhatsApp para gestionar la cancelación.',
      },
      {
        question: '¿Puedo modificar la dirección de entrega?',
        answer: 'Sí, mientras el pedido no haya sido despachado puedes modificar la dirección contactándonos por WhatsApp o desde tu cuenta.',
      },
    ],
  },
];

export default function PreguntasFrecuentesPage() {
  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Header */}
      <section className="border-b border-line-soft bg-surface">
        <div className="container-custom py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm text-content-muted mb-6">
            <Link href="/soporte" className="hover:text-accent transition-colors">Soporte</Link>
            <CaretRight size={12} weight="bold" />
            <span className="text-content">Preguntas frecuentes</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-14 bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Question size={28} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-content font-heading">
                Preguntas frecuentes
              </h1>
              <p className="text-content-secondary mt-1">
                Respuestas rápidas a las consultas más comunes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="border-b border-line-soft bg-[#111] sticky top-0 z-20">
        <div className="container-custom">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
            {faqCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-content-muted hover:text-accent hover:bg-accent/5 transition-colors whitespace-nowrap"
                >
                  <Icon size={16} weight="duotone" />
                  {cat.title}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <div className="container-custom py-12 md:py-16">
        <div className="max-w-3xl mx-auto space-y-14">
          {faqCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <section key={cat.id} id={cat.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <Icon size={20} weight="duotone" className="text-accent" />
                  </div>
                  <h2 className="text-xl font-bold text-content font-heading">{cat.title}</h2>
                </div>
                <FAQSection faqs={cat.faqs} />
              </section>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 pt-10 border-t border-line-soft">
          <p className="text-content-muted mb-4">¿No encuentras lo que buscas?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/59170000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold hover:bg-[#20BD5A] transition-colors"
            >
              <WhatsappLogo size={18} weight="fill" />
              Escríbenos por WhatsApp
            </a>
            <Link
              href="/soporte/contacto-directo"
              className="inline-flex items-center gap-2 px-6 py-3 border border-line-med text-content font-semibold hover:border-accent/50 hover:text-accent transition-colors"
            >
              Ir a Contacto directo
              <CaretRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
