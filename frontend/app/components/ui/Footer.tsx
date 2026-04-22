import Link from 'next/link';
import Image from 'next/image';
import { Envelope, MapPin, Phone, CaretRight, CreditCard, Truck, ShieldCheck, Headphones, PaperPlaneTilt } from '@phosphor-icons/react/dist/ssr';
import { FaFacebookF, FaInstagram, FaXTwitter, FaTiktok, FaYoutube } from 'react-icons/fa6';

const footerLinks = {
  productos: [
    { name: 'Laptops', href: '/productos?cat=laptops' },
    { name: 'Procesadores', href: '/productos?cat=procesadores' },
    { name: 'Tarjetas Gráficas', href: '/productos?cat=graficas' },
    { name: 'Almacenamiento', href: '/productos?cat=almacenamiento' },
    { name: 'Monitores', href: '/productos?cat=monitores' },
    { name: 'Periféricos', href: '/productos?cat=perifericos' },
  ],
  empresa: [
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Soporte', href: '/soporte' },
    { name: 'Ofertas', href: '/ofertas' },
    { name: 'Blog', href: '/blog' },
  ],
  soporte: [
    { name: 'Centro de ayuda', href: '/soporte/centro-ayuda' },
    { name: 'Preguntas frecuentes', href: '/soporte/preguntas-frecuentes' },
    { name: 'Garantía', href: '/soporte/consulta-garantia' },
    { name: 'Seguimiento', href: '/soporte/seguimiento-pedido' },
  ],
};

const paymentMethods = [
  { src: '/footer/visa-card.svg', alt: 'Visa' },
  { src: '/footer/mastercard-card.svg', alt: 'Mastercard' },
  { src: '/footer/amex-card.svg', alt: 'American Express' },
  { src: '/footer/paypal-card.svg', alt: 'PayPal' },
  { src: '/footer/applepay-card.svg', alt: 'Apple Pay' },
  { src: '/footer/afterpay-lockup-blackonmint.svg', alt: 'Afterpay' },
  { src: '/footer/klarna-pay-now-2516bae6e2a318cb44e4d29b920d93544d06e2a4b5ebcb985ab39202a68885c4.svg', alt: 'Klarna' },
];

const features = [
  { icon: Truck, text: 'Envío a todo el país' },
  { icon: CreditCard, text: 'Pago seguro' },
  { icon: ShieldCheck, text: 'Garantía 2 años' },
  { icon: Headphones, text: 'Soporte 24/7' },
];

const socialLinks = [
  { icon: FaFacebookF, href: 'https://facebook.com/sicabit', label: 'Facebook', color: 'hover:bg-[#1877f2]' },
  { icon: FaInstagram, href: 'https://instagram.com/sicabit', label: 'Instagram', color: 'hover:bg-linear-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#8134af]' },
  { icon: FaXTwitter, href: 'https://x.com/sicabit', label: 'X', color: 'hover:bg-white hover:text-black' },
  { icon: FaTiktok, href: 'https://tiktok.com/@sicabit', label: 'TikTok', color: 'hover:bg-surface-deep hover:border-[#00f2ea]' },
  { icon: FaYoutube, href: 'https://youtube.com/@sicabit', label: 'YouTube', color: 'hover:bg-[#ff0000]' },
];

