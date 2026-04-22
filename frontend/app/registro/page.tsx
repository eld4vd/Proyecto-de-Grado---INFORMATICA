'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Envelope, Lock, Eye, EyeSlash, User, Phone, IdentificationCard, ArrowRight, WarningCircle, CircleNotch, CheckCircle, X, UserPlus } from '@phosphor-icons/react';
import { registroSchema, flattenErrors, type RegistroFormData } from '../lib/schemas';

export default function RegistroPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<RegistroFormData>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    nitCi: '',
    acceptTerms: false as unknown as true,
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

  // useCallback para handleChange - evita re-renders innecesarios
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Limpiar error del campo al escribir con functional setState
    setErrors(prev => {
      if (prev[name]) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  // Validación con Zod schema
  const validateForm = useCallback((): boolean => {
    const result = registroSchema.safeParse(formData);
    const newErrors = flattenErrors(result);
    setErrors(newErrors);
    return result.success;
  }, [formData]);

  // useCallback con useTransition para handleSubmit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({ type: 'error', message: 'Por favor corrige los errores del formulario' });
      return;
    }

    setToast(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            nombre: formData.nombre.trim(),
            apellido: formData.apellido.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            telefono: formData.telefono.trim(),
            nitCi: formData.nitCi.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error al registrar usuario');
        }

        // Éxito
        setToast({ 
          type: 'success', 
          message: '¡Registro exitoso! Redirigiendo...' 
        });

        // Esperar 1.5 segundos para que el usuario vea el mensaje
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);

      } catch (error) {
        console.error('Error al registrar:', error);
        setToast({
          type: 'error',
          message: error instanceof Error ? error.message : 'Error al registrar. Intenta nuevamente.',
        });
      }
    });
  }, [formData, router, validateForm]);

  return (
    <div className="min-h-screen bg-surface-deep flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 size-150 bg-accent/5 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 left-1/4 size-125 bg-accent/3 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(var(--th-accent) 1px, transparent 1px), linear-gradient(90deg, var(--th-accent) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Noise texture */}
        <div className="absolute inset-0 noise" />
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-9999 animate-in slide-in-from-top-2">
          <div className={`flex items-center gap-3 px-4 py-3 border shadow-xl min-w-75 max-w-md backdrop-blur-sm ${
            toast.type === 'success'
              ? 'bg-accent/10 border-accent text-accent'
              : 'bg-red-500/10 border-red-500 text-red-500'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle size={20} className="shrink-0" />
            ) : (
              <WarningCircle size={20} className="shrink-0" />
            )}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-content-secondary hover:text-content transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo y título con animación */}
        <div className="text-center mb-8 stagger-hero">
          <Link href="/" className="inline-block mb-6 group">
            <div className="flex items-center justify-center gap-3">
              <div className="size-14 bg-accent flex items-center justify-center transition-shadow duration-300 group-hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]">
                <span className="text-accent-contrast font-black text-2xl">SB</span>
              </div>
              <div>
                <h1 className="font-black text-3xl text-content tracking-tight">
                  SICA<span className="gradient-text">BIT</span>
                </h1>
                <p className="text-[10px] text-content-muted tracking-[0.2em] uppercase">Tech Store</p>
              </div>
            </div>
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="size-10 bg-accent/10 border border-accent/30 flex items-center justify-center">
              <UserPlus size={20} className="text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-content">Crear cuenta</h2>
          </div>
          <p className="text-content-secondary text-sm">
            Completa tus datos para registrarte
          </p>
        </div>

        {/* Formulario con borde distintivo */}
        <div className="bg-surface border border-line p-8 cyber-corners relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent" />
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-content-bright mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan"
                    autoComplete="given-name"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-deep border text-content placeholder:text-content-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors text-sm ${
                      errors.nombre ? 'border-red-500' : 'border-line'
                    }`}
                    disabled={isPending}
                  />
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                </div>
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <WarningCircle size={12} />
                    {errors.nombre}
                  </p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-content-bright mb-2">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Pérez"
                    autoComplete="family-name"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-deep border text-content placeholder:text-content-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors text-sm ${
                      errors.apellido ? 'border-red-500' : 'border-line'
                    }`}
                    disabled={isPending}
                  />
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                </div>
                {errors.apellido && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <WarningCircle size={12} />
                    {errors.apellido}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-content-bright mb-2">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 bg-surface-deep border text-content placeholder:text-content-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors text-sm ${
                    errors.email ? 'border-red-500' : 'border-line'
                  }`}
                  disabled={isPending}
                />
                <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <WarningCircle size={12} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Teléfono y NIT/CI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-content-bright mb-2">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="+591 70123456"
                    autoComplete="tel"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-deep border text-content placeholder:text-content-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors text-sm ${
                      errors.telefono ? 'border-red-500' : 'border-line'
                    }`}
                    disabled={isPending}
                  />
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                </div>
                {errors.telefono && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <WarningCircle size={12} />
                    {errors.telefono}
                  </p>
                )}
              </div>

              {/* NIT/CI */}
              <div>
                <label htmlFor="nitCi" className="block text-sm font-medium text-content-bright mb-2">
                  NIT/CI <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nitCi"
                    name="nitCi"
                    value={formData.nitCi}
                    onChange={handleChange}
                    placeholder="1234567"
                    autoComplete="off"
                    className={`w-full pl-10 pr-4 py-2.5 bg-surface-deep border text-content placeholder:text-content-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors text-sm ${
                      errors.nitCi ? 'border-red-500' : 'border-line'
                    }`}
                    disabled={isPending}
                  />
                  <IdentificationCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                </div>
                {errors.nitCi && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <WarningCircle size={12} />
                    {errors.nitCi}
                  </p>
                )}
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-content-bright mb-2">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-2.5 bg-surface-deep border text-content placeholder:text-content-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors text-sm ${
                    errors.password ? 'border-red-500' : 'border-line'
                  }`}
                  disabled={isPending}
                />
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-accent focus-visible:outline-none focus-visible:text-accent transition-colors"
                >
                  {showPassword ? <EyeSlash size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <WarningCircle size={12} />
                  {errors.password}
                </p>
              )}
              <p className="text-content-muted text-xs mt-1">Mínimo 8 caracteres, con mayúscula, minúscula y número</p>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-content-bright mb-2">
                Confirmar contraseña <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-2.5 bg-surface-deep border text-content placeholder:text-content-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent transition-colors text-sm ${
                    errors.confirmPassword ? 'border-red-500' : 'border-line'
                  }`}
                  disabled={isPending}
                />
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-accent focus-visible:outline-none focus-visible:text-accent transition-colors"
                >
                  {showConfirmPassword ? <EyeSlash size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <WarningCircle size={12} />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Términos y condiciones */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  size={16} className="mt-0.5 border-line bg-surface-deep text-accent focus:ring-accent focus:ring-offset-0"
                  disabled={isPending}
                />
                <span className={`text-sm flex-1 ${errors.acceptTerms ? 'text-red-500' : 'text-content-secondary group-hover:text-content-bright'}`}>
                  Acepto los{' '}
                  <Link href="/terminos" className="text-accent hover:underline">
                    términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacidad" className="text-accent hover:underline">
                    política de privacidad
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1 ml-7">
                  <WarningCircle size={12} />
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            {/* Botón de registro */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-accent text-accent-contrast py-3 font-bold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <CircleNotch size={20} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Link a login */}
          <div className="mt-6 text-center">
            <p className="text-content-secondary text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-accent hover:underline font-medium">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-surface border border-line">
          <div className="flex gap-3">
            <WarningCircle size={20} className="text-accent shrink-0 mt-0.5" />
            <div className="text-sm text-content-secondary">
              <p className="font-medium text-content mb-1">Información importante:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Tus datos están protegidos y encriptados</li>
                <li>El NIT/CI es necesario para la facturación</li>
                <li>Recibirás un correo de confirmación</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
