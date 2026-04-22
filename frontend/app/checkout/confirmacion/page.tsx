'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Package, Truck, Envelope, ArrowRight, Copy, Check, MapPin, CreditCard, Laptop, CircleNotch, Bag, Phone, ChatCircle, Sparkle } from '@phosphor-icons/react';

interface Orden {
  id: string;
  numeroOrden: string;
  estado: string;
  estadoPago: string;
  subtotal: string | number;
  costoEnvio: string | number;
  total: string | number;
  direccionEnvioTexto: string | null;
  notas: string | null;
  createdAt: string;
  cliente: {
    nombre: string;
    apellido: string;
    email: string;
  };
  items: Array<{
    id: string;
    cantidad: number;
    precioUnitario: string | number;
    nombreProducto: string;
    producto: {
      id: string;
      nombre: string;
      imagenes: Array<{ url: string; esPrincipal: boolean }>;
    };
  }>;
  pagos: Array<{
    metodoPago: string;
    estado: string;
  }>;
}

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const numeroOrden = searchParams.get('orden');
  
  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Cargar orden
  useEffect(() => {
    const fetchOrden = async () => {
      if (!numeroOrden) {
        setError('No se encontró el número de orden');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/ordenes/numero/${numeroOrden}`, {
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error('Orden no encontrada');
        }

        const data = await res.json();
        setOrden(data);

        // Solo mostrar celebración si el usuario viene del checkout (compra recién hecha)
        // Se usa sessionStorage para marcar que la compra fue reciente
        const celebrationKey = `celebration_${numeroOrden}`;
        const shouldCelebrate = sessionStorage.getItem(celebrationKey);
        if (shouldCelebrate) {
          sessionStorage.removeItem(celebrationKey);
          setTimeout(() => {
            setShowCelebration(true);
          }, 500);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrden();
  }, [numeroOrden]);

  const copyOrderNumber = () => {
    if (orden?.numeroOrden) {
      navigator.clipboard.writeText(orden.numeroOrden);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (precio: number | string) => {
    const num = typeof precio === 'string' ? parseFloat(precio) : precio;
    return num.toLocaleString('es-BO', { minimumFractionDigits: 2 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-BO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryDate = () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 3);
    const fechaFin = new Date(fecha);
    fechaFin.setDate(fechaFin.getDate() + 2);
    return `${fecha.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })} - ${fechaFin.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}`;
  };

  const getProductImage = (item: Orden['items'][0]) => {
    if (item.producto?.imagenes && item.producto.imagenes.length > 0) {
      const principal = item.producto.imagenes.find(img => img.esPrincipal);
      return principal?.url || item.producto.imagenes[0].url;
    }
    return null;
  };

  const getMetodoPagoLabel = (metodo: string) => {
    const labels: Record<string, string> = {
      'tarjeta_credito': 'Tarjeta de crédito/débito',
      'transferencia': 'Transferencia bancaria',
      'contra_entrega': 'Pago contra entrega',
      'tarjeta': 'Tarjeta de crédito/débito',
      'qr': 'Pago QR',
      'efectivo': 'Pago en efectivo',
      'TARJETA_CREDITO': 'Tarjeta de crédito/débito',
      'TRANSFERENCIA': 'Transferencia bancaria',
      'CONTRA_ENTREGA': 'Pago contra entrega'
    };
    return labels[metodo] || metodo;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-deep flex items-center justify-center">
        <div className="text-center">
          <CircleNotch size={40} className="text-accent animate-spin mx-auto mb-4" />
          <p className="text-content-secondary">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div className="min-h-screen bg-surface-deep flex items-center justify-center">
        <div className="text-center">
          <div className="size-20 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-danger" />
          </div>
          <h1 className="text-2xl font-bold text-content mb-2">Orden no encontrada</h1>
          <p className="text-content-muted mb-6">{error || 'No pudimos encontrar esta orden'}</p>
          <Link 
            href="/productos" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold rounded-xl hover:bg-accent-hover transition-colors"
          >
            Ir a la tienda
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Celebration overlay with fireworks */}
      {showCelebration && (
        <>
          {/* Full screen celebration backdrop */}
          <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            {/* Firework bursts */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`burst-${i}`}
                className="absolute animate-firework-burst"
                style={{
                  left: `${15 + (i * 10)}%`,
                  top: `${20 + Math.random() * 30}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                {[...Array(12)].map((_, j) => (
                  <div
                    key={j}
                    className="absolute size-2 rounded-full animate-firework-particle"
                    style={{
                      backgroundColor: ['var(--th-accent)', 'var(--th-accent-hover)', '#ffffff', '#ffff00', '#ff6b6b', '#00d4ff'][j % 6],
                      transform: `rotate(${j * 30}deg) translateY(-60px)`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            ))}
            
            {/* Sparkle floating up */}
            {[...Array(30)].map((_, i) => (
              <div
                key={`sparkle-${i}`}
                className="absolute animate-float-up"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              >
                <Sparkle className={`w-${3 + Math.floor(Math.random() * 3)} h-${3 + Math.floor(Math.random() * 3)} ${['text-accent', 'text-yellow-400', 'text-content', 'text-cyan-400'][i % 4]} opacity-80`} />
              </div>
            ))}

            {/* Confetti pieces */}
            {[...Array(50)].map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="size-3 absolute animate-confetti-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['var(--th-accent)', 'var(--th-accent-hover)', '#ffff00', '#ff6b6b', '#00d4ff', '#ff00ff', '#ffffff'][i % 7],
                  borderRadius: i % 2 === 0 ? '50%' : '0',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>

          {/* Success banner */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none animate-banner-appear">
            <div className="bg-linear-to-r from-accent via-accent-hover to-accent p-1 rounded-3xl shadow-2xl shadow-accent/30 animate-banner-pulse">
              <div className="bg-surface-deep px-12 py-8 rounded-3xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl md:text-4xl font-bold text-content mb-2">
                    ¡Pedido Exitoso!
                  </h2>
                  <p className="text-accent text-lg">
                    Tu compra ha sido procesada correctamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Header */}
      <section className="bg-linear-to-b from-accent/5 to-transparent py-12 md:py-16">
        <div className="container-custom text-center">
          {/* Success animation */}
          <div className="relative size-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute -inset-2 bg-accent/10 rounded-full animate-pulse" />
            <div className="relative size-24 bg-accent rounded-full flex items-center justify-center animate-bounce-once shadow-lg shadow-accent/50">
              <CheckCircle size={48} className="text-accent-contrast" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-content mb-3">
            ¡Pedido confirmado!
          </h1>
          <p className="text-content-secondary text-lg mb-6">
            Gracias por tu compra, {orden.cliente.nombre}
          </p>

          {/* Order number */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-surface border border-line-med rounded-2xl">
            <span className="text-content-secondary">Número de orden:</span>
            <span className="font-mono font-bold text-accent text-lg">{orden.numeroOrden}</span>
            <button
              onClick={copyOrderNumber}
              className="p-2 hover:bg-surface-soft rounded-lg transition-colors"
              title="Copiar número de orden"
            >
              {copied ? (
                <Check size={16} className="text-accent" />
              ) : (
                <Copy size={16} className="text-content-secondary" />
              )}
            </button>
          </div>
        </div>
      </section>

      <div className="container-custom pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order timeline */}
            <div className="bg-surface border border-line-soft rounded-2xl p-6">
              <h2 className="font-bold text-content text-lg mb-6">Estado del pedido</h2>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-line-med" />
                
                {/* Steps */}
                <div className="space-y-6">
                  {[
                    { 
                      icon: CheckCircle, 
                      label: 'Pedido confirmado', 
                      desc: formatDate(orden.createdAt),
                      active: true,
                      completed: true
                    },
                    { 
                      icon: Package, 
                      label: 'Preparando pedido', 
                      desc: 'Estamos preparando tus productos',
                      active: orden.estado === 'PENDIENTE',
                      completed: ['PAGADO', 'ENVIADO', 'ENTREGADO'].includes(orden.estado)
                    },
                    { 
                      icon: Truck, 
                      label: 'En camino', 
                      desc: `Entrega estimada: ${getDeliveryDate()}`,
                      active: orden.estado === 'ENVIADO',
                      completed: orden.estado === 'ENTREGADO'
                    },
                    { 
                      icon: CheckCircle, 
                      label: 'Entregado', 
                      desc: 'Pedido entregado con éxito',
                      active: false,
                      completed: orden.estado === 'ENTREGADO'
                    }
                  ].map((step, index) => (
                    <div key={index} className="relative flex items-start gap-4 pl-12">
                      <div className={`absolute left-0 size-12 rounded-full flex items-center justify-center transition-colors ${
                        step.completed 
                          ? 'bg-accent text-accent-contrast' 
                          : step.active 
                            ? 'bg-accent/20 border-2 border-accent text-accent' 
                            : 'bg-surface-hover border border-line-med text-content-muted'
                      }`}>
                        <step.icon size={20} />
                      </div>
                      <div>
                        <p className={`font-medium ${step.completed || step.active ? 'text-content' : 'text-content-muted'}`}>
                          {step.label}
                        </p>
                        <p className="text-sm text-content-muted">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order details */}
            <div className="bg-surface border border-line-soft rounded-2xl p-6">
              <h2 className="font-bold text-content text-lg mb-6">Detalles del pedido</h2>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {/* Shipping */}
                <div className="p-4 bg-surface-card rounded-xl">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">Dirección de envío</span>
                  </div>
                  <p className="text-content-secondary text-sm">
                    {orden.direccionEnvioTexto || 'No especificada'}
                  </p>
                </div>

                {/* Payment */}
                <div className="p-4 bg-surface-card rounded-xl">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <CreditCard size={16} />
                    <span className="text-sm font-medium">Método de pago</span>
                  </div>
                  <p className="text-content-secondary text-sm">
                    {orden.pagos?.[0]
                      ? getMetodoPagoLabel(orden.pagos[0].metodoPago)
                      : orden.estadoPago === 'APROBADO'
                        ? 'Pago aprobado (método no registrado)'
                        : 'Pago pendiente'}
                  </p>
                  <p className={`text-xs mt-1 ${orden.estadoPago === 'APROBADO' ? 'text-accent' : 'text-yellow-500'}`}>
                    {orden.estadoPago === 'APROBADO' ? '✓ Pago confirmado' : '⏳ Pago pendiente'}
                  </p>
                </div>
              </div>

              {/* Products */}
              <h3 className="font-medium text-content mb-4">Productos ({orden.items.length})</h3>
              <div className="space-y-3">
                {orden.items.map(item => {
                  const precio = typeof item.precioUnitario === 'string' ? parseFloat(item.precioUnitario) : item.precioUnitario;
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-surface-card rounded-xl">
                      <div className="size-16 bg-surface-hover rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {getProductImage(item) ? (
                          <Image
                            src={getProductImage(item)!}
                            alt={item.nombreProducto || item.producto.nombre}
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        ) : (
                          <Laptop size={32} className="text-placeholder-icon" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/productos/${item.producto.id}`}
                          className="text-content text-sm font-medium truncate hover:text-accent transition-colors block"
                        >
                          {item.nombreProducto || item.producto.nombre}
                        </Link>
                        <p className="text-content-muted text-xs">Cantidad: {item.cantidad}</p>
                      </div>
                      <p className="text-content font-semibold tabular-nums">${formatPrice(precio * item.cantidad)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/cuenta/pedidos" 
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-surface border border-line-med text-content font-medium rounded-xl hover:border-accent transition-colors"
              >
                <Package size={16} />
                Ver mis pedidos
              </Link>
              <Link 
                href="/productos" 
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-contrast font-semibold rounded-xl hover:bg-accent-hover transition-colors"
              >
                <Bag size={16} />
                Seguir comprando
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order summary */}
            <div className="bg-surface border border-line-soft rounded-2xl p-6">
              <h3 className="font-bold text-content text-lg mb-4">Resumen</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-content-secondary">Subtotal</span>
                  <span className="text-content tabular-nums">${formatPrice(orden.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-secondary">Envío</span>
                  <span className={`tabular-nums ${Number(orden.costoEnvio) === 0 ? 'text-accent' : 'text-content'}`}>
                    {Number(orden.costoEnvio) === 0 ? 'Gratis' : `$${formatPrice(orden.costoEnvio)}`}
                  </span>
                </div>
                <div className="border-t border-line-med pt-3 flex justify-between font-bold text-lg">
                  <span className="text-content">Total</span>
                  <span className="text-accent tabular-nums">${formatPrice(orden.total)}</span>
                </div>
              </div>
            </div>

            {/* Confirmation email */}
            <div className="bg-surface border border-line-soft rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Envelope size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-medium text-content">Email de confirmación</p>
                  <p className="text-xs text-content-muted">Enviado a:</p>
                </div>
              </div>
              <p className="text-accent text-sm break-all">{orden.cliente.email}</p>
            </div>

            {/* Help */}
            <div className="bg-surface border border-line-soft rounded-2xl p-6">
              <h3 className="font-medium text-content mb-4">¿Necesitas ayuda?</h3>
              <div className="space-y-3">
                <a 
                  href="tel:+591123456789" 
                  className="flex items-center gap-3 p-3 bg-surface-card rounded-xl text-content-secondary hover:text-content transition-colors"
                >
                  <Phone size={16} className="text-accent" />
                  <span className="text-sm">+591 123 456 789</span>
                </a>
                <a 
                  href="https://wa.me/591123456789" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-surface-card rounded-xl text-content-secondary hover:text-content transition-colors"
                >
                  <ChatCircle size={16} className="text-accent" />
                  <span className="text-sm">WhatsApp</span>
                </a>
                <Link 
                  href="/soporte/contacto-directo" 
                  className="flex items-center gap-3 p-3 bg-surface-card rounded-xl text-content-secondary hover:text-content transition-colors"
                >
                  <Envelope size={16} className="text-accent" />
                  <span className="text-sm">Contactar soporte</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-deep flex items-center justify-center">
        <div className="text-center">
          <CircleNotch size={40} className="text-accent animate-spin mx-auto mb-4" />
          <p className="text-content-secondary">Cargando...</p>
        </div>
      </div>
    }>
      <ConfirmacionContent />
    </Suspense>
  );
}
