'use client';

import { useState, useEffect, Suspense, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Envelope, Lock, Eye, EyeSlash, User, ShieldCheck, ArrowRight, WarningCircle, CircleNotch, CheckCircle, X } from '@phosphor-icons/react';
import { loginCliente, loginAdmin } from '../lib/auth';
import { useCart } from '../lib/cart-context';
import { useAuth } from '../lib/auth-context';
import { loginSchema, flattenErrors } from '../lib/schemas';

type UserType = 'cliente' | 'admin';

// Skeleton de carga para el login
function LoginSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex bg-surface-deep">
      <div className="hidden lg:flex lg:w-1/2 bg-surface" />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="h-12 bg-surface-soft animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 bg-surface-soft animate-pulse" />
            <div className="h-10 bg-surface-soft animate-pulse" />
            <div className="h-12 bg-accent/20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshCart } = useCart();
  const { refreshAuth } = useAuth();
  
  // Obtener tipo de usuario y redirect de los query params
  const typeParam = searchParams.get('type') as UserType | null;
  const redirectParam = searchParams.get('redirect');
  
  const [userType, setUserType] = useState<UserType>(typeParam || 'cliente');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Actualizar userType si cambia en URL
  useEffect(() => {
    if (typeParam) {
      setUserType(typeParam);
    }
  }, [typeParam]);

  // Functional setState con useCallback (rerender-functional-setstate)
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setToast(null);
  }, []);

  // Submit con useTransition (rendering-usetransition-loading)
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    // Validar con Zod antes de enviar
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = flattenErrors(validation);
      const firstError = Object.values(fieldErrors)[0];
      setToast({ type: 'error', message: firstError || 'Completa los campos correctamente' });
      return;
    }

    startTransition(async () => {
      try {
        // Llamar a la API correspondiente
        const loginFn = userType === 'admin' ? loginAdmin : loginCliente;
        
        let result;
        let attempts = 0;
        const maxAttempts = 2;
        
        // Retry logic para problemas de conexión
        while (attempts < maxAttempts) {
          try {
            result = await loginFn({
              email: formData.email,
              password: formData.password,
            });
            break; // Si funciona, salir del loop
          } catch (err) {
            attempts++;
            if (attempts >= maxAttempts) {
              throw err; // Lanzar error después de intentos agotados
            }
            // Esperar 300ms antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }

        if (result && result.success) {
          setToast({ type: 'success', message: '¡Inicio de sesión exitoso! Redirigiendo...' });
          
          // Refrescar el estado de autenticación global
          await refreshAuth();
          
          // Refrescar el carrito después del login
          await refreshCart();
          
          // Redirigir después de un breve delay
          setTimeout(() => {
            if (userType === 'admin') {
              router.push(redirectParam || '/admin/dashboard');
            } else {
              router.push(redirectParam || '/');
            }
            router.refresh(); // Refrescar para actualizar el estado de auth
          }, 1000);
        }
      } catch (err) {
        setToast({ 
          type: 'error', 
          message: err instanceof Error ? err.message : 'Credenciales incorrectas' 
        });
      }
    });
  }, [userType, formData.email, formData.password, refreshAuth, refreshCart, router, redirectParam]);

  return (
    <div className="fixed inset-0 z-50 flex bg-surface-deep">
      {/* Toast notification - Floating */}
      {toast && (
        <div className="fixed top-6 right-6 z-100 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 max-w-md shadow-2xl border ${
            toast.type === 'error'
              ? 'bg-danger/95 border-danger text-white'
              : 'bg-accent/95 border-accent text-accent-contrast'
          }`}>
            {toast.type === 'error' ? (
              <WarningCircle size={20} className="shrink-0" />
            ) : (
              <CheckCircle size={20} className="shrink-0" />
            )}
            <p className="font-medium text-sm">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              aria-label="Cerrar notificación"
              className="ml-2 hover:opacity-70 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Left side - Branding with distinctive effects — always dark */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[#111111] to-[#050505]" />
        <div className="absolute top-0 right-0 size-125 bg-accent/8 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 left-0 size-100 bg-accent/5 blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--th-accent) 1px, transparent 1px), linear-gradient(90deg, var(--th-accent) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Scan line effect */}
        <div className="absolute inset-0 scan-line" />
        
        {/* Noise texture */}
        <div className="absolute inset-0 noise" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo with glow */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="size-12 bg-accent flex items-center justify-center transition-shadow duration-300 group-hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]">
              <span className="text-black font-black text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-white">SicaBit</span>
          </Link>
          
          {/* Central content with stagger animation */}
          <div className="max-w-md stagger-hero">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 bg-accent/10 border border-accent/20 text-accent text-sm font-medium">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-accent"></span>
              </span>
              Acceso seguro
            </div>
            
            <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
              Bienvenido a la mejor tienda de <span className="text-accent">tecnología</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              Accede a tu cuenta para disfrutar de ofertas exclusivas, 
              seguimiento de pedidos y mucho más.
            </p>
            
            {/* Features with hover effects */}
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4 p-3 -mx-3 transition-colors hover:bg-white/5 group cursor-default">
                <div className="size-10 bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:border-accent/50 transition-colors">
                  <ArrowRight size={20} className="text-accent" />
                </div>
                <span className="text-white/80 group-hover:text-white transition-colors">Ofertas exclusivas para miembros</span>
              </div>
              <div className="flex items-center gap-4 p-3 -mx-3 transition-colors hover:bg-white/5 group cursor-default">
                <div className="size-10 bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:border-accent/50 transition-colors">
                  <ArrowRight size={20} className="text-accent" />
                </div>
                <span className="text-white/80 group-hover:text-white transition-colors">Seguimiento de pedidos en tiempo real</span>
              </div>
              <div className="flex items-center gap-4 p-3 -mx-3 transition-colors hover:bg-white/5 group cursor-default">
                <div className="size-10 bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:border-accent/50 transition-colors">
                  <ArrowRight size={20} className="text-accent" />
                </div>
                <span className="text-white/80 group-hover:text-white transition-colors">Historial de compras y favoritos</span>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <p className="text-white/30 text-sm">
            © 2026 SicaBit. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="size-10 bg-accent flex items-center justify-center">
                <span className="text-accent-contrast font-black text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-content">SicaBit</span>
            </Link>
          </div>

          {/* User type tabs */}
          <div className="flex mb-8 border border-line-med">
            <button
              type="button"
              onClick={() => setUserType('cliente')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                userType === 'cliente'
                  ? 'bg-accent text-accent-contrast'
                  : 'bg-transparent text-content-secondary hover:text-content'
              }`}
            >
              <User size={16} />
              Cliente
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                userType === 'admin'
                  ? 'bg-accent text-accent-contrast'
                  : 'bg-transparent text-content-secondary hover:text-content'
              }`}
            >
              <ShieldCheck size={16} />
              Administrador
            </button>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-content mb-2">
              {userType === 'admin' ? 'Panel de Administración' : 'Iniciar Sesión'}
            </h2>
            <p className="text-content-muted">
              {userType === 'admin' 
                ? 'Accede al dashboard de administración'
                : 'Ingresa tus credenciales para continuar'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-content-bright mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Envelope size={20} className="text-content-muted" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-surface border border-line-med text-content placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-content-bright mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-content-muted" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 bg-surface border border-line-med text-content placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-content-muted hover:text-content focus-visible:outline-none focus-visible:text-accent transition-colors"
                >
                  {showPassword ? <EyeSlash size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="size-5 border border-line-med bg-surface peer-checked:bg-accent peer-checked:border-accent transition-colors flex items-center justify-center">
                    {formData.remember && (
                      <svg className="size-3 text-accent-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-content-secondary group-hover:text-content transition-colors">
                  Recordarme
                </span>
              </label>
              
              <Link 
                href="/recuperar-password" 
                className="text-sm text-accent hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-accent text-accent-contrast font-semibold hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <CircleNotch size={20} className="animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Register link (only for clients) */}
          {userType === 'cliente' && (
            <div className="mt-8 pt-6 border-t border-line-soft text-center">
              <p className="text-content-muted">
                ¿No tienes una cuenta?{' '}
                <Link href="/registro" className="text-accent font-medium hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          )}

          {/* Admin notice */}
          {userType === 'admin' && (
            <div className="mt-8 pt-6 border-t border-line-soft">
              <div className="p-4 bg-surface border border-line-med">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={20} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-content-bright font-medium">Acceso restringido</p>
                    <p className="text-xs text-content-muted mt-1">
                      Esta sección es solo para personal autorizado. 
                      Si no eres administrador, usa el acceso de cliente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-sm text-content-faint hover:text-content transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper con Suspense para useSearchParams (Vercel Best Practice: async-suspense-boundaries)
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
