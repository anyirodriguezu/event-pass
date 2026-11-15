import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-10">
      <div className="space-y-2">
        <h1 className="font-heading font-bold text-3xl sm:text-4xl">Política de privacidad</h1>
        <p className="text-muted-foreground text-sm">Última actualización: noviembre 2025</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">1. Datos que recopilamos</h2>
        <p className="text-muted-foreground leading-relaxed">
          Recopilamos únicamente los datos necesarios para operar la plataforma:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-sm pl-2">
          <li>Nombre y dirección de email (al registrarte con Google)</li>
          <li>Historial de compras y tickets</li>
          <li>País de origen (vía IP, para geo-routing)</li>
          <li>Eventos visitados y comprados (analytics anónimos)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">2. Cómo usamos tus datos</h2>
        <p className="text-muted-foreground leading-relaxed">
          Tus datos se usan exclusivamente para:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-sm pl-2">
          <li>Gestionar tu cuenta y tickets</li>
          <li>Enviarte confirmaciones de compra y recordatorios de eventos</li>
          <li>Mejorar la experiencia de la plataforma</li>
          <li>Prevenir fraudes en la validación de QRs</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">3. Autenticación</h2>
        <p className="text-muted-foreground leading-relaxed">
          EventPass usa Google OAuth para el inicio de sesión. No almacenamos contraseñas.
          Tu sesión se gestiona mediante tokens firmados con Auth.js. Nunca tenemos acceso
          a tu contraseña de Google.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">4. Almacenamiento</h2>
        <p className="text-muted-foreground leading-relaxed">
          Tus datos se almacenan en servidores de Vercel (US East) con cifrado en reposo y
          en tránsito. Las imágenes de portada se guardan en Vercel Blob. Los emails se
          envían mediante Resend.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">5. Compartición de datos</h2>
        <p className="text-muted-foreground leading-relaxed">
          No vendemos ni compartimos tus datos personales con terceros. Los organizadores
          de eventos tienen acceso únicamente al nombre y email de los compradores de sus
          propios eventos, para fines de gestión de asistencia.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">6. Tus derechos</h2>
        <p className="text-muted-foreground leading-relaxed">
          Puedes solicitar la eliminación de tu cuenta y todos los datos asociados enviando
          un email a soporte@eventpass.lat. Procesamos las solicitudes en un máximo de 30 días.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading font-semibold text-xl">7. Cookies</h2>
        <p className="text-muted-foreground leading-relaxed">
          Usamos cookies estrictamente necesarias para mantener tu sesión activa y para
          el funcionamiento del Draft Mode. No usamos cookies de terceros para publicidad.
        </p>
      </section>
    </div>
  );
}
