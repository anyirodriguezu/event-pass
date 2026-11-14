import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

// La conexión se crea DESPUÉS de cargar las variables de entorno
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";

async function seed() {
  // Crear la conexión aquí dentro, cuando DATABASE_URL ya está disponible
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("🌱 Iniciando seed...");
  console.log("📡 DATABASE_URL:", process.env.DATABASE_URL ? "✅ cargada" : "❌ no encontrada");

  const [buyer] = await db
    .insert(schema.users)
    .values({ name: "Ana Comprador", email: "ana@test.com", role: "BUYER" })
    .onConflictDoNothing()
    .returning();

  const [orgUser] = await db
    .insert(schema.users)
    .values({ name: "Carlos Organizador", email: "carlos@test.com", role: "ORGANIZER" })
    .onConflictDoNothing()
    .returning();

  await db
    .insert(schema.users)
    .values({ name: "Staff Entrada", email: "staff@test.com", role: "STAFF" })
    .onConflictDoNothing();

  console.log("✅ Usuarios creados");

  const userId = orgUser?.id ?? (await db.select().from(schema.users).where((await import("drizzle-orm")).eq(schema.users.email, "carlos@test.com")).limit(1))[0].id;

  const [organizer] = await db
    .insert(schema.organizers)
    .values({ userId, orgName: "Lima Eventos SAC", ruc: "20123456789", verified: true })
    .onConflictDoNothing()
    .returning();

  const organizerId = organizer?.id ?? (await db.select().from(schema.organizers).where((await import("drizzle-orm")).eq(schema.organizers.userId, userId)).limit(1))[0].id;

  console.log("✅ Organizador creado");

  const { eq } = await import("drizzle-orm");

  const eventosData = [
    {
      organizerId,
      title: "Festival de Jazz Lima 2026",
      slug: "festival-jazz-lima-2026",
      description: "La mejor noche de jazz en Lima con artistas internacionales y locales.",
      venueName: "Anfiteatro del Parque de la Exposición",
      venueAddress: "Paseo Colón 125, Lima",
      startsAt: new Date("2026-11-15T20:00:00"),
      endsAt: new Date("2026-11-15T23:30:00"),
      status: "PUBLISHED" as const,
      category: "MUSIC" as const,
      isFeatured: true,
    },
    {
      organizerId,
      title: "Stand Up Comedy Night",
      slug: "stand-up-comedy-night-2026",
      description: "Una noche de risas garantizadas con los mejores comediantes del Perú.",
      venueName: "Teatro Municipal de Miraflores",
      venueAddress: "Av. Larco 1150, Miraflores, Lima",
      startsAt: new Date("2026-11-20T19:30:00"),
      endsAt: new Date("2026-11-20T22:00:00"),
      status: "PUBLISHED" as const,
      category: "THEATER" as const,
      isFeatured: false,
    },
    {
      organizerId,
      title: "Workshop de Next.js + Vercel",
      slug: "workshop-nextjs-vercel-2026",
      description: "Aprende a construir aplicaciones web modernas con Next.js 16 y Vercel.",
      venueName: "Hub de Innovación UTEC",
      venueAddress: "Jr. Medrano Silva 165, Barranco, Lima",
      startsAt: new Date("2026-11-28T09:00:00"),
      endsAt: new Date("2026-11-28T13:00:00"),
      status: "PUBLISHED" as const,
      category: "WORKSHOP" as const,
      isFeatured: true,
    },
    {
      organizerId,
      title: "Fiesta de Año Nuevo 2027",
      slug: "fiesta-anio-nuevo-2027",
      description: "Despide el 2026 con la mejor fiesta de Lima. Cena de gala y show en vivo.",
      venueName: "Club Regatas Lima",
      venueAddress: "Av. del Ejército s/n, Chorrillos, Lima",
      startsAt: new Date("2026-12-31T20:00:00"),
      endsAt: new Date("2027-01-01T04:00:00"),
      status: "PUBLISHED" as const,
      category: "PARTY" as const,
      isFeatured: true,
    },
  ];

  const insertedEvents = await db
    .insert(schema.events)
    .values(eventosData)
    .onConflictDoNothing()
    .returning();

  console.log(`✅ ${insertedEvents.length} eventos creados`);

  for (const event of insertedEvents) {
    if (event.category === "MUSIC") {
      await db.insert(schema.ticketTypes).values([
        { eventId: event.id, name: "General", price: "80.00", currency: "PEN", totalQuantity: 200, soldQuantity: 45 },
        { eventId: event.id, name: "VIP", price: "180.00", currency: "PEN", totalQuantity: 50, soldQuantity: 12 },
        { eventId: event.id, name: "Mesa Premium", price: "350.00", currency: "PEN", totalQuantity: 20, soldQuantity: 8 },
      ]);
    } else if (event.category === "THEATER") {
      await db.insert(schema.ticketTypes).values([
        { eventId: event.id, name: "Platea", price: "60.00", currency: "PEN", totalQuantity: 150, soldQuantity: 30 },
        { eventId: event.id, name: "Balcón", price: "40.00", currency: "PEN", totalQuantity: 100, soldQuantity: 15 },
      ]);
    } else if (event.category === "WORKSHOP") {
      await db.insert(schema.ticketTypes).values([
        { eventId: event.id, name: "Presencial", price: "120.00", currency: "PEN", totalQuantity: 40, soldQuantity: 22 },
        { eventId: event.id, name: "Early Bird", price: "80.00", currency: "PEN", totalQuantity: 10, soldQuantity: 10 },
      ]);
    } else if (event.category === "PARTY") {
      await db.insert(schema.ticketTypes).values([
        { eventId: event.id, name: "Individual", price: "250.00", currency: "PEN", totalQuantity: 300, soldQuantity: 180 },
        { eventId: event.id, name: "Pareja", price: "450.00", currency: "PEN", totalQuantity: 100, soldQuantity: 60 },
        { eventId: event.id, name: "Mesa VIP (10 personas)", price: "3500.00", currency: "PEN", totalQuantity: 15, soldQuantity: 5 },
      ]);
    }
  }

  console.log("✅ Tickets creados");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Listo. Usuarios para login:");
  console.log("   ana@test.com      → rol BUYER");
  console.log("   carlos@test.com   → rol ORGANIZER");
  console.log("   staff@test.com    → rol STAFF");
  console.log("   (cualquier contraseña)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

seed().catch(console.error);
