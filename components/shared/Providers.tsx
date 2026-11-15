"use client";
import { SessionProvider } from "next-auth/react";
import { Suspense } from "react";

// Suspense es necesario con cacheComponents:true — indica a Next.js que SessionProvider
// accede a datos dinámicos (cookies de sesión) y no debe bloqueear el prerender estático.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <SessionProvider>{children}</SessionProvider>
    </Suspense>
  );
}
