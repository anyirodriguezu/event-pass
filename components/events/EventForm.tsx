"use client";

// useActionState (React 19) — maneja el estado del Server Action
// El form muestra errores del servidor sin romper la navegación
// El SubmitButton usa useFormStatus para deshabilitar mientras está pending
import { useActionState } from "react";
import { createEvent } from "@/actions/events";
import type { EventFormState } from "@/actions/events";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EventForm() {
  const [state, formAction] = useActionState<EventFormState, FormData>(
    createEvent,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* Error del servidor — solo aparece si createEvent retorna { error } */}
      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Nombre del evento *</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Ej: Festival de Jazz Lima 2026"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Describe tu evento..."
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="category">Categoría *</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MUSIC">🎵 Música</SelectItem>
                <SelectItem value="THEATER">🎭 Teatro</SelectItem>
                <SelectItem value="SPORTS">⚽ Deportes</SelectItem>
                <SelectItem value="WORKSHOP">🛠️ Taller</SelectItem>
                <SelectItem value="PARTY">🎉 Fiesta</SelectItem>
                <SelectItem value="OTHER">✨ Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="cover">Imagen de portada</Label>
            <Input id="cover" name="cover" type="file" accept="image/*" />
            <p className="text-xs text-muted-foreground">
              Se sube a Vercel Blob automáticamente. Máx 4.5 MB.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lugar y fecha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="venueName">Nombre del lugar *</Label>
            <Input
              id="venueName"
              name="venueName"
              required
              placeholder="Ej: Anfiteatro del Parque de la Exposición"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="venueAddress">Dirección *</Label>
            <Input
              id="venueAddress"
              name="venueAddress"
              required
              placeholder="Ej: Paseo Colón 125, Lima"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="startsAt">Fecha y hora de inicio *</Label>
            <Input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              required
            />
          </div>
        </CardContent>
      </Card>

      <SubmitButton
        variant="gradient"
        className="w-full"
        pendingText="Creando evento..."
      >
        Crear evento
      </SubmitButton>
    </form>
  );
}
