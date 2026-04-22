'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface Marca {
  id: string;
  nombre: string;
  imagenUrl: string | null;
  activo: boolean;
}

// Marcas por defecto con logos locales
const defaultBrands = [
  { id: '1', nombre: 'ASUS', imagenUrl: '/brands/asus.webp', activo: true },
  { id: '2', nombre: 'AMD', imagenUrl: '/brands/amd.webp', activo: true },
  { id: '3', nombre: 'NVIDIA', imagenUrl: '/brands/nvidia-logo-vert.webp', activo: true },
  { id: '4', nombre: 'Corsair', imagenUrl: '/brands/Corsair.webp', activo: true },
  { id: '5', nombre: 'Logitech', imagenUrl: '/brands/Logitech.webp', activo: true },
  { id: '6', nombre: 'Dell', imagenUrl: '/brands/Dell_Logo.webp', activo: true },
  { id: '7', nombre: 'Razer', imagenUrl: '/brands/Razer.webp', activo: true },
  { id: '8', nombre: 'ROG', imagenUrl: '/brands/rog.webp', activo: true },
];

interface BrandsCarouselProps {
  initialBrands?: Marca[];
}

export default function BrandsCarousel({ initialBrands }: BrandsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [marcas] = useState<Marca[]>(() => {
    if (initialBrands && initialBrands.length > 0) {
      const active = initialBrands.filter(m => m.activo && m.imagenUrl);
      return active.length > 0 ? active : defaultBrands;
    }
    return defaultBrands;
  });
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Auto-scroll continuo + momentum
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    let animationId: number;
    const baseSpeed = 0.8;

    const animate = () => {
      if (scroll) {
        if (!isDragging) {
          // Aplicar velocidad del arrastre o velocidad base
          const speed = Math.abs(velocity) > 0.5 ? velocity : baseSpeed;
          scroll.scrollLeft += speed;

          // Loop infinito
          const maxScroll = scroll.scrollWidth / 2;
          if (scroll.scrollLeft >= maxScroll) {
            scroll.scrollLeft = 0;
          } else if (scroll.scrollLeft <= 0 && speed < 0) {
            scroll.scrollLeft = maxScroll - 1;
          }

          // Desacelerar gradualmente el momentum
          if (Math.abs(velocity) > 0.5) {
            setVelocity(v => v * 0.96);
          } else if (velocity !== 0) {
            setVelocity(0);
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [isDragging, velocity]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    setIsDragging(true);
    setStartX(e.pageX - scroll.offsetLeft);
    setScrollLeft(scroll.scrollLeft);
    lastXRef.current = e.pageX;
    lastTimeRef.current = Date.now();
    setVelocity(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const scroll = scrollRef.current;
    if (!scroll) return;

    const x = e.pageX - scroll.offsetLeft;
    const walk = (x - startX) * 1.5;
    scroll.scrollLeft = scrollLeft - walk;

    // Calcular velocidad para momentum
    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      const dx = e.pageX - lastXRef.current;
      setVelocity(-dx * 0.5);
    }
    lastXRef.current = e.pageX;
    lastTimeRef.current = now;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Touch handlers para móviles
  const handleTouchStart = (e: React.TouchEvent) => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    setIsDragging(true);
    setStartX(e.touches[0].pageX - scroll.offsetLeft);
    setScrollLeft(scroll.scrollLeft);
    lastXRef.current = e.touches[0].pageX;
    lastTimeRef.current = Date.now();
    setVelocity(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const scroll = scrollRef.current;
    if (!scroll) return;

    const x = e.touches[0].pageX - scroll.offsetLeft;
    const walk = (x - startX) * 1.5;
    scroll.scrollLeft = scrollLeft - walk;

    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      const dx = e.touches[0].pageX - lastXRef.current;
      setVelocity(-dx * 0.5);
    }
    lastXRef.current = e.touches[0].pageX;
    lastTimeRef.current = now;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Duplicar para loop infinito
  const allBrands = [...marcas, ...marcas];

  return (
    <div className="relative overflow-hidden py-8">
      {/* Gradientes en los bordes */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-linear-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-linear-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

      {/* Carrusel */}
      <div
        ref={scrollRef}
        className={`flex gap-6 overflow-x-hidden select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {allBrands.map((marca, idx) => (
          <div
            key={`${marca.id}-${idx}`}
            className="shrink-0 w-40 md:w-48 h-20 md:h-24 flex items-center justify-center group"
          >
            <div className="relative w-full h-full flex items-center justify-center p-4 rounded-xl bg-surface border border-line hover:border-accent/40 transition-all duration-300 group-hover:scale-105 group-hover:bg-surface-card">
              {marca.imagenUrl ? (
                <Image
                  src={marca.imagenUrl}
                  alt={marca.nombre}
                  width={120}
                  height={50}
                  className="object-contain max-h-12 md:max-h-14 w-auto filter grayscale brightness-75 opacity-60 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 transition-all duration-300 select-none pointer-events-none"
                  unoptimized
                  draggable={false}
                />
              ) : (
                <span className="text-lg font-bold text-[#333] group-hover:text-accent transition-colors duration-300 select-none">
                  {marca.nombre}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
