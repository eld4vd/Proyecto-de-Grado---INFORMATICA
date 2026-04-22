/**
 * Loading UI para /login
 * Vercel Best Practice: Instant Loading States con loading.tsx
 */
export default function LoginLoading() {
  return (
    <div className="fixed inset-0 z-50 flex bg-surface-deep">
      {/* Left side skeleton */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface">
        <div className="absolute inset-0 bg-linear-to-br from-surface to-[#050505]" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo skeleton */}
          <div className="flex items-center gap-3">
            <div className="size-12 bg-surface-soft animate-pulse" />
            <div className="h-6 w-24 bg-surface-soft animate-pulse" />
          </div>
          
          {/* Content skeleton */}
          <div className="max-w-md space-y-4">
            <div className="h-4 w-24 bg-surface-soft animate-pulse" />
            <div className="h-10 w-full bg-surface-soft animate-pulse" />
            <div className="h-16 w-full bg-surface-card animate-pulse" />
          </div>
          
          <div className="h-4 w-48 bg-surface-card animate-pulse" />
        </div>
      </div>

      {/* Right side - Form skeleton */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="size-10 bg-surface-soft animate-pulse" />
              <div className="h-5 w-20 bg-surface-soft animate-pulse" />
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="flex border border-line-med">
            <div className="flex-1 py-3 bg-accent/20 animate-pulse" />
            <div className="flex-1 py-3 bg-surface-soft animate-pulse" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-7 w-40 bg-surface-soft animate-pulse" />
            <div className="h-4 w-56 bg-surface-card animate-pulse" />
          </div>

          {/* Form skeleton */}
          <div className="space-y-5">
            {/* Email field */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-surface-card animate-pulse" />
              <div className="h-12 w-full bg-surface border border-line-med animate-pulse" />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-surface-card animate-pulse" />
              <div className="h-12 w-full bg-surface border border-line-med animate-pulse" />
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-surface-card animate-pulse" />
              <div className="h-4 w-36 bg-accent/20 animate-pulse" />
            </div>

            {/* Submit button */}
            <div className="h-12 w-full bg-accent/30 animate-pulse" />
          </div>

          {/* Register link skeleton */}
          <div className="mt-8 pt-6 border-t border-line-soft">
            <div className="h-4 w-48 mx-auto bg-surface-card animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
