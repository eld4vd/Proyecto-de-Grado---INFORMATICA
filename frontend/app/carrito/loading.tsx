export default function CarritoLoading() {
  return (
    <div className="min-h-screen bg-surface-deep animate-pulse">
      {/* Header skeleton */}
      <section className="bg-surface border-b border-line-soft">
        <div className="container-custom py-8">
          <div className="h-4 w-32 bg-surface-hover rounded mb-4"></div>
          <div className="h-8 w-48 bg-surface-hover rounded"></div>
        </div>
      </section>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items skeleton */}
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface border border-line-soft p-4 rounded-xl">
                <div className="flex gap-4">
                  <div className="size-24 bg-surface-soft rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-5 w-48 bg-surface-hover rounded mb-2"></div>
                    <div className="h-4 w-32 bg-surface-soft rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-10 w-28 bg-surface-soft rounded-lg"></div>
                      <div className="h-6 w-20 bg-surface-hover rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-surface border border-line-soft p-6 rounded-xl sticky top-24">
              <div className="h-6 w-32 bg-surface-hover rounded mb-6"></div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-surface-soft rounded"></div>
                  <div className="h-4 w-16 bg-surface-soft rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-surface-soft rounded"></div>
                  <div className="h-4 w-12 bg-surface-soft rounded"></div>
                </div>
              </div>
              <div className="border-t border-line-med pt-4 mb-6">
                <div className="flex justify-between">
                  <div className="h-5 w-12 bg-surface-hover rounded"></div>
                  <div className="h-5 w-20 bg-surface-hover rounded"></div>
                </div>
              </div>
              <div className="h-12 bg-accent/20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
