import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowRight, Truck, ShieldCheck, Lightning, Percent } from '@phosphor-icons/react/dist/ssr';
import FeaturedProducts from './components/FeaturedProducts';
import CategoriesSection from './components/CategoriesSection';
import HeroCarousel from './components/HeroCarousel';
import HomeBrandsSection from './components/HomeBrandsSection';

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* ===== HERO - Industrial/Utilitarian E-commerce Style ===== */}
      {/* Enfocado en OFERTAS y ACCIÓN, no en decoración */}
      <section className="relative border-b border-line">
        {/* Grid de ofertas destacadas - Estilo e-commerce europeo */}
        <div className="container-custom py-6 lg:py-8">
          {/* Header con propuesta de valor */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
            <div>
              <p className="text-accent text-sm font-bold tracking-widest uppercase mb-2">
                Tienda Oficial Bolivia
              </p>
              <h1 className="text-3xl lg:text-4xl font-black text-content tracking-tight">
                Componentes & Gaming
              </h1>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-content-secondary">
              <span className="flex items-center gap-2">
                <Truck size={18} weight="duotone" className="text-accent" />
                Envío gratis +$500
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck size={18} weight="duotone" className="text-accent" />
                Garantía 2 años
              </span>
              <span className="flex items-center gap-2">
                <Lightning size={18} weight="fill" className="text-accent" />
                Envío 24-48h
              </span>
            </div>
          </div>

          {/* Banner Grid - Estilo Komplett.no */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Banner Principal - Carrusel con 4 slides */}
            <HeroCarousel />

            {/* Banners secundarios */}
            <div className="flex flex-col gap-4">
              {/* Banner Ofertas */}
              <Link 
                href="/ofertas" 
                className="group relative overflow-hidden bg-accent rounded-2xl p-5 flex-1 min-h-37.5 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2">
                  <Percent size={20} weight="bold" className="text-accent-contrast" />
                  <span className="text-accent-contrast text-xs font-bold uppercase tracking-wider">Ofertas</span>
                </div>
                <div>
                  <p className="text-accent-contrast font-black text-xl lg:text-2xl mb-1">
                    Hasta -40%
                  </p>
                  <span className="flex items-center gap-1 text-accent-contrast/70 text-sm font-medium group-hover:gap-2 transition-all">
                    Ver ofertas <ArrowRight size={16} weight="bold" />
                  </span>
                </div>
              </Link>

              {/* Banner Componentes */}
              <Link 
                href="/productos?categoria=componentes" 
                className="group relative overflow-hidden bg-surface-card border border-line hover:border-line-hard rounded-2xl p-5 flex-1 min-h-37.5 flex flex-col justify-between transition-colors"
              >
                <span className="text-content-muted text-xs font-bold uppercase tracking-wider">
                  Arma tu PC
                </span>
                <div>
                  <p className="text-content font-black text-xl lg:text-2xl mb-1 group-hover:text-accent transition-colors">
                    Componentes
                  </p>
                  <span className="flex items-center gap-1 text-content-secondary text-sm font-medium group-hover:gap-2 transition-all">
                    CPU, GPU, RAM… <ArrowRight size={16} weight="bold" />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Links - Categorías más buscadas */}
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { label: 'RTX 5080', href: '/productos?q=rtx+5080' },
              { label: 'Ryzen 9', href: '/productos?q=ryzen+9' },
              { label: 'DDR5', href: '/productos?q=ddr5' },
              { label: 'SSD NVMe', href: '/productos?q=ssd+nvme' },
              { label: 'Monitores 144Hz', href: '/productos?q=monitor+144hz' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 text-xs font-medium text-content-secondary bg-surface-raised border border-line rounded-none hover:border-accent/50 hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES (Dynamic from DB) ===== */}
      <Suspense fallback={
        <section className="py-14 md:py-20 border-t border-line-soft">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-10 md:mb-14">
              <div className="h-7 w-32 bg-surface-hover rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-surface-card rounded animate-pulse"></div>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-4 md:grid-cols-8 gap-x-5 gap-y-8 md:gap-x-8 lg:gap-x-12">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                    <div className="size-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-surface-card rounded-2xl"></div>
                    <div className="h-3 w-16 bg-surface-soft rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      }>
        <CategoriesSection />
      </Suspense>

      {/* ===== FEATURED PRODUCTS (Server Component) ===== */}
      <Suspense fallback={
        <section className="py-16">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-10">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-surface-hover rounded mb-2"></div>
                <div className="h-4 w-32 bg-surface-card rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-surface border border-line-soft rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-linear-to-br from-surface-raised to-surface"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-3 w-16 bg-surface-hover rounded"></div>
                    <div className="h-4 w-full bg-surface-soft rounded"></div>
                    <div className="h-5 w-20 bg-surface-hover rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      }>
        <FeaturedProducts />
      </Suspense>

      {/* ===== PROMO BANNER - Striking & Memorable ===== */}
      <section className="py-12">
        <div className="container-custom">
          <div className="relative overflow-hidden bg-surface border border-accent/30 p-8 md:p-12 cyber-corners animate-border-glow">
            {/* Background effects */}
            <div className="absolute inset-0 bg-linear-to-r from-accent/10 via-transparent to-accent/5" />
            <div className="absolute top-0 right-0 size-96 bg-accent/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 size-64 bg-accent-hover/10 rounded-full blur-[80px]" />
            
            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(var(--th-accent) 1px, transparent 1px), linear-gradient(90deg, var(--th-accent) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/20 border border-accent/30 text-sm font-bold text-accent mb-4">
                  <Lightning size={18} weight="fill" />
                  OFERTA LIMITADA
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-content mb-3 tracking-tight">
                  Hasta <span className="gradient-text">40% OFF</span> en Gaming
                </h3>
                <p className="text-content-secondary max-w-md text-lg">
                  Laptops, monitores y periféricos gaming con descuentos increíbles
                </p>
              </div>
              <Link
                href="/ofertas"
                className="group relative px-10 py-5 bg-accent hover:bg-accent-hover text-accent-contrast font-bold text-lg transition-all duration-300 hover:scale-105 btn-sweep flex items-center gap-2"
              >
                Ver ofertas
                <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BRANDS ===== */}
      <section className="py-16 border-t border-line-soft">
        <div className="container-custom">
          <p className="text-center text-xs text-content-muted uppercase tracking-[0.2em] mb-8">
            Marcas oficiales
          </p>
          <Suspense fallback={
            <div className="flex justify-center items-center py-8">
              <div className="animate-pulse flex gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-40 h-20 bg-surface-raised rounded" />
                ))}
              </div>
            </div>
          }>
            <HomeBrandsSection />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
