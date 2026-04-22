import { CircleNotch } from '@phosphor-icons/react/dist/ssr';

/**
 * Loading UI para /cuenta
 * Vercel Best Practice: Instant Loading States con loading.tsx
 */
export default function CuentaLoading() {
  return (
    <div className="min-h-screen bg-surface-deep py-8">
      <div className="container mx-auto px-4">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-32 bg-surface-soft animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-surface-card animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-line-soft p-4 space-y-2">
              {/* Profile summary */}
              <div className="flex items-center gap-3 p-3 border-b border-line-soft mb-4">
                <div className="size-12 rounded-full bg-surface-soft animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-surface-soft animate-pulse rounded" />
                  <div className="h-3 w-32 bg-surface-card animate-pulse rounded" />
                </div>
              </div>

              {/* Menu items */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 p-3 ${i === 1 ? 'bg-accent/10 border-l-2 border-accent' : ''}`}
                >
                  <div className="size-5 bg-surface-soft animate-pulse rounded" />
                  <div className="h-4 w-24 bg-surface-soft animate-pulse rounded" />
                </div>
              ))}

              {/* Logout button */}
              <div className="pt-4 mt-4 border-t border-line-soft">
                <div className="flex items-center gap-3 p-3">
                  <div className="size-5 bg-danger/30 animate-pulse rounded" />
                  <div className="h-4 w-24 bg-danger/30 animate-pulse rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="lg:col-span-3">
            <div className="bg-surface border border-line-soft p-6">
              {/* Section title */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-line-soft">
                <div className="flex items-center gap-3">
                  <div className="size-6 bg-accent/30 animate-pulse rounded" />
                  <div className="h-6 w-40 bg-surface-soft animate-pulse rounded" />
                </div>
                <div className="h-9 w-24 bg-surface-soft animate-pulse rounded" />
              </div>

              {/* Profile form skeleton */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Field 1 */}
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-surface-card animate-pulse rounded" />
                    <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
                  </div>
                  {/* Field 2 */}
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-surface-card animate-pulse rounded" />
                    <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
                  </div>
                  {/* Field 3 */}
                  <div className="space-y-2">
                    <div className="h-4 w-12 bg-surface-card animate-pulse rounded" />
                    <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
                  </div>
                  {/* Field 4 */}
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-surface-card animate-pulse rounded" />
                    <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
                  </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-line-soft">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 bg-surface-deep border border-line">
                      <div className="size-8 bg-surface-soft animate-pulse rounded mb-2" />
                      <div className="h-6 w-8 bg-surface-soft animate-pulse rounded mb-1" />
                      <div className="h-3 w-16 bg-surface-card animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-surface border border-accent/30 px-4 py-3 shadow-lg">
        <CircleNotch size={20} weight="bold" className="text-accent animate-spin" />
        <span className="text-sm text-content-secondary">Cargando cuenta...</span>
      </div>
    </div>
  );
}
