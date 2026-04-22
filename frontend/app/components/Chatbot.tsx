'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { PaperPlaneTilt, X, User, Sparkle, CircleNotch, Robot, ArrowCounterClockwise } from '@phosphor-icons/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamic import para ReactMarkdown (reduce bundle inicial ~50KB)
const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => <span className="animate-pulse">Cargando...</span>
});

interface Producto {
  id: string;
  nombre: string;
  slug: string;
  precio: number;
  marca?: string | null;
  imagen?: string | null;
}

// Sugerencias de navegación del backend
interface Sugerencia {
  tipo: 'categoria' | 'busqueda' | 'filtro';
  texto: string;
  link: string;
}

interface Mensaje {
  role: 'user' | 'assistant';
  content: string;
  productos?: Producto[];
  sugerencias?: Sugerencia[];
}

// Reproduce un sonido del chatbot (cacheado en memoria)
const chatSounds: Record<string, HTMLAudioElement> = {};
function playSound(name: 'chat-open' | 'chat-close' | 'chat-message') {
  try {
    if (!chatSounds[name]) {
      chatSounds[name] = new Audio(`/sounds/${name}.wav`);
      chatSounds[name].volume = name === 'chat-message' ? 0.35 : 0.5;
    }
    const audio = chatSounds[name];
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // Audio not supported
  }
}

