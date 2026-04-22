import { Suspense } from 'react';
import ProductsContent from './ProductsContent';
import { getProducts, getCategories, getBrands } from '../lib/api';

export const metadata = {
  title: 'Productos | SicaBit - Tech Store',
  description: 'Encuentra las mejores laptops, componentes, periféricos y accesorios gaming. Envío a todo Bolivia.',
};

// Helper para generar slug desde nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function ProductsLoading() {
  return (
    <div className="h-[calc(100vh-80px)] bg-surface-deep flex flex-col overflow-hidden">
      {/* Header skeleton */}
      <div className="shrink-0 px-4 md:px-8 lg:px-12 py-4 border-b border-line-soft">
        <div className="h-5 w-32 bg-surface-hover rounded animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-line-soft">
          <div className="h-full overflow-y-auto scrollable-panel p-4 space-y-4">
            <div className="bg-surface border border-line-soft rounded-2xl p-5 animate-pulse">
              <div className="h-4 w-20 bg-surface-hover rounded mb-4"></div>
              <div className="h-11 bg-surface-card rounded-lg"></div>
            </div>
            <div className="bg-surface border border-line-soft rounded-2xl p-5 animate-pulse">
              <div className="h-4 w-24 bg-surface-hover rounded mb-4"></div>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-12 bg-surface-card rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="shrink-0 px-4 md:px-6 py-4 border-b border-line-soft">
            <div className="flex items-center justify-between">
              <div className="animate-pulse">
                <div className="h-8 w-48 bg-surface-hover rounded mb-2"></div>
                <div className="h-4 w-32 bg-surface-card rounded"></div>
              </div>
              <div className="flex gap-3 animate-pulse">
                <div className="w-20 h-11 bg-surface rounded-lg"></div>
                <div className="w-40 h-11 bg-surface rounded-lg"></div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollable-panel p-4 md:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-surface border border-line-soft rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-linear-to-br from-surface-raised to-surface"></div>
                  <div className="p-4">
                    <div className="h-3 w-16 bg-surface-hover rounded mb-2"></div>
                    <div className="h-4 w-full bg-surface-soft rounded mb-1"></div>
                    <div className="h-3 w-3/4 bg-surface-card rounded mb-3"></div>
                    <div className="h-5 w-20 bg-surface-hover rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function ProductsDataFetcher({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
  // Leer parámetro categoria (slug) de la URL
  const categoriaSlug = typeof params.categoria === 'string' ? params.categoria : undefined;
  const marcaSlug = typeof params.marca === 'string' ? params.marca : undefined;
  
  // Obtener categorías y marcas primero
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);
  
  // Encontrar IDs por slug
  let categoriaId: string | undefined;
  let marcaId: string | undefined;
  
  if (categoriaSlug) {
    const category = categories.find(cat => generateSlug(cat.nombre) === categoriaSlug);
    categoriaId = category?.id;
  }
  
  if (marcaSlug) {
    const brand = brands.find(b => generateSlug(b.nombre) === marcaSlug);
    marcaId = brand?.id;
  }
  
  // Fetch productos con filtros aplicados
  const initialProducts = await getProducts({ 
    activo: true, 
    take: 12,
    ...(categoriaId && { categoriaId }),
    ...(marcaId && { marcaId })
  });

  return (
    <ProductsContent 
      initialProducts={initialProducts}
      categories={categories}
      brands={brands}
    />
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsDataFetcher searchParams={searchParams} />
    </Suspense>
  );
}
