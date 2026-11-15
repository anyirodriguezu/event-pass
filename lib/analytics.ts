// Funciones de analytics que se ejecutan con after() — post-respuesta
// En producción: enviar a Mixpanel, Posthog, o incrementar contador en DB
// after() garantiza que esto no bloquea ni retrasa el render de la página

export async function trackEventView(eventId: string, slug: string) {
  // Structured log — Vercel captura stdout en sus logs automáticamente
  console.log(
    JSON.stringify({
      event: "event_view",
      eventId,
      slug,
      timestamp: new Date().toISOString(),
    })
  );
}

export async function trackEventCreated(eventId: string, slug: string, organizerId: string) {
  console.log(
    JSON.stringify({
      event: "event_created",
      eventId,
      slug,
      organizerId,
      timestamp: new Date().toISOString(),
    })
  );
}

