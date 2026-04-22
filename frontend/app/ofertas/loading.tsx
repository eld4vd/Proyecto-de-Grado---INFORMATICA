export default function OfertasLoading() {
  return (
    <div className="min-h-screen bg-surface animate-pulse">
      {/* Hero skeleton */}
      <section className="bg-surface-card border-b border-line">
        <div className="container-custom py-10 md:py-14">
          <div className="max-w-2xl">
            <div className="h-7 w-40 bg-surface-hover rounded-full mb-5" />
            <div className="h-10 w-72 bg-surface-hover rounded mb-4" />
            <div className="h-4 w-96 bg-surface-soft rounded mb-2" />
            <div className="h-4 w-64 bg-surface-soft rounded" />
          </div>
        </div>
      </section>

      {/* Breadcrumb skeleton */}
      <section className="border-b border-line bg-surface">
        <div className="container-custom py-3">
          <div className="h-4 w-32 bg-surface-soft rounded" />
        </div>
      </section>

      {/* Products grid skeleton */}
      <section className="container-custom py-8 md:py-12">
        <div className="h-4 w-40 bg-surface-soft rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface-card border border-line-soft rounded-2xl overflow-hidden">
              <div className="aspect-square bg-linear-to-br from-surface-raised to-surface" />
              <div className="p-3.5 md:p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="h-3 w-16 bg-surface-hover rounded" />
                  <div className="h-3 w-12 bg-surface-soft rounded" />
                </div>
                <div className="h-4 w-full bg-surface-soft rounded mb-1" />
                <div className="h-4 w-3/4 bg-surface-soft rounded mb-2" />
                <div className="h-5 w-24 bg-surface-hover rounded mt-2" />
                <div className="h-3 w-14 bg-surface-soft rounded mt-1.5" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
