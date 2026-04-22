'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Laptop } from '@phosphor-icons/react';

interface ImagenProducto {
  id: string;
  url: string;
  esPrincipal?: boolean;
}

interface ProductGalleryProps {
  imagenes: ImagenProducto[];
  productName: string;
  destacado?: boolean;
  stock: number;
}

export function ProductGallery({ imagenes, productName, destacado, stock }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Ordenar imágenes: principal primero
  const sortedImages = [...imagenes].sort((a, b) => {
    if (a.esPrincipal && !b.esPrincipal) return -1;
    if (!a.esPrincipal && b.esPrincipal) return 1;
    return 0;
  });

  const selectedImage = sortedImages[selectedImageIndex];

  if (!imagenes || imagenes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-surface border border-line-soft p-8 flex items-center justify-center relative overflow-hidden group rounded-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent" />
          <div className="size-64 bg-surface-card rounded-2xl flex items-center justify-center">
            <Laptop className="size-32 text-placeholder-icon" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-square bg-surface border border-line-soft p-8 flex items-center justify-center relative overflow-hidden group rounded-sm hover:border-accent/30 transition-colors duration-300">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent" />
        
        {destacado && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-accent-contrast text-sm font-bold z-10 rounded-md">
            DESTACADO
          </span>
        )}

        {stock <= 5 && stock > 0 && (
          <span className="absolute top-4 right-4 px-3 py-1 bg-star text-black text-sm font-bold z-10 rounded-md">
            ¡Últimas {stock} unidades!
          </span>
        )}

        {stock === 0 && (
          <span className="absolute top-4 right-4 px-3 py-1 bg-danger text-white text-sm font-bold z-10 rounded-md">
            AGOTADO
          </span>
        )}

        <div className="w-full h-full flex items-center justify-center">
          <Image
            src={selectedImage.url}
            alt={productName}
            width={400}
            height={400}
            className="object-contain max-h-full group-hover:scale-105 transition-transform duration-500"
            priority={selectedImageIndex === 0}
          />
        </div>
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {sortedImages.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`aspect-square bg-surface border-2 rounded-sm ${
                index === selectedImageIndex 
                  ? 'border-accent shadow-[0_0_15px_rgba(57,255,20,0.2)]' 
                  : 'border-line-soft hover:border-accent/50'
              } p-2 flex items-center justify-center transition-all duration-300 overflow-hidden cursor-pointer`}
              aria-label={`Ver imagen ${index + 1} de ${sortedImages.length}`}
            >
              <Image
                src={img.url}
                alt={`${productName} - imagen ${index + 1}`}
                width={80}
                height={80}
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
