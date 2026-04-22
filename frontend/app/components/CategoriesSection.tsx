import Link from 'next/link';
import Image from 'next/image';
import { cache } from 'react';
import type { Icon } from '@phosphor-icons/react';
import { CaretRight, Laptop, Cpu, Monitor, Headphones, GameController, HardDrive, Keyboard, Mouse, WifiHigh, Camera, Printer, HardDrives, DeviceMobile, Watch, Package } from '@phosphor-icons/react/dist/ssr';
import { getApiBaseUrl } from '../lib/api-env';

const API_BASE = getApiBaseUrl();

// Mapeo de iconos según nombre de categoría (fallback inteligente)
const categoryIconMap: Record<string, Icon> = {
  'laptop': Laptop,
  'laptops': Laptop,
  'notebook': Laptop,
  'procesador': Cpu,
  'procesadores': Cpu,
  'cpu': Cpu,
  'monitor': Monitor,
  'monitores': Monitor,
  'pantalla': Monitor,
  'audio': Headphones,
  'audifonos': Headphones,
  'auriculares': Headphones,
  'headphones': Headphones,
  'gaming': GameController,
  'gamer': GameController,
  'juegos': GameController,
  'almacenamiento': HardDrive,
  'disco': HardDrive,
  'ssd': HardDrive,
  'hdd': HardDrive,
  'teclado': Keyboard,
  'teclados': Keyboard,
  'keyboard': Keyboard,
  'mouse': Mouse,
  'raton': Mouse,
  'ratones': Mouse,
  'red': WifiHigh,
  'redes': WifiHigh,
  'wifi': WifiHigh,
  'router': WifiHigh,
  'camara': Camera,
  'camaras': Camera,
  'webcam': Camera,
  'impresora': Printer,
  'impresoras': Printer,
  'servidor': HardDrives,
  'servidores': HardDrives,
  'telefono': DeviceMobile,
  'celular': DeviceMobile,
  'smartphone': DeviceMobile,
  'reloj': Watch,
  'smartwatch': Watch,
};

interface CategoriaAPI {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean;
  categoriaPadreId: string | null;
  subcategorias?: CategoriaAPI[];
  _count?: {
    productoCategorias: number;
  };
}

function getIconForCategory(nombre: string): Icon {
  const nombreLower = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Buscar coincidencia parcial
  for (const [key, icon] of Object.entries(categoryIconMap)) {
    if (nombreLower.includes(key)) {
      return icon;
    }
  }
  
  return Package; // Icono por defecto
}

// Cachear la función de fetch (server-cache-react)
const getCategories = cache(async (): Promise<CategoriaAPI[]> => {
  try {
    const res = await fetch(`${API_BASE}/categorias/activas`, {
      next: { revalidate: 300 }, // 5 minutos
    });

    if (!res.ok) {
      console.error(`Error fetching categories: ${res.status} ${res.statusText}`);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
});

export default async function CategoriesSection() {
  const allCategories = await getCategories();
  
  // Si no hay categorías, mostrar mensaje
  if (allCategories.length === 0) {
    return (
      <section className="py-16 border-t border-line-soft">
        <div className="container-custom">
          <div className="text-center py-12">
            <Package size={64} weight="duotone" className="text-content-faint mx-auto mb-4" aria-hidden="true" />
            <p className="text-content-secondary">No hay categorías disponibles</p>
          </div>
        </div>
      </section>
    );
  }

  // Priorizar categorías principales (sin padre), pero si no hay, mostrar cualquiera
  let mainCategories = allCategories.filter(cat => !cat.categoriaPadreId);
  
  // Si no hay categorías principales, usar todas las categorías disponibles
  if (mainCategories.length === 0) {
    mainCategories = allCategories;
  }
  
  // Ordenar por cantidad de productos y tomar las primeras 8
  mainCategories = mainCategories
    .toSorted((a, b) => (b._count?.productoCategorias || 0) - (a._count?.productoCategorias || 0))
    .slice(0, 8);

  return (
    <section className="py-14 md:py-20 border-t border-line-soft">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-10 md:mb-14">
          <h2 className="text-xl md:text-2xl font-bold text-content">Categorías</h2>
          <Link 
            href="/productos" 
            className="group text-sm text-content-secondary hover:text-accent transition-colors flex items-center gap-1"
          >
            Ver todas <CaretRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </div>

        {/* Grid estilo Apple Store — iconos grandes, fondo sutil redondeado */}
        <div className="flex justify-center">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-x-5 gap-y-8 md:gap-x-8 lg:gap-x-12">
            {mainCategories.map((cat) => {
              const IconComponent = getIconForCategory(cat.nombre);

              return (
                <Link
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 transition-transform duration-300 hover:-translate-y-1"
                >
                  {/* Contenedor con fondo sutil */}
                  <div className="size-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex items-center justify-center rounded-2xl bg-surface-card transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
                    {cat.imagenUrl ? (
                      <Image
                        src={cat.imagenUrl}
                        alt={cat.nombre}
                        width={120}
                        height={120}
                        className="object-contain w-[80%] h-[80%]"
                      />
                    ) : (
                      <IconComponent 
                        size={48} weight="duotone" className="md:w-14 md:h-14 lg:w-16 lg:h-16 text-content-secondary group-hover:text-accent transition-colors duration-300" 
                        aria-hidden="true" 
                      />
                    )}
                  </div>
                  
                  {/* Nombre */}
                  <span className="text-xs md:text-sm font-medium text-content text-center leading-tight">
                    {cat.nombre}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
