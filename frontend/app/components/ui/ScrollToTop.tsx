'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from '@phosphor-icons/react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(total > 0 && scrolled / total >= 0.9);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Volver al inicio de la página"
      className={`fixed bottom-14 left-1/2 -translate-x-1/2 z-40 size-10 rounded-full bg-surface-deep border border-line shadow-md text-content-secondary flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-accent hover:text-accent-contrast hover:border-accent hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <ArrowUp size={18} weight="bold" aria-hidden="true" />
    </button>
  );
}
