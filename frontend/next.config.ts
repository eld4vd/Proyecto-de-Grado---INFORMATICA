import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig['images']>['remotePatterns']>[number];

const toRemotePattern = (rawUrl?: string): RemotePattern | null => {
  if (!rawUrl) return null;

  try {
    const parsed = new URL(rawUrl.trim());

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    return {
      protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      pathname: '/**',
    };
  } catch {
    return null;
  }
};

const getImageRemotePatterns = (): RemotePattern[] => {
  const candidates = [
    'https://sicabit.com',
    'https://www.sicabit.com',
    'https://res.cloudinary.com',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ];

  const uniquePatterns = new Map<string, RemotePattern>();

  for (const candidate of candidates) {
    const pattern = toRemotePattern(candidate);
    if (!pattern) continue;

    const key = `${pattern.protocol}|${pattern.hostname}|${pattern.port || ''}`;
    uniquePatterns.set(key, pattern);
  }

  return Array.from(uniquePatterns.values());
};

const getBackendOrigin = (): string => {
  const candidates = [
    process.env.BACKEND_INTERNAL_URL,
    process.env.BACKEND_URL,
    'http://localhost:3001',
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const normalized = candidate.trim().replace(/\/+$/, '');
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return 'http://localhost:3001';
};

const backendOrigin = getBackendOrigin();

const nextConfig: NextConfig = {
  // Output standalone para Docker (no afecta a next dev)
  output: 'standalone',

  // Optimizaciones de rendimiento
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Optimización de paquetes de terceros (tree-shaking mejorado)
  experimental: {
    // bundle-barrel-imports: Optimizar imports de librerías con barrel files grandes
    optimizePackageImports: ['@phosphor-icons/react', 'react-icons', 'framer-motion'],
  },

  // Configuración de imágenes para permitir URLs externas
  images: {
    remotePatterns: getImageRemotePatterns(),
    // Formatos modernos para mejor compresión
    formats: ['image/avif', 'image/webp'],
    // Tamaños de dispositivo para srcset
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Proxy para toda la API del backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
