'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';

/* ─── Animated Counter ─── */
export function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {isInView ? count : 0}{suffix}
    </span>
  );
}

/* ─── Fade-in Section Wrapper ─── */
export function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Brand Logos Grid ─── */
export function BrandLogos({ brands }: { brands: { name: string; src: string }[] }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {brands.map((brand) => (
        <div
          key={brand.name}
          className="flex items-center justify-center aspect-3/2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
        >
          <Image
            src={brand.src}
            alt={brand.name}
            width={100}
            height={60}
            className="object-contain max-h-10"
          />
        </div>
      ))}
    </div>
  );
}
