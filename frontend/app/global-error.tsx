"use client";

// Global error boundary - Captura errores que no se capturan en app/error.tsx
// IMPORTANTE: global-error reemplaza el <html> completo.
// No se importa globals.css porque TypeScript 6+ no permite side-effect CSS imports
// sin configuración adicional. Se usan inline styles mínimos.
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "32rem", padding: "1rem" }}>
          {/* Icon */}
          <div
            style={{
              marginBottom: "2rem",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "5rem",
                height: "5rem",
                backgroundColor: "rgba(255, 60, 60, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
              }}
            >
              ⚠
            </div>
          </div>

          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            ¡Error crítico!
          </h1>
          <p
            style={{
              color: "#9ca3af",
              marginBottom: "1.5rem",
              lineHeight: 1.6,
            }}
          >
            Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado
            automáticamente.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                marginBottom: "1.5rem",
                fontFamily: "monospace",
                backgroundColor: "#111",
                padding: "0.5rem 1rem",
                display: "inline-block",
                border: "1px solid #1a1a1a",
              }}
            >
              Código: {error.digest}
            </p>
          )}

          <div>
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#39FF14",
                color: "#000000",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              ↻ Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