export default function Chatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');
  
  // No mostrar chatbot en rutas de admin, soporte, login ni flujo de compra
  const isHiddenRoute =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/soporte') ||
    pathname === '/login' ||
    pathname?.startsWith('/carrito') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/productos/');
  
  // useMemo para evitar recrear el array en cada render (rerender-memo)
  const mensajeInicial = useMemo<Mensaje[]>(() => [
    {
      role: 'assistant',
      content:
        '¡Hola! 👋 Soy tu asistente virtual de SicaBit. ¿Qué producto estás buscando? Puedo ayudarte según tu presupuesto, si eres estudiante, gamer, o lo que necesites.',
    },
  ], []);
  
  // Lazy state init - solo se ejecuta una vez (rerender-lazy-state-init)
  const [conversacion, setConversacion] = useState<Mensaje[]>(() => [
    {
      role: 'assistant',
      content:
        '¡Hola! 👋 Soy tu asistente virtual de SicaBit. ¿Qué producto estás buscando? Puedo ayudarte según tu presupuesto, si eres estudiante, gamer, o lo que necesites.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [chatbotVisible, setChatbotVisible] = useState(true);
  
  // Inicializar como true para que servidor y cliente coincidan (hydration-safe)
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Actualizar isFirstTime después de la hidratación
  useEffect(() => {
    try {
      const hasOpened = localStorage.getItem('chatbot-opened:v1');
      setIsFirstTime(!hasOpened);
    } catch {
      // Incognito/private browsing
    }
  }, []);

  // Auto-scroll al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversacion]);

  // Escuchar evento de logout para reiniciar el chatbot (useCallback para estabilidad)
  const handleLogout = useCallback(() => {
    setConversacion(mensajeInicial);
    setOpen(false);
  }, [mensajeInicial]);

  useEffect(() => {
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, [handleLogout]);

  // Tooltip cada 5 segundos solo si es primera vez y está cerrado
  useEffect(() => {
    if (!isFirstTime || open) return;

    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000); // Mostrar por 3 segundos
    }, 5000); // Cada 5 segundos

    // Mostrar inmediatamente la primera vez
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000);

    return () => clearInterval(interval);
  }, [isFirstTime, open]);

  // useCallback + functional setState para callbacks estables (rerender-functional-setstate)
  const enviarMensaje = useCallback(async () => {
    if (!mensaje.trim() || loading) return;

    const textoMensaje = mensaje.trim();
    const nuevoMensaje: Mensaje = { role: 'user', content: textoMensaje };
    
    // Functional setState - no necesita dependencias del estado actual
    setConversacion(prev => [...prev, nuevoMensaje]);
    setMensaje('');
    setLoading(true);

    try {
      // Llamar directamente al backend (endpoint público con rate limiting)
      const res = await fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: textoMensaje }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error en la respuesta');
      }

      const data = await res.json();
      // Functional setState - incluir sugerencias si existen
      setConversacion(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.respuesta,
          productos: data.productosRecomendados,
          sugerencias: data.sugerencias,
        },
      ]);
      playSound('chat-message');
    } catch (error) {
      console.error(error);
      // Functional setState
      setConversacion(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error de conexión. Por favor intenta de nuevo. 😅',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [mensaje, loading]);

  const sugerencias = [
    '💻 Laptop para estudiar',
    '🎮 PC gamer económica',
    '🖱️ Periféricos gaming',
    '📱 Accesorios de oficina',
  ];

  // useCallback para callbacks estables (rerender-functional-setstate)
  const usarSugerencia = useCallback((sug: string) => {
    // Quitar emoji y espacios extra
    const textoLimpio = sug.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
    setMensaje(textoLimpio);
  }, []);

  // localStorage versionado con try-catch (client-localstorage-schema)
  const handleOpen = useCallback(() => {
    setOpen(true);
    playSound('chat-open');
    if (isFirstTime) {
      try {
        localStorage.setItem('chatbot-opened:v1', 'true');
      } catch {
        // Incognito/private browsing - silently fail
      }
      setIsFirstTime(false);
    }
  }, [isFirstTime]);

  const handleClose = useCallback(() => {
    setOpen(false);
    playSound('chat-close');
  }, []);

  // No renderizar nada en rutas excluidas
  if (isHiddenRoute) return null;

  return (
    <>
      {/* Botón para re-habilitar el chatbot cuando está oculto */}
      {!chatbotVisible && !open && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <button
            onClick={() => setChatbotVisible(true)}
            className="flex items-center gap-2 bg-surface border border-accent/40 text-accent text-xs font-semibold px-3 py-2 rounded-sm shadow-lg hover:bg-accent hover:text-black transition-all duration-200 hover:shadow-[0_0_16px_rgba(57,255,20,0.5)] cursor-pointer"
          >
            <Robot size={14} />
            Habilitar chatbot
          </button>
        </div>
      )}

      {/* Robotón flotante con logo del chatbot */}
      {!open && chatbotVisible && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <div className="relative">
            {/* Botón de cerrar/ocultar */}
            <button
              onClick={() => setChatbotVisible(false)}
              className="absolute -top-1 -right-1 z-20 size-5 rounded-full bg-surface border border-line text-content-muted hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all duration-200 flex items-center justify-center"
              aria-label="Ocultar chatbot"
            >
              <X size={10} weight="bold" />
            </button>
            <button
              onClick={handleOpen}
              className="block hover:scale-110 transition-transform duration-200 cursor-pointer"
              aria-label="Abrir asistente"
            >
              <Image
                src="/chatbot.webp"
                alt="Chatbot"
                width={120}
                height={120}
                className="animate-chatbot-glow"
              />
            </button>
          </div>
          
          {/* Tooltip cada 5 segundos */}
          {isFirstTime && showTooltip && (
            <div className="absolute bottom-full right-0 mb-3 whitespace-nowrap animate-fade-in">
              <div className="bg-accent text-accent-contrast px-4 py-2.5 rounded-lg font-semibold text-sm shadow-lg relative">
                Usar chatbot IA
                <div className="absolute top-full right-6 size-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-accent" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ventana de chat */}
      {open && (
        <div className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-100 sm:h-150 bg-surface border border-line rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-line bg-linear-to-r from-accent/10 to-transparent shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-12 flex items-center justify-center -ml-1">
                <Image
                  src="/chatbot.webp"
                  alt="Chatbot"
                  width={80}
                  height={80}
                  className="drop-shadow-lg"
                />
              </div>
              <div>
                <h3 className="text-content font-semibold flex items-center gap-2">
                  Asistente Tech
                  <Sparkle size={16} className="text-accent" aria-hidden="true" />
                </h3>
                <p className="text-xs text-content-muted">Powered by Groq AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Robotón reiniciar conversación */}
              {conversacion.length > 1 && (
                <button
                  onClick={() => setConversacion(mensajeInicial)}
                  className="text-content-secondary hover:text-accent transition-colors p-1 group"
                  aria-label="Reiniciar conversación"
                  title="Reiniciar conversación"
                >
                  <ArrowCounterClockwise size={16} className="group-hover:rotate-180 transition-transform duration-300" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="text-content-secondary hover:text-content transition-colors p-1"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversacion.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                {msg.role === 'user' ? (
                  <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-line-med">
                    <User size={16} className="text-content" aria-hidden="true" />
                  </div>
                ) : (
                  <div className="size-10 flex items-center justify-center shrink-0 -ml-1">
                    <Image
                      src="/chatbot.webp"
                      alt="Chatbot"
                      width={64}
                      height={64}
                      className="drop-shadow-md"
                    />
                  </div>
                )}

                {/* Contenido */}
                <div className={`flex-1 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div
                    className={`p-3 rounded-lg max-w-[85%] ${
                      msg.role === 'user'
                        ? 'bg-accent text-accent-contrast'
                        : 'bg-surface-soft text-content-bright'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap m-0">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-content">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-content">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-content">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-content">{children}</h3>,
                          code: ({ children }) => <code className="bg-black/30 px-1 py-0.5 rounded text-accent text-xs">{children}</code>,
                          a: ({ children, href }) => <a href={href} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* Productos recomendados */}
                  {msg.productos && msg.productos.length > 0 && (
                    <div className="mt-3 space-y-2 max-w-[85%]">
                      <p className="text-xs text-content-muted mb-2">Productos recomendados:</p>
                      {msg.productos.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/productos/${prod.slug}`}
                          onClick={() => setOpen(false)}
                          className="block bg-surface-card border border-line p-3 rounded hover:border-accent/30 transition-colors group"
                        >
                          <div className="flex gap-3">
                            {prod.imagen ? (
                              <Image
                                src={prod.imagen}
                                alt={prod.nombre}
                                width={56}
                                height={56}
                                className="size-14 object-cover rounded"
                              />
                            ) : (
                              <div className="size-14 bg-surface-soft rounded flex items-center justify-center">
                                <Robot size={24} className="text-content-faint" aria-hidden="true" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-content text-sm font-medium group-hover:text-accent transition-colors line-clamp-2">
                                {prod.nombre}
                              </h4>
                              {prod.marca && (
                                <p className="text-xs text-content-muted">{prod.marca}</p>
                              )}
                              <p className="text-accent font-bold mt-1">
                                Bs. {prod.precio.toLocaleString('es-BO')}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Sugerencias de navegación inteligentes */}
                  {msg.sugerencias && msg.sugerencias.length > 0 && (
                    <div className="mt-3 max-w-[85%]">
                      <p className="text-xs text-content-muted mb-2">🧭 Accesos rápidos:</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.sugerencias.map((sug, idx) => (
                          <Link
                            key={idx}
                            href={sug.link}
                            onClick={() => setOpen(false)}
                            className={`text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 border ${
                              sug.tipo === 'categoria'
                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                                : sug.tipo === 'filtro'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
                                : 'bg-accent/10 text-accent border-accent/30 hover:bg-accent/20'
                            }`}
                          >
                            <span>
                              {sug.tipo === 'categoria' ? '📂' : sug.tipo === 'filtro' ? '🔍' : '🔎'}
                            </span>
                            {sug.texto}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="size-10 flex items-center justify-center shrink-0 -ml-1">
                  <Image
                    src="/chatbot.webp"
                    alt="Chatbot"
                    width={64}
                    height={64}
                    className="drop-shadow-md"
                  />
                </div>
                <div className="bg-surface-soft text-content-bright p-3 rounded-lg flex items-center gap-2">
                  <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
                  <span className="text-sm">Pensando…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias rápidas */}
          {conversacion.length === 1 && (
            <div className="px-4 pb-2 shrink-0">
              <p className="text-xs text-content-muted mb-2">Sugerencias rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {sugerencias.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => usarSugerencia(sug)}
                    className="text-xs px-3 py-1.5 bg-surface-soft text-content-secondary rounded-full hover:bg-surface-hover hover:text-accent transition-colors border border-transparent hover:border-accent/30"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-line shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
                placeholder="Escribe tu consulta…"
                autoComplete="off"
                aria-label="Mensaje para el asistente"
                className="flex-1 bg-surface-soft border border-line-med text-content px-4 py-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:border-accent text-sm"
                disabled={loading}
              />
              <button
                onClick={enviarMensaje}
                disabled={loading || !mensaje.trim()}
                className="px-4 py-2.5 bg-accent text-accent-contrast rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar"
              >
                <PaperPlaneTilt size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
