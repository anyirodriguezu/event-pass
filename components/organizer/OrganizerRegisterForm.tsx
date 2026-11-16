"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registerOrganizer } from "@/actions/organizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

function SubmitButton() {
  // useFormStatus: lee el estado pending del <form> padre — patrón de React 19
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" className="w-full h-11 sheen" disabled={pending}>
      {pending ? "Creando cuenta…" : "Crear cuenta de organizador"}
    </Button>
  );
}

export function OrganizerRegisterForm() {
  const [state, formAction] = useActionState(registerOrganizer, null);

  return (
    <div className="relative z-10 w-full max-w-md glass rounded-3xl p-8 shadow-2xl space-y-6 animate-bounce-in">
      <div className="space-y-2 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-2xl">🎟️</span>
          <span className="font-heading font-bold text-xl gradient-brand-text">EventPass</span>
        </Link>
        <h1 className="font-heading font-bold text-2xl text-white">Crea tu cuenta</h1>
        <p className="text-white/60 text-sm">Empieza a vender entradas hoy mismo</p>
      </div>

      {state?.error && (
        <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm text-center animate-fade-up">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <Field label="Tu nombre" name="name" placeholder="Carlos Ramírez" />
        <Field label="Nombre de tu organización" name="orgName" placeholder="Lima Eventos SAC" />
        <Field label="Email" name="email" type="email" placeholder="carlos@ejemplo.com" />
        <Field label="Contraseña" name="password" type="password" placeholder="Mínimo 8 caracteres" />
        <SubmitButton />
      </form>

      <div className="flex items-center justify-between text-sm text-white/50 pt-1">
        <Link href="/organizador" className="inline-flex items-center gap-1 hover:text-white transition-colors">
          <ArrowLeft className="size-3.5" /> Ya tengo cuenta
        </Link>
        <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-white/70 text-xs uppercase tracking-wide">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="bg-white/8 border-white/20 text-white placeholder:text-white/30 focus:border-primary/70 h-11"
      />
    </div>
  );
}
