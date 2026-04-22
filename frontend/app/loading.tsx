export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-surface-deep">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-10">
          <div className="absolute inset-0 border-2 border-line" />
          <div className="absolute inset-0 border-2 border-transparent border-t-accent animate-spin" />
        </div>
        <p className="text-sm text-content-muted">Cargando...</p>
      </div>
    </div>
  );
}
