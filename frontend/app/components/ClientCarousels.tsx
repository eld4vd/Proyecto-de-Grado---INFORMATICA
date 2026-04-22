'use client';

import dynamic from 'next/dynamic';

// Lazy load del carrusel de marcas
export const BrandsCarousel = dynamic(() => import('./BrandsCarousel'), {
  loading: () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-pulse flex gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-40 h-20 bg-surface-raised rounded" />
        ))}
      </div>
    </div>
  ),
});

// Regla 2.3/2.4: Defer non-critical components — Chatbot no es crítico para la carga inicial
// ssr: false solo funciona en Client Components, por eso está aquí y no en layout.tsx
export const DeferredChatbot = dynamic(() => import('./Chatbot'), {
  ssr: false,
});
