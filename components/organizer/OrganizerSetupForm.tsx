"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setupOrganizer } from "@/actions/organizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="gradient" className="w-full sheen" disabled={pending}>
      {pending ? "Guardando…" : "Crear perfil y continuar"}
    </Button>
  );
}

export function OrganizerSetupForm() {
  const [state, formAction] = useActionState(setupOrganizer, null);

  return (
    <Card className="gradient-border">
      <CardContent className="p-6 space-y-4">
        {state?.error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-destructive text-sm">
            {state.error}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="orgName">Nombre de la organización</Label>
            <Input id="orgName" name="orgName" placeholder="Lima Eventos SAC" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ruc">RUC (opcional)</Label>
            <Input id="ruc" name="ruc" placeholder="20123456789" />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
