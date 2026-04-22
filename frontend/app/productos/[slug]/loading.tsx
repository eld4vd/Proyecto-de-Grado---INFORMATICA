export default function ProductLoading() {
  return (
    <div className="container-custom py-8">
      {/* Breadcrumb skeleton */}
      <div className="h-5 w-64 bg-background-tertiary skeleton rounded-lg mb-8" />
      
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-background-secondary skeleton rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-background-tertiary skeleton rounded-xl" />
            ))}
          </div>
        </div>
        
        {/* Info skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-24 bg-background-tertiary skeleton rounded-lg" />
          <div className="h-8 w-full bg-background-tertiary skeleton rounded-lg" />
          <div className="h-8 w-3/4 bg-background-tertiary skeleton rounded-lg" />
          <div className="h-5 w-32 bg-background-tertiary skeleton rounded-lg" />
          <div className="h-10 w-40 bg-background-tertiary skeleton rounded-lg" />
          <div className="h-20 w-full bg-background-tertiary skeleton rounded-lg" />
          <div className="h-14 w-full bg-background-tertiary skeleton rounded-xl" />
          <div className="h-14 w-full bg-background-tertiary skeleton rounded-xl" />
        </div>
      </div>
    </div>
  );
}
