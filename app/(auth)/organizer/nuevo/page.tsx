// Formulario de creación de evento con Server Action via useActionState
// EventForm es Client Component — maneja estado pending y errores del servidor
import { EventForm } from "@/components/events/EventForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nuevo evento" };

export default function NuevoEventoPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Crear nuevo evento</h1>
      <EventForm />
    </div>
  );
}
