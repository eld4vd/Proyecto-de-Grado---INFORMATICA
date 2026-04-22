export default function NosotrosLoading() {
  return (
    <div className="min-h-screen bg-surface-deep animate-pulse">
      {/* Hero skeleton */}
      <section className="container-custom pt-10 pb-20 md:pt-14 md:pb-28">
        <div className="h-4 w-32 bg-surface-hover mb-16" />
        <div className="max-w-4xl">
          <div className="h-16 w-full bg-surface-hover mb-3" />
          <div className="h-16 w-3/4 bg-surface-hover mb-3" />
          <div className="h-16 w-1/2 bg-surface-hover mb-8" />
          <div className="h-5 w-96 bg-surface-soft" />
        </div>
      </section>

      {/* Stats skeleton */}
      <section className="border-y border-line-soft bg-surface">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-line-soft">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="py-8 md:py-10 text-center">
                <div className="h-10 w-16 bg-surface-hover mx-auto mb-1" />
                <div className="h-4 w-12 bg-surface-soft mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars skeleton */}
      <section className="py-20 md:py-28">
        <div className="container-custom">
          <div className="h-10 w-64 bg-surface-hover mx-auto mb-4" />
          <div className="h-4 w-80 bg-surface-soft mx-auto mb-14" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface border border-line-soft p-8">
                <div className="size-8 bg-surface-hover mb-5" />
                <div className="h-6 w-40 bg-surface-hover mb-3" />
                <div className="h-4 w-full bg-surface-soft mb-2" />
                <div className="h-4 w-3/4 bg-surface-soft" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statement skeleton */}
      <section className="bg-surface-hover py-16 md:py-24">
        <div className="container-custom">
          <div className="h-12 w-full max-w-2xl bg-surface-soft mx-auto mb-3" />
          <div className="h-12 w-3/4 max-w-xl bg-surface-soft mx-auto" />
        </div>
      </section>
    </div>
  );
}
