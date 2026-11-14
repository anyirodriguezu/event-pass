"use client";

import { useEffect } from "react";

// global-error reemplaza el root layout entero cuando este falla
// Por eso incluye <html> y <body> propios
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EventPass GlobalError]", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center space-y-5">
        <p className="text-5xl">🔥</p>
        <div className="space-y-2">
          <h2 className="font-bold text-2xl text-gray-900">Error crítico</h2>
          <p className="text-gray-500 text-sm max-w-sm">
            La aplicación encontró un error grave. Por favor intenta recargar la página.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 font-mono">ID: {error.digest}</p>
          )}
        </div>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors"
        >
          Recargar
        </button>
      </body>
    </html>
  );
}
