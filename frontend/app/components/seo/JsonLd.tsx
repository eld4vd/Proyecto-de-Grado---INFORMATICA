/**
 * Componentes de JSON-LD para SEO (Datos estructurados)
 * Esto ayuda a Google a entender mejor el contenido y mostrar Rich Snippets
 */

// Schema de la Organización/Tienda
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SicaBit",
    alternateName: "SicaBit Bolivia",
    url: "https://sicabit.com",
    logo: "https://sicabit.com/logo.png",
    description: "Tienda de tecnología en Bolivia. Laptops, computadoras, componentes y accesorios.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. Principal #123",
      addressLocality: "Sucre",
      addressRegion: "Sucre",
      postalCode: "0000",
      addressCountry: "BO",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+591-123-456-789",
      contactType: "customer service",
      availableLanguage: ["Spanish"],
    },
    sameAs: [
      "https://www.facebook.com/sicabit",
      "https://www.instagram.com/sicabit",
      "https://twitter.com/sicabit",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema de WebSite con SearchAction (para búsqueda en Google)
export function WebsiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SicaBit",
    url: "https://sicabit.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://sicabit.com/productos?buscar={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema de BreadcrumbList
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema de Producto
interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  sku: string;
  brand: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  url: string;
  rating?: number;
  reviewCount?: number;
}

export function ProductJsonLd({
  name,
  description,
  image,
  sku,
  brand,
  price,
  currency = 'USD',
  availability = 'InStock',
  url,
  rating,
  reviewCount,
}: ProductSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image,
    sku,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: currency,
      price,
      availability: `https://schema.org/${availability}`,
      seller: {
        "@type": "Organization",
        name: "SicaBit",
      },
    },
  };

  // Agregar reviews si existen
  if (rating && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema de LocalBusiness (para aparecer en Google Maps)
export function LocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ComputerStore",
    name: "SicaBit",
    image: "https://sicabit.com/logo.png",
    "@id": "https://sicabit.com",
    url: "https://sicabit.com",
    telephone: "+591-123-456-789",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. Principal #123",
      addressLocality: "Sucre",
      addressRegion: "Sucre",
      postalCode: "0000",
      addressCountry: "BO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -17.7833,
      longitude: -63.1821,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Schema de FAQ
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
