'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, ChatText, CheckCircle, User, SignIn, PaperPlaneTilt, CircleNotch, Bag } from '@phosphor-icons/react';
import Link from 'next/link';
import type { Resena, ResenaStats } from '../../lib/types';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const API_BASE = '/api';

// rating-label: derive text from number (js-early-exit)
const RATING_LABELS: Record<number, string> = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Bueno',
  5: 'Excelente',
};

// rendering-hoist-jsx: static JSX hoisted outside component
const sectionHeader = (
  <div className="flex items-center gap-4 mb-8">
    <ChatText size={24} className="text-accent" aria-hidden="true" />
    <h2 className="text-2xl font-bold text-content">Reseñas y calificaciones</h2>
    <div className="flex-1 h-px bg-linear-to-r from-accent/30 to-transparent" />
  </div>
);

// Star array hoisted to avoid re-creation (rendering-hoist-jsx)
const STARS = [1, 2, 3, 4, 5] as const;
const STARS_DESC = [5, 4, 3, 2, 1] as const;

function StarRating({
  rating,
  size = 'sm',
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  // rerender-derived-state: derive size class during render
  const sizeClass = size === 'lg' ? 'size-8' : size === 'md' ? 'size-6' : 'size-4';

  return (
    <div className="flex gap-0.5">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= (hoverRating || rating)
                ? 'fill-star text-star'
                : 'fill-content-faint text-content-faint'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StatsBar({ count, total, stars }: { count: number; total: number; stars: number }) {
  // rerender-derived-state: derive percentage during render
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-content-secondary w-12 text-right">{stars} <Star size={12} className="inline fill-gray-400 text-content-secondary" /></span>
      <div className="flex-1 h-2 bg-surface-soft rounded-full overflow-hidden">
        <div
          className="h-full bg-star rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-content-muted w-8">{count}</span>
    </div>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getInitials(nombre: string, apellido: string) {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Resena[]>([]);
  const [stats, setStats] = useState<ResenaStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [canReview, setCanReview] = useState<{ puede: boolean; razon: string | null } | null>(null);

  // Form state
  const [rating, setRating] = useState(0);
  const [titulo, setTitulo] = useState('');
  const [comentario, setComentario] = useState('');

  // rerender-derived-state: derive authentication status during render, not in state
  const isAuthenticated = authUser !== null;
  const normalizedRole = authUser?.role?.toLowerCase() ?? '';
  const isCliente = normalizedRole === 'cliente';
  // El id del user ES el clienteId cuando el rol es cliente
  const clienteId = isCliente ? authUser!.id : null;

  // async-parallel: fetch reviews + stats in parallel
  const fetchReviews = useCallback(async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/resenas/producto/${productId}`),
        fetch(`${API_BASE}/resenas/producto/${productId}/stats`),
      ]);

      if (reviewsRes.ok) setReviews(await reviewsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // async-parallel: fetch auth AND reviews simultaneously on mount
  useEffect(() => {
    const init = async () => {
      // Launch both in parallel — no dependency between them
      const [, authResult] = await Promise.all([
        fetchReviews(),
        fetchAuth(),
      ]);

      // If authenticated as cliente, check if can review (depends on auth result)
      const authRole = authResult?.role?.toLowerCase();
      if (authRole === 'cliente') {
        try {
          const canRes = await fetch(
            `${API_BASE}/resenas/puede-resenar/${productId}/${authResult!.id}`,
          );
          if (canRes.ok) {
            setCanReview(await canRes.json());
          } else {
            setCanReview({ puede: false, razon: 'No se pudo verificar elegibilidad' });
          }
        } catch {
          setCanReview({ puede: false, razon: 'No se pudo verificar elegibilidad' });
        }
      } else if (authResult) {
        setCanReview({ puede: false, razon: 'Solo clientes pueden dejar reseñas' });
      }
    };

    async function fetchAuth(): Promise<AuthUser | null> {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) return null; // js-early-exit

        const data = await res.json();
        const user: AuthUser = data.user ?? data;
        setAuthUser(user);
        return user;
      } catch {
        return null;
      }
    }

    init();
  }, [productId, fetchReviews]);

  // rerender-move-effect-to-event: all submit logic in the handler, not in effects
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // js-early-exit: validate and return early
    if (rating === 0) {
      setSubmitError('Selecciona una calificación');
      return;
    }
    if (!clienteId) {
      setSubmitError('No se pudo identificar tu cuenta');
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_BASE}/resenas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productoId: productId,
          clienteId,
          calificacion: rating,
          titulo: titulo.trim() || null,
          comentario: comentario.trim() || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al enviar la reseña');
      }

      // rerender-functional-setstate: use functional form for state resets
      setSubmitSuccess(true);
      setShowForm(false);
      setRating(0);
      setTitulo('');
      setComentario('');
      setCanReview({ puede: false, razon: 'Ya dejaste una reseña para este producto' });

      await fetchReviews();

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error al enviar la reseña');
    } finally {
      setSubmitLoading(false);
    }
  };

  // js-early-exit: return loading state early
  if (isLoading) {
    return (
      <div className="mt-16 relative z-10">
        {sectionHeader}
        <div className="flex items-center justify-center py-16">
          <CircleNotch size={32} className="text-accent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 relative z-10">
      {sectionHeader}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stats panel */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-line-soft rounded-sm p-6 sticky top-24 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-accent via-accent/50 to-transparent" />

            {/* rendering-conditional-render: explicit ternary */}
            {stats !== null && stats.total > 0 ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-content mb-2">
                    {stats.promedio.toFixed(1)}
                  </div>
                  <StarRating rating={Math.round(stats.promedio)} size="md" />
                  <p className="text-sm text-content-muted mt-2">
                    {stats.total} {stats.total === 1 ? 'reseña' : 'reseñas'}
                  </p>
                </div>
                <div className="space-y-2">
                  {STARS_DESC.map((stars) => (
                    <StatsBar
                      key={stars}
                      stars={stars}
                      count={stats.distribucion[stars] || 0}
                      total={stats.total}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Star size={48} className="text-gray-700 mx-auto mb-3" />
                <p className="text-content-secondary font-medium">Sin reseñas aún</p>
                <p className="text-sm text-content-faint mt-1">Sé el primero en opinar</p>
              </div>
            )}

            {/* Write review button */}
            <div className="mt-6 pt-6 border-t border-line-soft">
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-surface-soft hover:bg-surface-hover text-content rounded-sm transition-colors text-sm font-medium"
                >
                  <SignIn size={16} />
                  Inicia sesión para opinar
                </Link>
              ) : canReview === null ? (
                <div className="flex items-center justify-center py-3">
                  <CircleNotch size={16} className="text-content-muted animate-spin" />
                </div>
              ) : canReview.puede ? (
                <button
                  onClick={() => setShowForm((prev) => !prev)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-accent hover:bg-accent-hover text-accent-contrast rounded-sm transition-colors text-sm font-bold"
                >
                  <Star size={16} />
                  Escribir reseña
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 text-sm text-content-muted py-3 text-center">
                  {/* Icono contextual según la razón */}
                  {canReview.razon?.includes('comprar') ? (
                    <Bag size={16} className="text-content-muted shrink-0" />
                  ) : (
                    <CheckCircle size={16} className="text-accent shrink-0" />
                  )}
                  <span>{canReview.razon}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews list + form */}
        <div className="lg:col-span-2">
          {/* Success message */}
          {submitSuccess ? (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/30 rounded-sm flex items-center gap-3">
              <CheckCircle size={20} className="text-accent shrink-0" />
              <p className="text-sm text-accent">
                ¡Tu reseña se ha publicado correctamente! Gracias por tu opinión.
              </p>
            </div>
          ) : null}

          {/* Write review form */}
          {showForm ? (
            <div className="mb-8 bg-surface border border-accent/30 rounded-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent" />
              <h3 className="text-lg font-semibold text-content mb-4">
                Tu opinión sobre {productName}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-2">
                    Calificación *
                  </label>
                  <StarRating rating={rating} size="lg" interactive onRate={setRating} />
                  {rating > 0 ? (
                    <p className="text-sm text-content-muted mt-1">{RATING_LABELS[rating]}</p>
                  ) : null}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-2">
                    Título (opcional)
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    autoComplete="off"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Resumen de tu experiencia…"
                    maxLength={255}
                    className="w-full px-4 py-3 bg-surface-card border border-line-med rounded-sm text-content placeholder-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-2">
                    Comentario (opcional)
                  </label>
                  <textarea
                    name="comentario"
                    autoComplete="off"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Cuéntanos más sobre tu experiencia con este producto…"
                    rows={4}
                    className="w-full px-4 py-3 bg-surface-card border border-line-med rounded-sm text-content placeholder-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors resize-none"
                  />
                </div>

                {/* Error */}
                {submitError ? (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-sm">
                    <p className="text-sm text-red-400">{submitError}</p>
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitLoading || rating === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-accent-contrast font-bold rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? (
                      <CircleNotch size={16} className="animate-spin" />
                    ) : (
                      <PaperPlaneTilt size={16} />
                    )}
                    Publicar reseña
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setSubmitError(null);
                    }}
                    className="px-6 py-3 text-content-secondary hover:text-content transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Reviews list */}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-surface border border-line-soft rounded-sm p-5 hover:border-line-med transition-colors relative overflow-hidden group"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-accent to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-accent/10 rounded-full flex items-center justify-center shrink-0">
                        {review.cliente ? (
                          <span className="text-sm font-bold text-accent">
                            {getInitials(review.cliente.nombre, review.cliente.apellido)}
                          </span>
                        ) : (
                          <User size={20} className="text-accent" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-content text-sm">
                            {review.cliente
                              ? `${review.cliente.nombre} ${review.cliente.apellido}`
                              : 'Cliente'}
                          </span>
                          {review.esVerificado ? (
                            <span className="flex items-center gap-1 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                              <CheckCircle size={12} />
                              Compra verificada
                            </span>
                          ) : null}
                        </div>
                        <span className="text-xs text-content-faint">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    <StarRating rating={review.calificacion} size="sm" />
                  </div>

                  {review.titulo ? (
                    <h4 className="font-semibold text-content mb-2">{review.titulo}</h4>
                  ) : null}

                  {review.comentario ? (
                    <p className="text-content-secondary text-sm leading-relaxed">{review.comentario}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-line-soft rounded-sm p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-accent/20 to-transparent" />
              <ChatText size={64} className="text-gray-800 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-content-secondary mb-2">
                Todavía no hay reseñas
              </h3>
              <p className="text-sm text-content-faint max-w-md mx-auto">
                ¿Ya compraste este producto? ¡Comparte tu experiencia con otros compradores!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
