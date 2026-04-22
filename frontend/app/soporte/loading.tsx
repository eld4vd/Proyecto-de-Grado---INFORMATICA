export default function SoporteLoading() {
  return (
    <div className="min-h-screen bg-surface-deep animate-pulse">
      {/* Hero skeleton */}
      <section className="relative">
        <div className="bg-[#0a0a0a] py-20 md:py-32">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="h-12 w-96 max-w-full bg-surface-hover mx-auto mb-4" />
            <div className="h-5 w-48 bg-surface-soft mx-auto mb-8" />
            <div className="h-12 max-w-xl mx-auto bg-[#1a1a1a] border border-[#333]" />
            <div className="flex justify-center gap-4 mt-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 w-24 bg-surface-soft" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product categories strip skeleton */}
      <section className="border-y border-line-soft bg-surface py-10">
        <div className="container-custom">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="size-16 md:size-20 bg-surface-hover" />
                <div className="h-3 w-14 bg-surface-soft" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service cards skeleton */}
      <section className="py-16 md:py-20">
        <div className="container-custom">
          <div className="h-8 w-96 max-w-full bg-surface-hover mx-auto mb-10 md:mb-14" />

          <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#111] border border-[#2a2a2a] p-8 md:p-10 text-center">
                <div className="size-12 bg-surface-hover mx-auto mb-4" />
                <div className="h-5 w-32 bg-surface-hover mx-auto mb-2" />
                <div className="h-3 w-full bg-surface-soft mb-1" />
                <div className="h-3 w-3/4 bg-surface-soft mx-auto" />
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-5">
            {[4, 5, 6].map((i) => (
              <div key={i} className="bg-[#111] border border-[#2a2a2a] p-8 md:p-10 text-center">
                <div className="size-12 bg-surface-hover mx-auto mb-4" />
                <div className="h-5 w-32 bg-surface-hover mx-auto mb-2" />
                <div className="h-3 w-full bg-surface-soft mb-1" />
                <div className="h-3 w-3/4 bg-surface-soft mx-auto" />
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4 md:gap-5 max-w-full md:max-w-[66%] md:mx-auto">
            {[7, 8].map((i) => (
              <div key={i} className="bg-[#111] border border-[#2a2a2a] p-8 md:p-10 text-center">
                <div className="size-12 bg-surface-hover mx-auto mb-4" />
                <div className="h-5 w-32 bg-surface-hover mx-auto mb-2" />
                <div className="h-3 w-full bg-surface-soft mb-1" />
                <div className="h-3 w-3/4 bg-surface-soft mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
