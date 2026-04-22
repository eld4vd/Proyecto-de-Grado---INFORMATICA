import { CircleNotch } from '@phosphor-icons/react/dist/ssr';

/**
 * Loading UI para /checkout
 * Vercel Best Practice: Instant Loading States con loading.tsx
 */
export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-surface-deep">
      {/* Progress Bar skeleton */}
      <div className="bg-surface border-b border-line-soft sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-12 bg-surface-soft animate-pulse rounded" />
            <div className="size-4 bg-surface-card animate-pulse" />
            <div className="h-4 w-16 bg-surface-soft animate-pulse rounded" />
            <div className="size-4 bg-surface-card animate-pulse" />
            <div className="h-4 w-20 bg-accent/30 animate-pulse rounded" />
          </div>

          {/* Steps skeleton */}
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`size-8 rounded-full ${step === 1 ? 'bg-accent/30' : 'bg-surface-soft'} animate-pulse`} />
                <div className="h-4 w-20 bg-surface-soft animate-pulse rounded hidden md:block" />
                {step < 3 && <div className="w-12 h-px bg-line-med mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section title */}
            <div className="h-8 w-48 bg-surface-soft animate-pulse rounded" />
            
            {/* Address cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 bg-surface border border-line-soft space-y-3">
                  <div className="h-5 w-32 bg-surface-soft animate-pulse rounded" />
                  <div className="h-4 w-full bg-surface-card animate-pulse rounded" />
                  <div className="h-4 w-2/3 bg-surface-card animate-pulse rounded" />
                </div>
              ))}
            </div>

            {/* New address form skeleton */}
            <div className="p-6 bg-surface border border-line-soft space-y-4">
              <div className="h-5 w-40 bg-surface-soft animate-pulse rounded" />
              <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-11 bg-surface-deep border border-line animate-pulse" />
                <div className="h-11 bg-surface-deep border border-line animate-pulse" />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-end">
              <div className="h-12 w-40 bg-accent/30 animate-pulse" />
            </div>
          </div>

          {/* Right column - Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-line-soft p-6 sticky top-32 space-y-4">
              <div className="h-6 w-40 bg-surface-soft animate-pulse rounded" />
              
              {/* Items skeleton */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-line-soft">
                  <div className="size-16 bg-surface-soft animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full bg-surface-soft animate-pulse rounded" />
                    <div className="h-3 w-16 bg-surface-card animate-pulse rounded" />
                  </div>
                  <div className="h-5 w-16 bg-surface-soft animate-pulse rounded" />
                </div>
              ))}

              {/* Totals skeleton */}
              <div className="space-y-3 pt-4">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-surface-card animate-pulse rounded" />
                  <div className="h-4 w-16 bg-surface-soft animate-pulse rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-surface-card animate-pulse rounded" />
                  <div className="h-4 w-12 bg-accent/30 animate-pulse rounded" />
                </div>
                <div className="flex justify-between pt-3 border-t border-line-med">
                  <div className="h-6 w-16 bg-surface-soft animate-pulse rounded" />
                  <div className="h-6 w-20 bg-surface-soft animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator overlay */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-surface border border-accent/30 px-4 py-3 shadow-lg">
        <CircleNotch size={20} weight="bold" className="text-accent animate-spin" />
        <span className="text-sm text-content-secondary">Cargando checkout...</span>
      </div>
    </div>
  );
}
