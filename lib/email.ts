import { Resend } from "resend";

let _resend: Resend | undefined;
function getInstance() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function sendTicketConfirmation({
  to,
  buyerName,
  eventTitle,
  eventDate,
  venueName,
  ticketType,
  qrUrl,
  ticketId,
}: {
  to: string;
  buyerName: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  ticketType: string;
  qrUrl: string;
  ticketId: string;
}) {
  return getInstance().emails.send({
    from: "EventPass <tickets@eventpass.app>",
    to,
    subject: `Tu ticket para ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">¡Ticket confirmado! 🎟️</h1>
        <p>Hola ${buyerName},</p>
        <p>Tu compra para <strong>${eventTitle}</strong> fue exitosa.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; color: #666;">Fecha:</td><td style="padding: 8px;">${eventDate}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Lugar:</td><td style="padding: 8px;">${venueName}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Tipo:</td><td style="padding: 8px;">${ticketType}</td></tr>
        </table>
        <div style="text-align: center; margin: 30px 0;">
          <img src="${qrUrl}" alt="QR Ticket" style="width: 200px; height: 200px;" />
          <p style="color: #666; font-size: 12px;">ID: ${ticketId}</p>
        </div>
        <p style="color: #666; font-size: 12px;">
          Presenta este QR en la puerta del evento. No lo compartas con nadie.
        </p>
      </div>
    `,
  });
}

export async function sendEventReminder({
  to,
  buyerName,
  eventTitle,
  eventDate,
  venueName,
}: {
  to: string;
  buyerName: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
}) {
  return getInstance().emails.send({
    from: "EventPass <noreply@eventpass.app>",
    to,
    subject: `Recordatorio: ${eventTitle} es mañana`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">¡Tu evento es mañana! ⏰</h1>
        <p>Hola ${buyerName},</p>
        <p>Te recordamos que <strong>${eventTitle}</strong> es mañana.</p>
        <p><strong>Fecha:</strong> ${eventDate}</p>
        <p><strong>Lugar:</strong> ${venueName}</p>
        <p>No olvides llevar tu QR. ¡Nos vemos allá!</p>
      </div>
    `,
  });
}
