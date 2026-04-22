'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface HeroSlide {
  id: string;
  alt: string;
  href: string;
  imageUrl: string;
}

const slides: HeroSlide[] = [
  {
    id: '1',
    alt: 'Laptops Gaming y Oficina',
    href: '/productos?categoria=laptops',
    imageUrl: '/hero/laptops.webp',
  },
  {
    id: '2',
    alt: 'Componentes de alto rendimiento',
    href: '/productos?categoria=componentes',
    imageUrl: '/hero/banner%20componentes.webp',
  },
  {
    id: '3',
    alt: 'Computadora Gaming',
    href: '/productos?categoria=computadoras',
    imageUrl: '/hero/banner%20de%20computadora%20gaming.webp',
  },
  {
    id: '4',
    alt: 'Promoción Streamer Elite Pack',
    href: '/ofertas',
    imageUrl: '/hero/promocion.webp',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setCurrentSlide((index + slides.length) % slides.length);
  }, []);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      className="lg:col-span-2 group relative overflow-hidden rounded-2xl min-h-55 sm:min-h-70 lg:min-h-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Productos destacados"
    >
      {/* Slides */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <Link
            key={slide.id}
            href={slide.href}
            className={`block absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
            tabIndex={isActive ? 0 : -1}
            aria-hidden={!isActive}
            aria-label={slide.alt}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.imageUrl}
                alt={slide.alt}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          </Link>
        );
      })}

      {/* Flechas de navegación */}
      <button
        onClick={() => goTo(currentSlide - 1)}
        className="size-10 absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all cursor-pointer hover:opacity-100 focus:opacity-100"
        aria-label="Slide anterior"
      >
        <CaretLeft size={20} />
      </button>
      <button
        onClick={() => goTo(currentSlide + 1)}
        className="size-10 absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/50 transition-all cursor-pointer hover:opacity-100 focus:opacity-100"
        aria-label="Slide siguiente"
      >
        <CaretRight size={20} />
      </button>

      {/* Indicadores de puntos estilo komplett */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              index === currentSlide
                ? 'size-3 bg-white ring-2 ring-white/40'
                : 'size-2.5 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
