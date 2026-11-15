import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, BookOpen, Zap } from "lucide-react";

export const metadata: Metadata = { title: "Soporte" };

const FAQ = [
  {
    q: "¿Cómo compro un ticket?",
    a: "Busca el evento en la sección Eventos, selecciona el tipo de entrada y la cantidad, luego sigue el proceso de pago. Recibirás un email de confirmación con tu código QR.",
  },
  {
    q: "¿Cómo valido mi ticket en la puerta?",
    a: "Muestra el código QR de tu ticket en la app o en el email de confirmación al staff del evento. El QR se invalida automáticamente al primer escaneo.",
  },
  {
    q: "¿Puedo transferir mi ticket a otra persona?",
    a: "Sí. Desde tu dashboard, abre el ticket y usa la opción 'Transferir'. Se generará un link válido por 24 horas que puedes enviar a la otra persona.",
  },
  {
    q: "¿Cómo creo un evento como organizador?",
    a: "Inicia sesión y accede al Panel de organizador. Completa el formulario con los datos del evento, agrega los tipos de ticket con precios y cantidades, y publícalo cuando esté listo.",
  },
  {
    q: "¿Qué pasa si el evento se cancela?",
    a: "El organizador debe notificar la cancelación a través del panel. EventPass enviará un email a todos los compradores. Para reembolsos, contáctanos directamente.",
  },
  {
    q: "No recibí el email de confirmación, ¿qué hago?",
    a: "Revisa tu carpeta de spam. Si no aparece, verifica tu historial de tickets en el dashboard — tu ticket es válido aunque no hayas recibido el email.",
  },
];

export default function SoportePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-14">
      <div className="space-y-2">
        <h1 className="font-heading font-bold text-3xl sm:text-4xl">Soporte</h1>
        <p className="text-muted-foreground">
          ¿Tienes algún problema? Estamos aquí para ayudarte.
        </p>
      </div>

      {/* Canales de contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: Mail,
            title: "Email",
            desc: "soporte@eventpass.lat",
            sub: "Respuesta en 24–48 h",
            color: "text-violet-600 dark:text-violet-400",
            bg: "bg-violet-50 dark:bg-violet-950/30",
          },
          {
            icon: MessageCircle,
            title: "Chat",
            desc: "Chat en vivo",
            sub: "Lun–Vie 9am–6pm",
            color: "text-fuchsia-600 dark:text-fuchsia-400",
            bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
          },
          {
            icon: Zap,
            title: "Urgente",
            desc: "Para el día del evento",
            sub: "+51 999 000 111",
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950/30",
          },
        ].map((c) => (
          <div
            key={c.title}
            className={`rounded-2xl border border-border/60 p-5 space-y-2 ${c.bg}`}
          >
            <c.icon className={`size-6 ${c.color}`} />
            <p className="font-semibold text-sm">{c.title}</p>
            <p className="text-sm font-medium">{c.desc}</p>
            <p className="text-xs text-muted-foreground">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-violet-500" />
          <h2 className="font-heading font-semibold text-xl">Preguntas frecuentes</h2>
        </div>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-border/60 bg-card p-5 space-y-2"
            >
              <p className="font-semibold text-sm">{item.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        ¿No encontraste lo que buscabas?{" "}
        <Link href="mailto:soporte@eventpass.lat" className="text-violet-600 hover:underline">
          Escríbenos directamente
        </Link>
      </p>
    </div>
  );
}
