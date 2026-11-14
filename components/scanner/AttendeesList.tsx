"use client";

// Client Component — polling cada 10s a /api/events/[eventId]/attendees
// Simula tiempo real sin WebSockets: bajo costo de infraestructura para aprender
import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type Attendee = {
  ticketId: string;
  status: string;
  checkedInAt: string | null;
  buyerName: string | null;
  buyerEmail: string;
  typeName: string;
};

export function AttendeesList({ eventId }: { eventId: string }) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const fetchAttendees = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/attendees`);
      if (res.ok) {
        const data = await res.json();
        setAttendees(data);
        setLastUpdated(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchAttendees();
    const interval = setInterval(fetchAttendees, 10_000);
    return () => clearInterval(interval);
  }, [fetchAttendees]);

  const checkedIn = attendees.filter((a) => a.status === "USED");
  const pending = attendees.filter((a) => a.status === "ACTIVE");

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats en vivo */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-3xl font-bold text-green-700">{checkedIn.length}</p>
          <p className="text-xs text-green-600 mt-0.5">Ingresaron</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <p className="text-3xl font-bold text-orange-700">{pending.length}</p>
          <p className="text-xs text-orange-600 mt-0.5">Pendientes</p>
        </div>
        <div className="bg-gray-50 border rounded-xl p-3">
          <p className="text-3xl font-bold">{attendees.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Actualización automática cada 10s · Última vez:{" "}
        {format(lastUpdated, "HH:mm:ss")}
      </p>

      {/* Últimos ingresos */}
      {checkedIn.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold text-sm">Últimos ingresos</h2>
          <div className="divide-y border rounded-xl overflow-hidden">
            {checkedIn
              .slice(-20)
              .reverse()
              .map((a) => (
                <div
                  key={a.ticketId}
                  className="flex justify-between items-center px-4 py-2.5 hover:bg-muted/30 text-sm"
                >
                  <div>
                    <p className="font-medium">{a.buyerName ?? a.buyerEmail}</p>
                    <p className="text-xs text-muted-foreground">{a.typeName}</p>
                  </div>
                  {a.checkedInAt && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(a.checkedInAt), "HH:mm", { locale: es })}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Pendientes */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-semibold text-sm">Por ingresar</h2>
          <div className="divide-y border rounded-xl overflow-hidden">
            {pending.map((a) => (
              <div
                key={a.ticketId}
                className="flex justify-between items-center px-4 py-2.5 hover:bg-muted/30 text-sm"
              >
                <div>
                  <p className="font-medium">{a.buyerName ?? a.buyerEmail}</p>
                  <p className="text-xs text-muted-foreground">{a.typeName}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 text-xs">Activo</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {attendees.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">
          Aún no hay tickets vendidos para este evento.
        </p>
      )}
    </div>
  );
}
