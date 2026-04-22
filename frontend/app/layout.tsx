import type { Metadata, Viewport } from "next";
import { Inter, Barlow, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./lib/cart-context";
import { FavoritosProvider } from "./lib/favoritos-context";
import { AuthProvider } from "./lib/auth-context";
import { ThemeProvider } from "./lib/theme-context";
import { ToastProvider } from "./components/ui/Toast";
import { LayoutWrapper } from "./components/LayoutWrapper";
import { DeferredChatbot } from "./components/ClientCarousels";
import { IconWeightProvider } from "./components/IconWeightProvider";
import { NavigationProgress } from "./components/ui/NavigationProgress";

// ========== FUENTES CLIENTE ==========
// Inter - Cuerpo del texto (geométrica, profesional)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Barlow - Títulos (condensada, técnica, gaming)
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// ========== FUENTES ADMIN ==========
// IBM Plex Sans - Panel de administración (profesional, datos)
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// IBM Plex Mono - Códigos, IDs, precios en admin
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Viewport separado (recomendado por Next.js 14+)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#39FF14' },
    { media: '(prefers-color-scheme: dark)', color: '#050505' },
  ],
};

export const metadata: Metadata = {
  // Títulos
  title: {
    default: "SicaBit - Tu Tienda de Tecnología en Bolivia",
    template: "%s | SicaBit",
  },
  
  // Descripción (máx. 160 caracteres para Google)
  description: "Compra laptops, computadoras, componentes y accesorios tecnológicos en Bolivia. Envío gratis, garantía extendida y los mejores precios. ¡Visítanos!",
  
  // Keywords (menos importante hoy pero útil)
  keywords: [
    "computadoras Bolivia",
    "laptops Sucre",
    "tienda tecnología",
    "componentes PC",
    "gaming Bolivia",
    "procesadores",
    "tarjetas gráficas",
    "SicaBit",
  ],
  
  // Autor
  authors: [{ name: "SicaBit", url: "https://sicabit.com" }],
  creator: "SicaBit",
  publisher: "SicaBit",
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Canonical URL
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sicabit.com'),
  alternates: {
    canonical: '/',
    languages: {
      'es-BO': '/',
    },
  },
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    type: "website",
    locale: "es_BO",
    siteName: "SicaBit",
    title: "SicaBit - Tu Tienda de Tecnología en Bolivia",
    description: "Compra laptops, computadoras, componentes y accesorios tecnológicos. Envío gratis y garantía extendida.",
    url: "https://sicabit.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SicaBit - Tienda de Tecnología",
      },
    ],
  },
  
  // Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "SicaBit - Tu Tienda de Tecnología",
    description: "Laptops, computadoras y accesorios tecnológicos en Bolivia",
    images: ["/og-image.jpg"],
    creator: "@sicabit",
  },
  
  // Verificación de motores de búsqueda (agregar los códigos reales después)
  verification: {
    google: "tu-codigo-google-search-console",
    // yandex: "tu-codigo-yandex",
    // bing: "tu-codigo-bing",
  },
  
  // Categoría
  category: "technology",
  
  // Manifest para PWA
  manifest: "/manifest.json",
  
  // Apple
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SicaBit",
  },
  
  // Formato de detección
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // Otros
  other: {
    "google-site-verification": "tu-codigo-google",
    "msapplication-TileColor": "#39FF14",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Inline script: detectar tema ANTES del primer paint (anti-FOUC) */}
        {/* rendering-hydration-no-flicker + scripts: id requerido para Next.js */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('sicabit-theme:v1');
                  if (t === 'light' || t === 'dark') {
                    document.documentElement.setAttribute('data-theme', t);
                    document.documentElement.style.colorScheme = t;
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* JSON-LD para SEO - Datos estructurados */}
        <script
          id="ld-json-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SicaBit",
              url: "https://sicabit.com",
              logo: "https://sicabit.com/logo.png",
              description: "Tienda de tecnología en Bolivia",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Sucre",
                addressCountry: "BO",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+591-123-456-789",
                contactType: "customer service",
              },
            }),
          }}
        />
        <script
          id="ld-json-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SicaBit",
              url: "https://sicabit.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://sicabit.com/productos?buscar={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${barlow.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {/* Script inline para evitar flicker de auth (rendering-hydration-no-flicker) */}
        {/* suppressHydrationWarning permite que el script modifique data-auth-hint sin errores */}
        <script
          id="auth-hint-init"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var hasSession = document.cookie.includes('auth_session=') || 
                                   document.cookie.includes('token=');
                  document.body.setAttribute('data-auth-hint', hasSession ? 'authenticated' : 'guest');
                } catch (e) {
                  document.body.setAttribute('data-auth-hint', 'guest');
                }
              })();
            `,
          }}
        />
        <ThemeProvider>
          <IconWeightProvider>
            <ToastProvider>
              <AuthProvider>
                <CartProvider>
                  <FavoritosProvider>
                    <NavigationProgress />
                    <LayoutWrapper>
                      {children}
                    </LayoutWrapper>
                    <DeferredChatbot />
                  </FavoritosProvider>
                </CartProvider>
              </AuthProvider>
            </ToastProvider>
          </IconWeightProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
