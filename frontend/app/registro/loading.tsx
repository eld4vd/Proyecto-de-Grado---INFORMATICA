/**
 * Loading UI para /registro
 * Vercel Best Practice: Instant Loading States con loading.tsx
 */
export default function RegistroLoading() {
  return (
    <div className="min-h-screen bg-surface-deep flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo y título skeleton */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="size-14 bg-surface-soft animate-pulse" />
            <div className="space-y-1">
              <div className="h-8 w-32 bg-surface-soft animate-pulse" />
              <div className="h-3 w-16 bg-surface-card animate-pulse" />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="size-10 bg-surface-soft animate-pulse" />
            <div className="h-7 w-32 bg-surface-soft animate-pulse" />
          </div>
          <div className="h-4 w-48 mx-auto bg-surface-card animate-pulse" />
        </div>

        {/* Form skeleton */}
        <div className="bg-surface border border-line p-8">
          <div className="space-y-5">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-16 bg-surface-card animate-pulse" />
                <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-surface-card animate-pulse" />
                <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-surface-card animate-pulse" />
              <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
            </div>

            {/* Teléfono y NIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-surface-card animate-pulse" />
                <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-surface-card animate-pulse" />
                <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
              </div>
            </div>

            {/* Contraseñas */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-surface-card animate-pulse" />
              <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-36 bg-surface-card animate-pulse" />
              <div className="h-11 w-full bg-surface-deep border border-line animate-pulse" />
            </div>

            {/* Términos */}
            <div className="flex items-start gap-3">
              <div className="size-4 bg-surface-soft animate-pulse mt-0.5" />
              <div className="h-4 w-64 bg-surface-card animate-pulse" />
            </div>

            {/* Botón */}
            <div className="h-12 w-full bg-accent/30 animate-pulse" />
          </div>

          {/* Link a login */}
          <div className="mt-6 text-center">
            <div className="h-4 w-44 mx-auto bg-surface-card animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
