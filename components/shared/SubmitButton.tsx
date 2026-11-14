"use client";

// useFormStatus detecta si el form padre está en estado pending
// Permite deshabilitar el botón automáticamente sin prop drilling
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<typeof Button> & {
  pendingText?: string;
};

export function SubmitButton({
  children,
  pendingText = "Guardando...",
  ...props
}: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}
