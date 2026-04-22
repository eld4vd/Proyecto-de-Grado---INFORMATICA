'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CaretRight, CaretLeft, MapPin, CreditCard, Check, Truck, ShieldCheck, CircleNotch, Laptop, Lock, Package, Clock, WarningCircle, Plus, PencilSimple, Sparkle, CheckCircle, Bag } from '@phosphor-icons/react';
import { useCart } from '../lib/cart-context';
import { useAuth } from '../lib/auth-context';
import { useToast } from '../components/ui/Toast';
import { checkoutDireccionExistenteSchema, checkoutNuevaDireccionSchema, checkoutTarjetaSchema, flattenErrors } from '../lib/schemas';

// Types
interface Direccion {
  id: string;
  calle: string;
  ciudad: string;
  departamento: string;
  codigoPostal?: string;
  esPredeterminada: boolean;
}

type MetodoPago = 'tarjeta' | 'transferencia' | 'contraentrega';

interface FormData {
  // Datos personales
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  // Dirección
  direccionId: string | null;
  calle: string;
  ciudad: string;
  departamento: string;
  codigoPostal: string;
  // Pago
  metodoPago: MetodoPago;
  // Tarjeta (simulada)
  numeroTarjeta: string;
  nombreTarjeta: string;
  expiracion: string;
  cvv: string;
  // Notas
  notas: string;
}

