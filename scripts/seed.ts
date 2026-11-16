import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("🌱 Iniciando seed...");
  console.log("📡 DATABASE_URL:", process.env.DATABASE_URL ? "✅ cargada" : "❌ no encontrada");

  const { eq } = await import("drizzle-orm");

  // ── Usuarios ─────────────────────────────────────────────────────────────
  await db
    .insert(schema.users)
    .values({ name: "Ana Comprador", email: "ana@test.com", role: "BUYER" })
    .onConflictDoNothing();

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

  const userId =
    orgUser?.id ??
    (await db.select().from(schema.users).where(eq(schema.users.email, "carlos@test.com")).limit(1))[0].id;

  // ── Organizador ───────────────────────────────────────────────────────────
  const [organizer] = await db
    .insert(schema.organizers)
    .values({ userId, orgName: "Lima Eventos SAC", ruc: "20123456789", verified: true })
    .onConflictDoNothing()
    .returning();

  const organizerId =
    organizer?.id ??
    (await db.select().from(schema.organizers).where(eq(schema.organizers.userId, userId)).limit(1))[0].id;

  console.log("✅ Organizador creado");

  // ── Eventos ───────────────────────────────────────────────────────────────
  // Imágenes: Unsplash (uso libre, no requieren API key en URL directa)
  const eventosData = [
    {
      organizerId,
      title: "Festival de Jazz Lima 2026",
      slug: "festival-jazz-lima-2026",
      description:
        "La mejor noche de jazz en Lima con artistas internacionales y locales. Una experiencia musical única bajo las estrellas del Anfiteatro del Parque de la Exposición.",
      coverUrl:
        "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop",
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
      description:
        "Una noche de risas garantizadas con los mejores comediantes del Perú. Tres horas de humor sin censura en el mejor teatro de Miraflores.",
      coverUrl:
        "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&auto=format&fit=crop",
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
      title: "Clásico Lima: Universitario vs Alianza",
      slug: "clasico-lima-u-alianza-2026",
      description:
        "El partido más esperado del año. El Clásico del fútbol peruano en el Estadio Nacional. Vive la emoción del fútbol en vivo.",
      coverUrl:
        "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&auto=format&fit=crop",
      venueName: "Estadio Nacional del Perú",
      venueAddress: "Jr. José Díaz s/n, Lima",
      startsAt: new Date("2026-12-06T15:00:00"),
      endsAt: new Date("2026-12-06T17:00:00"),
      status: "PUBLISHED" as const,
      category: "SPORTS" as const,
      isFeatured: true,
    },
    {
      organizerId,
      title: "Workshop de Next.js + Vercel",
      slug: "workshop-nextjs-vercel-2026",
      description:
        "Aprende a construir aplicaciones web modernas con Next.js 16, Partial Prerendering, Server Actions y despliegue automático en Vercel. Cupos limitados.",
      coverUrl:
        "https://images.unsplash.com/photo-1591267990532-e5bdb1b0ceb8?w=800&auto=format&fit=crop",
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
      description:
        "Despide el 2026 con la mejor fiesta de Lima. Cena de gala, show en vivo, cotillón y vista al mar desde el Club Regatas. Dress code: formal.",
      coverUrl:
        "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&auto=format&fit=crop",
      venueName: "Club Regatas Lima",
      venueAddress: "Av. del Ejército s/n, Chorrillos, Lima",
      startsAt: new Date("2026-12-31T20:00:00"),
      endsAt: new Date("2027-01-01T04:00:00"),
      status: "PUBLISHED" as const,
      category: "PARTY" as const,
      isFeatured: true,
    },
    {
      organizerId,
      title: "Feria Gastronómica Perú Sabores",
      slug: "feria-gastronomica-peru-sabores-2026",
      description:
        "Tres días de gastronomía peruana en su máxima expresión. Más de 50 restaurantes, chefs invitados, talleres de cocina y maridaje con pisco.",
      coverUrl:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop",
      venueName: "Centro de Convenciones La Molina",
      venueAddress: "Av. La Molina 1070, La Molina, Lima",
      startsAt: new Date("2026-12-12T11:00:00"),
      endsAt: new Date("2026-12-14T21:00:00"),
      status: "PUBLISHED" as const,
      category: "OTHER" as const,
      isFeatured: false,
    },
  ];

  const insertedEvents = await db
    .insert(schema.events)
    .values(eventosData)
    .onConflictDoNothing()
    .returning();

  console.log(`✅ ${insertedEvents.length} eventos creados`);

  // ── Tipos de ticket por evento ────────────────────────────────────────────
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
    } else if (event.category === "SPORTS") {
      await db.insert(schema.ticketTypes).values([
        { eventId: event.id, name: "Norte/Sur", price: "50.00", currency: "PEN", totalQuantity: 2000, soldQuantity: 1200 },
        { eventId: event.id, name: "Oriente/Occidente", price: "80.00", currency: "PEN", totalQuantity: 1000, soldQuantity: 650 },
        { eventId: event.id, name: "Palco VIP", price: "250.00", currency: "PEN", totalQuantity: 100, soldQuantity: 40 },
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
    } else if (event.category === "OTHER") {
      await db.insert(schema.ticketTypes).values([
        { eventId: event.id, name: "Entrada diaria", price: "35.00", currency: "PEN", totalQuantity: 500, soldQuantity: 120 },
        { eventId: event.id, name: "Pase 3 días", price: "80.00", currency: "PEN", totalQuantity: 200, soldQuantity: 55 },
        { eventId: event.id, name: "Taller + Pase 3 días", price: "150.00", currency: "PEN", totalQuantity: 50, soldQuantity: 18 },
      ]);
    }
  }

  console.log("✅ Tipos de ticket creados");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed completo. Usuarios para pruebas:");
  console.log("   ana@test.com      → rol BUYER");
  console.log("   carlos@test.com   → rol ORGANIZER");
  console.log("   staff@test.com    → rol STAFF");
  console.log("   (cualquier contraseña)");
  console.log("");
  console.log("🎟️  Eventos creados:");
  for (const e of insertedEvents) {
    console.log(`   /${e.slug}  [${e.category}]`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

seed().catch(console.error);