export default function Footer() {
  return (
    <footer className="bg-surface-deep">
      {/* Features bar */}
      <div className="border-b border-line-soft">
        <div className="container-custom py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-surface border border-line flex items-center justify-center">
                  <feature.icon size={20} weight="duotone" className="text-accent" aria-hidden="true" />
                </div>
                <span className="text-sm text-content-secondary">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="inline-flex items-center gap-1 mb-5">
              <div className="relative size-12">
                <Image src="/logo-sicabit.webp" alt="SicaBit" fill sizes="48px" className="object-contain" />
              </div>
              <span className="text-xl font-bold text-content">
                Sica<span className="text-accent">Bit</span>
              </span>
            </Link>
            <p className="text-content-muted text-sm mb-6 max-w-xs">
              Tu tienda de confianza para tecnología de calidad. Componentes, laptops y todo lo que necesitas.
            </p>
            
            {/* Contact info */}
            <div className="space-y-3 mb-6">
              <a href="mailto:ventas@sicabit.com" className="flex items-center gap-2.5 text-sm text-content-secondary hover:text-content transition-colors">
                <Envelope size={16} className="text-accent" aria-hidden="true" />
                ventas@sicabit.com
              </a>
              <a href="tel:+59133334444" className="flex items-center gap-2.5 text-sm text-content-secondary hover:text-content transition-colors">
                <Phone size={16} className="text-accent" aria-hidden="true" />
                +591 3 333 4444
              </a>
              <div className="flex items-center gap-2.5 text-sm text-content-secondary">
                <MapPin size={16} className="text-accent" aria-hidden="true" />
                Sucre, Bolivia
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h5 className="text-content font-semibold text-xs uppercase tracking-wider mb-3">
                Síguenos
              </h5>
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`size-9 rounded-lg bg-surface border border-line flex items-center justify-center text-content-secondary hover:text-content hover:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors duration-300 group ${social.color}`}
                  >
                    <social.icon size={16} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Links columns */}
          <div>
            <h4 className="text-content font-semibold text-sm uppercase tracking-wider mb-4">
              Productos
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.productos.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-content-muted hover:text-accent transition-colors inline-flex items-center gap-1 group"
                  >
                    <CaretRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-accent" aria-hidden="true" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-content font-semibold text-sm uppercase tracking-wider mb-4">
              Empresa
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-content-muted hover:text-accent transition-colors inline-flex items-center gap-1 group"
                  >
                    <CaretRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-accent" aria-hidden="true" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-content font-semibold text-sm uppercase tracking-wider mb-4">
              Soporte
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.soporte.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-content-muted hover:text-accent transition-colors inline-flex items-center gap-1 group"
                  >
                    <CaretRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-accent" aria-hidden="true" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="text-content font-semibold text-sm uppercase tracking-wider mb-4">
              Contáctanos
            </h4>
            <p className="text-sm text-content-muted mb-4">
              ¿Tienes alguna consulta? Escríbenos
            </p>
            <a 
              href="mailto:ventas@sicabit.com?subject=Consulta desde sitio web"
              className="flex items-center justify-center gap-2 w-full h-11 bg-accent hover:bg-accent-hover text-accent-contrast font-semibold rounded-lg transition-colors text-sm"
            >
              <PaperPlaneTilt size={16} aria-hidden="true" />
              Enviar correo
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line-soft">
        <div className="container-custom py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-content-faint">
              © 2026 SicaBit. Todos los derechos reservados.
            </p>

            {/* Payment methods */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center" role="list" aria-label="Métodos de pago aceptados">
              {paymentMethods.map((method) => (
                <div
                  key={method.alt}
                  role="listitem"
                  title={method.alt}
                  className="h-6 px-1.5 flex items-center justify-center bg-white rounded border border-gray-200"
                >
                  <Image
                    src={method.src}
                    alt={method.alt}
                    width={40}
                    height={24}
                    className="object-contain h-4 w-auto"
                    unoptimized
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <Link href="/privacidad" className="text-xs text-content-faint hover:text-accent transition-colors">
                Privacidad
              </Link>
              <Link href="/terminos" className="text-xs text-content-faint hover:text-accent transition-colors">
                Términos
              </Link>
              <Link href="/cookies" className="text-xs text-content-faint hover:text-accent transition-colors">
                Cookies
              </Link>
              <div className="hidden md:flex items-center gap-2 text-xs text-content-faint">
                <span>|</span>
                {socialLinks.map((social, index) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="hover:text-accent transition-colors"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