const departamentosBolivia = [
  'La Paz',
  'Sucre',
  'Cochabamba',
  'Oruro',
  'Potosí',
  'Tarija',
  'Chuquisaca',
  'Beni',
  'Pando'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    items,
    subtotal,
    descuentoPromo,
    promoAplicada,
    cart,
    refreshCart,
    clearPromo,
  } = useCart();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrdenNum, setSuccessOrdenNum] = useState<string>('');
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loadingDirecciones, setLoadingDirecciones] = useState(true);
  const [usarNuevaDireccion, setUsarNuevaDireccion] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccionId: null,
    calle: '',
    ciudad: '',
    departamento: '',
    codigoPostal: '',
    metodoPago: 'tarjeta',
    numeroTarjeta: '',
    nombreTarjeta: '',
    expiracion: '',
    cvv: '',
    notas: ''
  });

  // Calcular costos
  const costoEnvio = subtotal >= 500 ? 0 : 15;
  const total = subtotal + costoEnvio - descuentoPromo;

  // Cargar datos del usuario y direcciones en paralelo (Vercel Best Practice: async-parallel)
  // rerender-dependencies: usar campos primitivos específicos en lugar del objeto completo
  const userId = user?.id;
  const userName = user?.nombre ?? '';
  const userApellido = user?.apellido ?? '';
  const userEmail = user?.email ?? '';
  const userTelefono = user?.telefono ?? '';

  useEffect(() => {
    const initializeCheckout = async () => {
      if (!userId) {
        setLoadingDirecciones(false);
        return;
      }

      // Actualizar datos del formulario inmediatamente
      setFormData(prev => ({
        ...prev,
        nombre: userName,
        apellido: userApellido,
        email: userEmail,
        telefono: userTelefono,
      }));

      // Cargar direcciones
      try {
        const res = await fetch(`/api/direcciones/cliente/${userId}`, {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          setDirecciones(data);
          
          // Seleccionar dirección predeterminada
          const predeterminada = data.find((d: Direccion) => d.esPredeterminada);
          if (predeterminada) {
            setFormData(prev => ({ ...prev, direccionId: predeterminada.id }));
          } else if (data.length > 0) {
            setFormData(prev => ({ ...prev, direccionId: data[0].id }));
          } else {
            setUsarNuevaDireccion(true);
          }
        }
      } catch (err) {
        console.error('Error al cargar direcciones:', err);
      } finally {
        setLoadingDirecciones(false);
      }
    };

    initializeCheckout();
  }, [userId, userName, userApellido, userEmail, userTelefono]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [authLoading, isAuthenticated, router]);

  // Redirigir si carrito vacío (pero no si ya se completó la compra)
  useEffect(() => {
    if (items.length === 0 && !authLoading && !showSuccess) {
      router.push('/carrito');
    }
  }, [items, authLoading, showSuccess, router]);

  // Handlers con useCallback para evitar re-renders innecesarios
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleDireccionSelect = useCallback((direccionId: string) => {
    setFormData(prev => ({ ...prev, direccionId }));
    setUsarNuevaDireccion(false);
  }, []);

  const formatCardNumber = useCallback((value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  }, []);

  const formatExpiration = useCallback((value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  }, []);

  const validateStep = useCallback((currentStep: number): boolean => {
    setError(null);
    
    if (currentStep === 1) {
      if (!usarNuevaDireccion) {
        const result = checkoutDireccionExistenteSchema.safeParse({ direccionId: formData.direccionId ?? '' });
        if (!result.success) {
          const errors = flattenErrors(result);
          setError(Object.values(errors)[0]);
          return false;
        }
      } else {
        const result = checkoutNuevaDireccionSchema.safeParse(formData);
        if (!result.success) {
          const errors = flattenErrors(result);
          setError(Object.values(errors)[0]);
          return false;
        }
      }
    }
    
    if (currentStep === 2) {
      if (formData.metodoPago === 'tarjeta') {
        const result = checkoutTarjetaSchema.safeParse(formData);
        if (!result.success) {
          const errors = flattenErrors(result);
          setError(Object.values(errors)[0]);
          return false;
        }
      }
    }
    
    return true;
  }, [usarNuevaDireccion, formData]);

  const nextStep = useCallback(() => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateStep, step]);

  const prevStep = useCallback(() => {
    setStep(prev => prev - 1);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // useTransition para handleSubmit - mejor UX durante carga
  const handleSubmit = useCallback(async () => {
    if (!validateStep(step)) return;
    
    setError(null);

    startTransition(async () => {
      try {
        // Construir dirección de envío
        let direccionEnvioTexto = '';
        if (usarNuevaDireccion) {
          direccionEnvioTexto = `${formData.calle}, ${formData.ciudad}, ${formData.departamento}${formData.codigoPostal ? `, CP: ${formData.codigoPostal}` : ''}`;
          
          // Opcionalmente, guardar la nueva dirección
          if (userId) {
            await fetch('/api/direcciones', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                clienteId: userId,
                calle: formData.calle,
                ciudad: formData.ciudad,
                departamento: formData.departamento,
                codigoPostal: formData.codigoPostal || null,
                esPredeterminada: direcciones.length === 0
              })
            });
          }
        }

        // Crear la orden
        const ordenData = {
          clienteId: userId,
          carritoId: cart?.id,
          direccionId: usarNuevaDireccion ? undefined : formData.direccionId,
          direccionEnvioTexto: usarNuevaDireccion ? direccionEnvioTexto : undefined,
          codigoPromocional: promoAplicada?.codigo || undefined,
          costoEnvio,
          notas: formData.notas || undefined
        };

        const res = await fetch('/api/ordenes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(ordenData)
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Error al crear la orden');
        }

        const orden = await res.json();

        // Simular proceso de pago en frontend
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Actualizar estado de la orden para métodos no contra entrega.
        // Si esta actualización falla, no bloqueamos la compra porque la orden ya fue creada.
        if (formData.metodoPago !== 'contraentrega') {
          try {
            await fetch(`/api/ordenes/${orden.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                estadoPago: 'APROBADO',
                estado: 'PAGADO',
              })
            });
          } catch (paymentSyncError) {
            console.warn('No se pudo sincronizar el estado de pago de la orden:', paymentSyncError);
          }
        }

        // Refrescar carrito (debería estar vacío ahora)
        await refreshCart();
        clearPromo();

        // Mostrar celebración inline
        setSuccessOrdenNum(orden.numeroOrden);
        setShowSuccess(true);

        // Redirigir a productos después de 5 segundos
        setTimeout(() => {
          router.push('/productos');
        }, 5000);
      } catch (err: any) {
        setError(err.message || 'Error al procesar el pedido');
        showToast({
          type: 'error',
          title: 'Error al procesar la compra',
          message: err.message || 'Ocurrió un error al procesar tu pedido. Por favor intenta nuevamente.',
          duration: 5000,
        });
      }
    });
  }, [validateStep, step, usarNuevaDireccion, formData, userId, cart, promoAplicada?.codigo, costoEnvio, direcciones, refreshCart, clearPromo, router, showToast]);

  // Helper para obtener imagen del producto
  const getProductImage = (producto: any) => {
    if (producto?.imagenes && producto.imagenes.length > 0) {
      const principal = producto.imagenes.find((img: any) => img.esPrincipal);
      return principal?.url || producto.imagenes[0].url;
    }
    return null;
  };

  // Formatear precio
  const formatPrice = (precio: number | string) => {
    const num = typeof precio === 'string' ? parseFloat(precio) : precio;
    return num.toLocaleString('es-BO', { minimumFractionDigits: 2 });
  };

  // Loading state
  if (authLoading || loadingDirecciones) {
    return (
      <div className="min-h-screen bg-surface-deep flex items-center justify-center">
        <div className="text-center">
          <CircleNotch size={40} className="text-accent animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="text-content-secondary">Cargando checkout…</p>
        </div>
      </div>
    );
  }

  // Obtener dirección seleccionada
  const direccionSeleccionada = direcciones.find(d => d.id === formData.direccionId);

  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Progress Bar */}
      <div className="bg-surface border-b border-line-soft sticky top-0 z-40">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/20 to-transparent" />
        <div className="container-custom py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-content-muted mb-4">
            <Link href="/" className="hover:text-accent transition-colors">Inicio</Link>
            <CaretRight size={16} />
            <Link href="/carrito" className="hover:text-accent transition-colors">Carrito</Link>
            <CaretRight size={16} />
            <span className="text-accent">Checkout</span>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {[
              { num: 1, label: 'Envío', icon: MapPin },
              { num: 2, label: 'Pago', icon: CreditCard },
              { num: 3, label: 'Confirmar', icon: Check }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 transition-colors ${
                  step === s.num 
                    ? 'bg-accent/10 text-accent' 
                    : step > s.num 
                      ? 'text-accent' 
                      : 'text-content-muted'
                }`}>
                  <div className={`size-8 flex items-center justify-center transition-colors ${
                    step > s.num 
                      ? 'bg-accent text-accent-contrast' 
                      : step === s.num 
                        ? 'bg-accent/20 border-2 border-accent' 
                        : 'bg-surface-hover border border-line-med'
                  }`}>
                    {step > s.num ? (
                      <Check size={16} />
                    ) : (
                      <s.icon size={16} />
                    )}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{s.label}</span>
                </div>
                {i < 2 && (
                  <div className={`w-8 md:w-16 h-0.5 mx-2 transition-colors ${
                    step > s.num ? 'bg-accent' : 'bg-line-med'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-8 relative">
        {/* Background glow */}
        <div className="absolute top-0 right-0 size-100 bg-accent/3 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="grid lg:grid-cols-3 gap-8 relative z-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-danger/10 border border-danger/30 flex items-start gap-3">
                <WarningCircle size={20} className="text-danger shrink-0 mt-0.5" />
                <p className="text-danger text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="bg-surface border border-line-soft p-6 relative overflow-hidden">
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-accent via-accent/50 to-transparent" />
                  
                  <h2 className="text-xl font-bold text-content mb-6 flex items-center gap-3">
                    <div className="size-10 bg-accent/10 border border-accent/30 flex items-center justify-center">
                      <MapPin size={20} className="text-accent" />
                    </div>
                    Dirección de envío
                  </h2>

                  {/* Direcciones guardadas */}
                  {direcciones.length > 0 && !usarNuevaDireccion && (
                    <div className="space-y-3 mb-6">
                      {direcciones.map(dir => (
                        <label
                          key={dir.id}
                          className={`flex items-start gap-4 p-4 cursor-pointer transition-all border ${
                            formData.direccionId === dir.id
                              ? 'bg-accent/5 border-accent'
                              : 'border-line-med hover:border-accent/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="direccion"
                            checked={formData.direccionId === dir.id}
                            onChange={() => handleDireccionSelect(dir.id)}
                            className="mt-1 accent-accent"
                          />
                          <div className="flex-1">
                            <p className="text-content font-medium">
                              {dir.calle}
                              {dir.esPredeterminada && (
                                <span className="ml-2 px-2 py-0.5 text-[10px] bg-accent/20 text-accent uppercase">
                                  Predeterminada
                                </span>
                              )}
                            </p>
                            <p className="text-content-muted text-sm">
                              {dir.ciudad}, {dir.departamento}
                              {dir.codigoPostal && ` - CP: ${dir.codigoPostal}`}
                            </p>
                          </div>
                        </label>
                      ))}

                      <button
                        onClick={() => setUsarNuevaDireccion(true)}
                        className="w-full flex items-center justify-center gap-2 p-4 border border-dashed border-line-med rounded-xl text-content-secondary hover:text-accent hover:border-accent transition-colors"
                      >
                        <Plus size={16} />
                        Usar otra dirección
                      </button>
                    </div>
                  )}

                  {/* Nueva dirección */}
                  {(usarNuevaDireccion || direcciones.length === 0) && (
                    <div className="space-y-4">
                      {direcciones.length > 0 && (
                        <button
                          onClick={() => setUsarNuevaDireccion(false)}
                          className="text-sm text-accent hover:underline mb-4"
                        >
                          ← Usar dirección guardada
                        </button>
                      )}
                      
                      <div>
                        <label htmlFor="checkout-calle" className="block text-sm text-content-secondary mb-2">
                          Dirección <span className="text-danger">*</span>
                        </label>
                        <input
                          id="checkout-calle"
                          type="text"
                          name="calle"
                          value={formData.calle}
                          onChange={handleChange}
                          placeholder="Calle, número, edificio, piso…"
                          autoComplete="street-address"
                          className="w-full h-12 px-4 bg-surface-card border border-line-med rounded-xl text-content placeholder:text-content-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="checkout-ciudad" className="block text-sm text-content-secondary mb-2">
                            Ciudad <span className="text-danger">*</span>
                          </label>
                          <input
                            id="checkout-ciudad"
                            type="text"
                            name="ciudad"
                            value={formData.ciudad}
                            onChange={handleChange}
                            placeholder="Ej: Sucre"
                            autoComplete="address-level2"
                            className="w-full h-12 px-4 bg-surface-card border border-line-med rounded-xl text-content placeholder:text-content-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors"
                          />
                        </div>
                        <div>
                          <label htmlFor="checkout-departamento" className="block text-sm text-content-secondary mb-2">
                            Departamento <span className="text-danger">*</span>
                          </label>
                          <select
                            id="checkout-departamento"
                            name="departamento"
                            value={formData.departamento}
                            onChange={handleChange}
                            autoComplete="address-level1"
                            className="w-full h-12 px-4 bg-surface-card border border-line-med rounded-xl text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">Seleccionar…</option>
                            {departamentosBolivia.map(dep => (
                              <option key={dep} value={dep}>{dep}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="checkout-codigoPostal" className="block text-sm text-content-secondary mb-2">
                          Código Postal <span className="text-content-faint">(Opcional)</span>
                        </label>
                        <input
                          id="checkout-codigoPostal"
                          type="text"
                          name="codigoPostal"
                          value={formData.codigoPostal}
                          onChange={handleChange}
                          placeholder="Ej: 0000"
                          autoComplete="postal-code"
                          inputMode="numeric"
                          className="w-full h-12 px-4 bg-surface-card border border-line-med rounded-xl text-content placeholder:text-content-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery info */}
                <div className="bg-surface border border-line-soft rounded-2xl p-6">
                  <h3 className="font-semibold text-content mb-4 flex items-center gap-2">
                    <Truck size={20} className="text-accent" />
                    Información de entrega
                  </h3>
                  <div className="flex items-center gap-4 p-4 bg-surface-card rounded-xl">
                    <div className="size-12 bg-accent/10 rounded-xl flex items-center justify-center">
                      <Clock size={24} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-content">Entrega estimada</p>
                      <p className="text-sm text-content-secondary">
                        {(() => {
                          const fecha = new Date();
                          fecha.setDate(fecha.getDate() + 3);
                          const fechaFin = new Date(fecha);
                          fechaFin.setDate(fechaFin.getDate() + 2);
                          return `${fecha.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'short' })} - ${fechaFin.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'short' })}`;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Link
                    href="/carrito"
                    className="flex items-center gap-2 px-6 py-3 text-content-secondary hover:text-content transition-colors"
                  >
                    <CaretLeft size={16} />
                    Volver al carrito
                  </Link>
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-accent text-accent-contrast font-semibold rounded-xl hover:bg-accent-hover transition-colors"
                  >
                    Continuar
                    <CaretRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-surface border border-line-soft rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-content mb-6 flex items-center gap-3">
                    <div className="size-10 bg-accent/10 rounded-xl flex items-center justify-center">
                      <CreditCard size={20} className="text-accent" />
                    </div>
                    Método de pago
                  </h2>

                  {/* Payment methods */}
                  <div className="space-y-3 mb-6">
                    {[
                      { id: 'tarjeta', label: 'Tarjeta de crédito/débito', desc: 'Visa, Mastercard, American Express', icon: CreditCard },
                      { id: 'transferencia', label: 'Transferencia bancaria', desc: 'Banco Nacional, BCP, Mercantil', icon: Package },
                      { id: 'contraentrega', label: 'Pago contra entrega', desc: 'Paga cuando recibas tu pedido', icon: Truck }
                    ].map(method => (
                      <label
                        key={method.id}
                        className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                          formData.metodoPago === method.id
                            ? 'bg-accent/5 border-accent'
                            : 'border-line-med hover:border-accent/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="metodoPago"
                          value={method.id}
                          checked={formData.metodoPago === method.id}
                          onChange={handleChange}
                          className="mt-1 accent-accent"
                        />
                        <div className="flex-1">
                          <p className="text-content font-medium flex items-center gap-2">
                            <method.icon size={16} className="text-accent" />
                            {method.label}
                          </p>
                          <p className="text-content-muted text-sm">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Card form */}
                  {formData.metodoPago === 'tarjeta' && (
                    <div className="space-y-4 p-4 bg-surface-card rounded-xl border border-line">
                      <p className="text-xs text-content-muted flex items-center gap-2 mb-4">
                        <Lock size={12} />
                        Pago seguro - Tus datos están protegidos
                      </p>
                      
                      <div>
                        <label htmlFor="checkout-numeroTarjeta" className="block text-sm text-content-secondary mb-2">
                          Número de tarjeta <span className="text-danger">*</span>
                        </label>
                        <input
                          id="checkout-numeroTarjeta"
                          type="text"
                          name="numeroTarjeta"
                          value={formData.numeroTarjeta}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            numeroTarjeta: formatCardNumber(e.target.value) 
                          }))}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          autoComplete="cc-number"
                          inputMode="numeric"
                          spellCheck={false}
                          className="w-full h-12 px-4 bg-surface border border-line-med rounded-xl text-content placeholder:text-content-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors font-mono"
                        />
                        <p className="text-[10px] text-content-faint mt-1">
                          Prueba: 4242 4242 4242 4242
                        </p>
                      </div>

                      <div>
                        <label htmlFor="checkout-nombreTarjeta" className="block text-sm text-content-secondary mb-2">
                          Nombre del titular <span className="text-danger">*</span>
                        </label>
                        <input
                          id="checkout-nombreTarjeta"
                          type="text"
                          name="nombreTarjeta"
                          value={formData.nombreTarjeta}
                          onChange={handleChange}
                          placeholder="Como aparece en la tarjeta"
                          autoComplete="cc-name"
                          spellCheck={false}
                          className="w-full h-12 px-4 bg-surface border border-line-med rounded-xl text-content placeholder:text-content-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors uppercase"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="checkout-expiracion" className="block text-sm text-content-secondary mb-2">
                            Expiración <span className="text-danger">*</span>
                          </label>
                          <input
                            id="checkout-expiracion"
                            type="text"
                            name="expiracion"
                            value={formData.expiracion}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              expiracion: formatExpiration(e.target.value) 
                            }))}
                            placeholder="MM/AA"
                            maxLength={5}
                            autoComplete="cc-exp"
                            inputMode="numeric"
                            spellCheck={false}
                            className="w-full h-12 px-4 bg-surface border border-line-med rounded-xl text-content placeholder:text-content-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors font-mono"
                          />
                        </div>
                        <div>
                          <label htmlFor="checkout-cvv" className="block text-sm text-content-secondary mb-2">
                            CVV <span className="text-danger">*</span>
                          </label>
                          <input
                            id="checkout-cvv"
                            type="password"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="•••"
                            maxLength={4}
                            autoComplete="cc-csc"
                            inputMode="numeric"
                            spellCheck={false}
                            className="w-full h-12 px-4 bg-surface border border-line-med rounded-xl text-content placeholder:text-content-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.metodoPago === 'transferencia' && (
                    <div className="p-4 bg-surface-card rounded-xl border border-line">
                      <p className="text-content-secondary text-sm mb-3">
                        Recibirás los datos bancarios por correo después de confirmar tu pedido.
                      </p>
                      <div className="flex items-center gap-2 text-accent text-sm">
                        <Check size={16} />
                        Tu pedido se reservará por 48 horas
                      </div>
                    </div>
                  )}

                  {formData.metodoPago === 'contraentrega' && (
                    <div className="p-4 bg-surface-card rounded-xl border border-line">
                      <p className="text-content-secondary text-sm mb-3">
                        Paga en efectivo o con tarjeta cuando recibas tu pedido.
                      </p>
                      <div className="flex items-center gap-2 text-yellow-500 text-sm">
                        <WarningCircle size={16} />
                        Disponible solo para entregas locales
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-surface border border-line-soft rounded-2xl p-6">
                  <h3 className="font-semibold text-content mb-4">
                    Notas del pedido <span className="text-content-faint font-normal">(Opcional)</span>
                  </h3>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    placeholder="Instrucciones especiales para la entrega, referencias, etc."
                    rows={3}
                    className="w-full p-4 bg-surface-card border border-line-med rounded-xl text-content placeholder:text-content-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors resize-none"
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 text-content-secondary hover:text-content transition-colors"
                  >
                    <CaretLeft size={16} />
                    Volver
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-accent text-accent-contrast font-semibold rounded-xl hover:bg-accent-hover transition-colors"
                  >
                    Revisar pedido
                    <CaretRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-surface border border-line-soft rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-content mb-6 flex items-center gap-3">
                    <div className="size-10 bg-accent/10 rounded-xl flex items-center justify-center">
                      <Check size={20} className="text-accent" />
                    </div>
                    Revisar y confirmar
                  </h2>

                  {/* Shipping summary */}
                  <div className="mb-6 p-4 bg-surface-card rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-content font-medium flex items-center gap-2">
                        <MapPin size={16} className="text-accent" />
                        Dirección de envío
                      </h4>
                      <button onClick={() => setStep(1)} className="text-accent text-sm hover:underline">
                        Editar
                      </button>
                    </div>
                    {direccionSeleccionada ? (
                      <p className="text-content-secondary text-sm">
                        {direccionSeleccionada.calle}, {direccionSeleccionada.ciudad}, {direccionSeleccionada.departamento}
                      </p>
                    ) : (
                      <p className="text-content-secondary text-sm">
                        {formData.calle}, {formData.ciudad}, {formData.departamento}
                      </p>
                    )}
                  </div>

                  {/* Payment summary */}
                  <div className="mb-6 p-4 bg-surface-card rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-content font-medium flex items-center gap-2">
                        <CreditCard size={16} className="text-accent" />
                        Método de pago
                      </h4>
                      <button onClick={() => setStep(2)} className="text-accent text-sm hover:underline">
                        Editar
                      </button>
                    </div>
                    <p className="text-content-secondary text-sm">
                      {formData.metodoPago === 'tarjeta' && `Tarjeta terminada en ${formData.numeroTarjeta.slice(-4)}`}
                      {formData.metodoPago === 'transferencia' && 'Transferencia bancaria'}
                      {formData.metodoPago === 'contraentrega' && 'Pago contra entrega'}
                    </p>
                  </div>

                  {/* Products */}
                  <div className="space-y-3">
                    <h4 className="text-content font-medium mb-3">Productos ({items.length})</h4>
                    {items.map(item => {
                      const precio = typeof item.precioUnitario === 'string' ? parseFloat(item.precioUnitario) : item.precioUnitario;
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-surface-card rounded-xl">
                          <div className="size-16 bg-surface-hover rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                            {getProductImage(item.producto) ? (
                              <Image
                                src={getProductImage(item.producto)!}
                                alt={item.producto.nombre}
                                width={64}
                                height={64}
                                className="object-contain"
                              />
                            ) : (
                              <Laptop size={32} className="text-placeholder-icon" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-content text-sm font-medium truncate">{item.producto.nombre}</p>
                            <p className="text-content-muted text-xs">Cant: {item.cantidad}</p>
                          </div>
                          <p className="text-content font-semibold tabular-nums">${formatPrice(precio * item.cantidad)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 text-content-secondary hover:text-content transition-colors"
                  >
                    <CaretLeft size={16} />
                    Volver
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="flex items-center gap-2 px-8 py-3 bg-accent text-accent-contrast font-semibold rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
                        Procesando…
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span className="tabular-nums">Confirmar y pagar ${formatPrice(total)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-line-soft rounded-2xl p-6 sticky top-40">
              <h3 className="font-bold text-content text-lg mb-6">Resumen del pedido</h3>

              {/* Items preview */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map(item => {
                  const precio = typeof item.precioUnitario === 'string' ? parseFloat(item.precioUnitario) : item.precioUnitario;
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="size-12 bg-surface-card rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {getProductImage(item.producto) ? (
                          <Image
                            src={getProductImage(item.producto)!}
                            alt={item.producto.nombre}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        ) : (
                          <Laptop size={24} className="text-placeholder-icon" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-content text-sm truncate">{item.producto.nombre}</p>
                        <p className="text-content-muted text-xs">x{item.cantidad}</p>
                      </div>
                      <p className="text-content text-sm font-medium tabular-nums">${formatPrice(precio * item.cantidad)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-line-med pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-content-secondary">Subtotal</span>
                  <span className="text-content tabular-nums">${formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-content-secondary">Envío</span>
                  <span className={`tabular-nums ${costoEnvio === 0 ? 'text-accent' : 'text-content'}`}>
                    {costoEnvio === 0 ? 'Gratis' : `$${formatPrice(costoEnvio)}`}
                  </span>
                </div>
                {descuentoPromo > 0 && (
                  <div className="flex justify-between text-sm text-accent">
                    <span>
                      Descuento {promoAplicada?.codigo ? `(${promoAplicada.codigo})` : ''}
                    </span>
                    <span className="tabular-nums">-${formatPrice(descuentoPromo)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-line-med pt-3">
                  <span className="text-content">Total</span>
                  <span className="text-accent tabular-nums">${formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-line-med space-y-3">
                <div className="flex items-center gap-3 text-xs text-content-muted">
                  <Lock size={16} className="text-accent" />
                  <span>Pago 100% seguro</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-content-muted">
                  <Truck size={16} className="text-accent" />
                  <span>Envío gratis en compras +$500</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-content-muted">
                  <ShieldCheck size={16} className="text-accent" />
                  <span>Garantía de satisfacción</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebración de compra exitosa */}
      {showSuccess && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-surface-deep/95">
          {/* Fondo de partículas */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Firework bursts */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`burst-${i}`}
                className="absolute"
                style={{
                  left: `${12 + (i * 11)}%`,
                  top: `${15 + Math.random() * 35}%`,
                  animation: `fireworkBurst 2s ease-out ${i * 0.3}s both`,
                }}
              >
                {[...Array(10)].map((_, j) => (
                  <div
                    key={j}
                    className="absolute size-2 rounded-full"
                    style={{
                      backgroundColor: ['var(--th-accent)', 'var(--th-accent-hover)', '#ffffff', '#ffff00', '#ff6b6b', '#00d4ff'][j % 6],
                      animation: `fireworkParticle 1.5s ease-out ${i * 0.3}s both`,
                      transform: `rotate(${j * 36}deg) translateY(-50px)`,
                    }}
                  />
                ))}
              </div>
            ))}

            {/* Sparkle flotantes */}
            {[...Array(25)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute bottom-0"
                style={{
                  left: `${Math.random() * 100}%`,
                  animation: `floatUp ${3 + Math.random() * 2}s ease-out ${Math.random() * 2}s both`,
                }}
              >
                <Sparkle className={`size-4 ${['text-accent', 'text-yellow-400', 'text-content', 'text-cyan-400'][i % 4]} opacity-70`} />
              </div>
            ))}

            {/* Confetti */}
            {[...Array(40)].map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute size-2.5"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  backgroundColor: ['var(--th-accent)', 'var(--th-accent-hover)', '#ffff00', '#ff6b6b', '#00d4ff', '#ff00ff', '#ffffff'][i % 7],
                  borderRadius: i % 2 === 0 ? '50%' : '2px',
                  animation: `confettiFall ${3 + Math.random() * 2}s ease-in ${Math.random() * 2}s both`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>

          {/* Card central */}
          <div className="relative z-10 text-center px-6 max-w-lg mx-auto" style={{ animation: 'successAppear 0.6s ease-out both' }}>
            {/* Ícono de éxito animado */}
            <div className="relative size-28 mx-auto mb-8">
              <div className="absolute inset-0 bg-accent/20 rounded-full" style={{ animation: 'successPing 2s ease-out 0.3s both' }} />
              <div className="absolute -inset-2.5 bg-accent/10 rounded-full animate-pulse" />
              <div className="relative size-28 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/50" style={{ animation: 'successBounce 0.6s ease-out 0.2s both' }}>
                <CheckCircle className="size-14 text-accent-contrast" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-content mb-3">
              ¡Compra exitosa!
            </h1>
            <p className="text-content-secondary text-lg mb-2">
              Tu pedido ha sido procesado correctamente
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-line-med rounded-xl mb-8">
              <span className="text-content-secondary text-sm">Pedido:</span>
              <span className="font-mono font-bold text-accent">{successOrdenNum}</span>
            </div>

            <p className="text-content-muted text-sm mb-6">
              Te enviaremos un correo con los detalles de tu compra
            </p>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/cuenta/pedidos"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-line-med text-content font-medium rounded-xl hover:border-accent transition-colors"
              >
                <Package size={16} />
                Ver mis pedidos
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-bold rounded-xl hover:bg-accent-hover transition-colors"
              >
                <Bag size={16} />
                Seguir comprando
              </Link>
            </div>

            {/* Barra de progreso de redirección */}
            <div className="mt-8">
              <p className="text-xs text-content-faint mb-2">Redirigiendo a productos…</p>
              <div className="w-48 h-1 bg-surface-hover rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ animation: 'progressBar 5s linear both' }} />
              </div>
            </div>
          </div>

          {/* CSS animations inline */}
          <style jsx>{`
            @keyframes fireworkBurst {
              0% { opacity: 0; transform: scale(0); }
              50% { opacity: 1; transform: scale(1.2); }
              100% { opacity: 0; transform: scale(1.5); }
            }
            @keyframes fireworkParticle {
              0% { opacity: 1; transform: rotate(var(--rotate, 0deg)) translateY(0); }
              100% { opacity: 0; transform: rotate(var(--rotate, 0deg)) translateY(-80px); }
            }
            @keyframes floatUp {
              0% { opacity: 0; transform: translateY(0); }
              20% { opacity: 1; }
              100% { opacity: 0; transform: translateY(-100vh); }
            }
            @keyframes confettiFall {
              0% { opacity: 1; transform: translateY(0) rotate(0deg); }
              100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
            }
            @keyframes successAppear {
              0% { opacity: 0; transform: scale(0.8) translateY(30px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes successPing {
              0% { transform: scale(1); opacity: 0.5; }
              100% { transform: scale(2.5); opacity: 0; }
            }
            @keyframes successBounce {
              0% { transform: scale(0); }
              60% { transform: scale(1.15); }
              100% { transform: scale(1); }
            }
            @keyframes progressBar {
              0% { width: 0%; }
              100% { width: 100%; }
            }
            @media (prefers-reduced-motion: reduce) {
              *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
