"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NavAuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Button asChild size="sm" variant="outline" className="font-medium">
        <Link href="/dashboard">Mi cuenta</Link>
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="sm"
      variant="gradient"
    >
      <Link href="/login">Iniciar sesión</Link>
    </Button>
  );
}
