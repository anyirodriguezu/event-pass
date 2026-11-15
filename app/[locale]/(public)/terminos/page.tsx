import type { Metadata } from "next";

export const metadata: Metadata = { title: "Términos de uso" };

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div className="space-y-2">
        <h1 className="font-heading font-bold text-3xl sm:text-4xl">Términos de uso</h1>
        <p className="text-muted-foreground text-sm">Última actualización: noviembre 2025</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">1. Aceptación de los términos</h2>
        <p className="text-muted-foreground leading-relaxed">
          Al acceder y usar EventPass, aceptas estos términos en su totalidad. Si no estás de acuerdo
          con alguna parte, no debes usar la plataforma.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">2. Uso de la plataforma</h2>
        <p className="text-muted-foreground leading-relaxed">
          EventPass es una plataforma de venta y validación de tickets para eventos. Puedes usarla
          como comprador, organizador o staff. Cada rol tiene acceso a funciones específicas y está
          sujeto a las políticas de cada evento.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">3. Tickets y pagos</h2>
        <p className="text-muted-foreground leading-relaxed">
          Los tickets comprados a través de EventPass son válidos únicamente para el evento y fecha
          indicados. Cada ticket genera un código QR único que se invalida al primer escaneo.
          Los pagos son procesados de forma segura. No se realizan reembolsos salvo cancelación
          del evento por parte del organizador.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">4. Responsabilidades del organizador</h2>
        <p className="text-muted-foreground leading-relaxed">
          Los organizadores son responsables de la información publicada en sus eventos, incluyendo
          fechas, precios, venue y descripción. EventPass no se responsabiliza por cambios o
          cancelaciones no comunicados a tiempo a los compradores.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">5. Transferencia de tickets</h2>
        <p className="text-muted-foreground leading-relaxed">
          Los tickets pueden transferirse a otra persona mediante el sistema de transferencia de
          EventPass. Los links de transferencia expiran en 24 horas. Una vez aceptada la
          transferencia, el ticket queda registrado a nombre del nuevo titular.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">6. Conducta prohibida</h2>
        <p className="text-muted-foreground leading-relaxed">
          Está prohibido intentar duplicar, falsificar o transferir tickets de manera fraudulenta.
          También está prohibido el uso automatizado de la plataforma (bots) para comprar entradas
          en masa. EventPass se reserva el derecho de cancelar cuentas que infrinjan estas normas.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">7. Modificaciones</h2>
        <p className="text-muted-foreground leading-relaxed">
          EventPass puede modificar estos términos en cualquier momento. Los cambios se notificarán
          con al menos 7 días de anticipación. El uso continuado de la plataforma implica aceptación
          de los nuevos términos.
        </p>
      </section>
    </div>
  );
}
