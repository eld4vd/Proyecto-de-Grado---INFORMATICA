import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayloadLite {
  role?: string;
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayloadLite | null {
  try {
    const [, payloadSegment] = token.split('.');
    if (!payloadSegment) return null;

    const decoded = Buffer.from(payloadSegment, 'base64url').toString('utf8');
    return JSON.parse(decoded) as JwtPayloadLite;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: JwtPayloadLite): boolean {
  if (typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 <= Date.now();
}

/**
 * Proxy de Next.js 16 — Protección de rutas y headers
 * 
 * Funciones:
 * 1. Redirigir usuarios logueados fuera de /login
 * 2. Proteger rutas /admin/*
 * 3. Proteger rutas /cuenta/*
 * 4. Establecer x-pathname para el layout
 * 
 * NOTA: El proxy de /api/* se maneja con rewrites en next.config.ts 
 * (más eficiente, a nivel de servidor, sin pasar por Node.js middleware).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // REDIRIGIR USUARIOS LOGUEADOS FUERA DE /login
  // ==========================================
  if (pathname === '/login') {
    const accessToken = request.cookies.get('access_token')?.value;

    // Solo redirigir si hay access token vigente.
    // Evita bloquear /login cuando solo queda un refresh token inválido.
    if (accessToken) {
      const payload = decodeJwtPayload(accessToken);

      if (payload && !isTokenExpired(payload)) {
        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // ==========================================
  // PROTECCIÓN DE RUTAS ADMIN
  // ==========================================
  if (pathname.startsWith('/admin')) {
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // Si no hay tokens, redirigir al login
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('type', 'admin');
      return NextResponse.redirect(loginUrl);
    }

    // Si hay access token, intentar decodificarlo para verificar el rol
    if (accessToken) {
      try {
        // Decodificar JWT (sin verificar firma - eso lo hace el backend)
        const payload = JSON.parse(
          Buffer.from(accessToken.split('.')[1], 'base64').toString()
        );

        // Si no es admin, redirigir al home
        if (payload.role !== 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } catch {
        // Token malformado, redirigir al login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('type', 'admin');
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // ==========================================
  // PROTECCIÓN DE RUTAS DE CLIENTE (/cuenta)
  // ==========================================
  if (pathname.startsWith('/cuenta')) {
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // Si no hay tokens, redirigir al login
    if (!accessToken && !refreshToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Agregar pathname al header para que el layout pueda detectar la ruta
  const response = NextResponse.next();
  response.headers.set('x-pathname', pathname);
  return response;
}

// Configurar en qué rutas aplicar el middleware
export const proxyConfig = {
  matcher: [
    // Redirigir usuarios logueados fuera de login
    '/login',
    // Proteger todas las rutas de admin
    '/admin/:path*',
    // Proteger rutas de cuenta de cliente
    '/cuenta/:path*',
    // Agregar pathname header a todas las rutas para el layout
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
