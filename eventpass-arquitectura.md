# 🎟️ EventPass — Arquitectura Completa

> Portal de venta de tickets con IA para eventos en Latinoamérica  
> Stack: Next.js 15 · Vercel · TypeScript · Drizzle · Stripe

---

## 👥 Roles y Casuísticas

| Rol | Acciones principales |
|---|---|
| **Organizador** | Crear evento, subir imágenes, definir tipos de ticket, publicar, ver ventas, exportar asistentes, cerrar evento |
| **Comprador** | Buscar eventos, ver detalle, comprar ticket, recibir QR, transferir ticket, solicitar reembolso |
| **Staff / Validador** | Escanear QR en entrada, ver lista de asistentes, marcar ingreso, ver stats en tiempo real |
| **Admin** | Gestionar usuarios, verificar organizadores, moderar eventos, ver métricas globales |

---

## 🗄️ Schema de Base de Datos

```sql
-- USUARIOS
users (
  id, name, email, 
  role: BUYER | ORGANIZER | STAFF | ADMIN,
  avatar_url, created_at
)

-- ORGANIZADORES
organizers (
  id, user_id, org_name, ruc, 
  bank_account, verified: bool, logo_url
)

-- EVENTOS
events (
  id, organizer_id, title, slug, description,
  cover_url, venue_name, venue_address, lat, lng,
  starts_at, ends_at,
  status: DRAFT | PUBLISHED | SOLD_OUT | FINISHED,
  category: MUSIC | THEATER | SPORTS | WORKSHOP | PARTY | OTHER,
  is_featured: bool, created_at
)

-- TIPOS DE TICKET (General, VIP, Mesa, etc.)
ticket_types (
  id, event_id, name, price, currency,
  total_quantity, sold_quantity,
  sale_starts_at, sale_ends_at
)

-- ÓRDENES DE COMPRA
orders (
  id, buyer_id, event_id,
  status: PENDING | PAID | CANCELLED | REFUNDED,
  total_amount, payment_intent_id, created_at
)

-- TICKETS INDIVIDUALES
tickets (
  id, order_id, ticket_type_id, event_id, buyer_id,
  qr_code, qr_url,
  status: ACTIVE | USED | CANCELLED | TRANSFERRED,
  checked_in_at, checked_in_by
)

-- TRANSFERENCIAS
ticket_transfers (
  id, ticket_id, from_user_id, to_user_id,
  token, expires_at, accepted_at
)

-- REEMBOLSOS
refunds (
  id, order_id, amount, reason,
  status: PENDING | APPROVED | REJECTED,
  requested_at, processed_at
)
```

---

## 🗂️ Estructura de Carpetas

```
eventpass/
│
├── app/
│   ├── (public)/                    # Sin auth — SSG + ISR
│   │   ├── page.tsx                 # Landing page (SSG)
│   │   ├── eventos/
│   │   │   ├── page.tsx             # Listado de eventos (ISR)
│   │   │   └── [slug]/
│   │   │       └── page.tsx         # Detalle de evento (ISR + PPR)
│   │   └── categorias/[cat]/
│   │       └── page.tsx             # Eventos por categoría (ISR)
│   │
│   ├── (auth)/                      # Rutas protegidas — SSR
│   │   ├── dashboard/
│   │   │   ├── page.tsx             # Mis tickets (comprador)
│   │   │   └── ticket/[id]/
│   │   │       └── page.tsx         # Ver QR de ticket
│   │   │
│   │   ├── organizer/
│   │   │   ├── page.tsx             # Mis eventos + stats
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx         # Crear nuevo evento
│   │   │   └── [eventId]/
│   │   │       ├── page.tsx         # Editar evento
│   │   │       ├── ventas/
│   │   │       │   └── page.tsx     # Reporte de ventas
│   │   │       └── asistentes/
│   │   │           └── page.tsx     # Lista de asistentes
│   │   │
│   │   └── staff/
│   │       └── [eventId]/
│   │           ├── scanner/
│   │           │   └── page.tsx     # Escanear QR con cámara
│   │           └── lista/
│   │               └── page.tsx     # Lista asistentes en vivo
│   │
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts             # Stripe checkout session
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts         # Webhook: pago exitoso
│   │   ├── tickets/
│   │   │   └── validate/
│   │   │       └── route.ts         # Validar QR (Edge Function)
│   │   └── cron/
│   │       └── reminders/
│   │           └── route.ts         # Job: emails 24h antes del evento
│   │
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventFilters.tsx
│   │   ├── EventGrid.tsx
│   │   └── EventForm.tsx
│   ├── tickets/
│   │   ├── TicketCard.tsx
│   │   ├── QRCode.tsx
│   │   └── TransferModal.tsx
│   ├── checkout/
│   │   ├── CheckoutForm.tsx
│   │   └── OrderSummary.tsx
│   └── scanner/
│       └── QRScanner.tsx            # Webcam + validación en tiempo real
│
├── lib/
│   ├── db/
│   │   ├── schema.ts                # Drizzle schema (todas las tablas)
│   │   └── index.ts                 # Conexión a Vercel Postgres
│   ├── auth.ts                      # NextAuth v5 config
│   ├── stripe.ts                    # Stripe client + helpers
│   ├── blob.ts                      # Vercel Blob: subir/eliminar imágenes
│   ├── kv.ts                        # Vercel KV: cache + rate limiting
│   └── email.ts                     # Resend: templates de email
│
├── actions/
│   ├── events.ts                    # SA: crear, editar, publicar evento
│   ├── tickets.ts                   # SA: comprar, transferir ticket
│   └── checkin.ts                   # SA: check-in en puerta
│
├── middleware.ts                    # Auth guard + geo routing por país
├── vercel.json                      # Cron jobs
└── drizzle.config.ts
```

---

## 🔧 Stack Tecnológico

| Categoría | Tecnología | Uso |
|---|---|---|
| Framework | Next.js 15 | App Router, Server Components, Server Actions, PPR |
| Lenguaje | TypeScript | Tipado completo |
| Estilos | Tailwind CSS + shadcn/ui | UI/UX |
| ORM | Drizzle ORM | Queries type-safe |
| Auth | NextAuth v5 | Google + Email/Password |
| Pagos | Stripe | Checkout + Webhooks |
| Emails | Resend | Emails transaccionales |
| QR Generación | react-qr-code | Generar QR por ticket |
| QR Escaneo | html5-qrcode | Cámara del dispositivo |
| DB | Vercel Postgres (Neon) | Base de datos principal |
| Storage | Vercel Blob | Imágenes de eventos + QR |
| Cache | Vercel KV (Upstash Redis) | Rate limiting + cache búsquedas |
| Cron | Vercel Cron Jobs | Recordatorios automáticos |
| Analytics | Vercel Analytics + Speed Insights | Métricas de uso |
| Flags | Vercel Edge Config | Feature flags sin redeploy |

---

## 🚀 Inicio con Claude Code en VS Code

### Paso 1 — Instala Claude Code

```bash
npm install -g @anthropic/claude-code
```

### Paso 2 — Crea la carpeta del proyecto

```bash
mkdir eventpass && cd eventpass
code .
```

### Paso 3 — Abre la terminal en VS Code y lanza Claude Code

```bash
claude
```

### Paso 4 — Pega este prompt en Claude Code

```
Crea un proyecto Next.js 15 llamado "EventPass" con las siguientes 
especificaciones:

STACK:
- Next.js 15 con App Router y TypeScript
- Tailwind CSS + shadcn/ui
- Drizzle ORM + Vercel Postgres (usa la variable DATABASE_URL)
- NextAuth v5 (con proveedor Google + Credentials)
- Stripe para pagos
- Resend para emails
- Vercel Blob, KV, Analytics

ESTRUCTURA DE CARPETAS:
- app/(public): landing page, listado de eventos, detalle [slug]
- app/(auth): dashboard comprador, panel organizador, panel staff
- app/api: checkout, webhooks/stripe, tickets/validate, cron/reminders
- components/ui (shadcn), components/events, components/tickets, 
  components/scanner
- lib/db (schema drizzle + conexión), lib/auth, lib/stripe, 
  lib/blob, lib/kv, lib/email
- actions/: events.ts, tickets.ts, checkin.ts
- middleware.ts para auth guard

SCHEMA DE BASE DE DATOS (Drizzle):
Crea en lib/db/schema.ts las tablas:
users, organizers, events, ticket_types, orders, tickets,
ticket_transfers, refunds

ARCHIVOS DE CONFIGURACIÓN:
- .env.local con todas las variables necesarias (comentadas)
- vercel.json con cron job para /api/cron/reminders a las 8am Lima (UTC-5)
- drizzle.config.ts apuntando a DATABASE_URL
- next.config.ts con Vercel Analytics e imágenes permitidas desde Vercel Blob

Instala todas las dependencias necesarias con npm.
Al final muéstrame un resumen de lo que creaste.
```

---

## 🔑 Variables de Entorno

```bash
# .env.local

# Base de datos (Vercel Dashboard > Storage > Postgres)
DATABASE_URL=

# Auth
AUTH_SECRET=                          # openssl rand -base64 32
AUTH_GOOGLE_ID=                       # console.cloud.google.com
AUTH_GOOGLE_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Pagos (stripe.com/dashboard)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=                # stripe listen --forward-to localhost:3000/api/webhooks/stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Emails (resend.com)
RESEND_API_KEY=

# Storage (Vercel Dashboard > Storage > Blob)
BLOB_READ_WRITE_TOKEN=

# KV / Redis (Vercel Dashboard > Storage > KV)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ⚙️ vercel.json — Cron Jobs

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 13 * * *"
    }
  ]
}
```

> `0 13 * * *` = 8:00 AM hora Lima (UTC-5) todos los días

---

## 🌐 Estrategias de Rendering por Ruta

| Ruta | Estrategia | Por qué |
|---|---|---|
| `/` | SSG | Nunca cambia, máximo rendimiento |
| `/eventos` | ISR (60s) | Se actualiza sin rebuild |
| `/eventos/[slug]` | ISR + PPR | Shell estático, contador dinámico |
| `/categorias/[cat]` | ISR (300s) | Cambia poco, SEO importante |
| `/dashboard` | SSR | Datos del usuario en tiempo real |
| `/organizer` | SSR | Ventas en tiempo real |
| `/staff/scanner` | Client | Necesita cámara del dispositivo |
| `/api/tickets/validate` | Edge Function | Latencia mínima en puerta |

---

## 🗓️ Roadmap de Desarrollo

| Semana | Objetivo | Features |
|---|---|---|
| 1 | Setup + Base | Proyecto, DB, Auth, Landing, Listado ISR |
| 2 | Eventos | Crear/editar evento, subida imágenes Blob |
| 3 | Checkout | Stripe, generación QR, emails confirmación |
| 4 | Dashboards | Panel comprador, panel organizador + stats |
| 5 | Staff | Escáner QR con cámara, check-in en tiempo real |
| 6 | Automatización | Cron recordatorios, transferencia tickets |
| 7 | Vercel Pro | Edge Config flags, Analytics, WAF, Middleware geo |
| 8 | Pulido | OG images, SEO, Rolling Releases, deploy prod |

---

## 💡 Features que marcan la diferencia vs competencia

- **Anti-fraude con QR único** — cada ticket tiene QR encriptado con hash, se invalida al primer escaneo
- **Transferencia segura** — link de transferencia con expiración de 24h
- **Escáner offline-first** — el staff puede validar aunque falle el internet (cache local)
- **Precios dinámicos** — precio aumenta automáticamente según disponibilidad
- **OG image por evento** — imagen personalizada al compartir en WhatsApp/redes
- **Panel staff en tiempo real** — ve quién entró, cuántos faltan, alertas
- **Reembolso automatizado** — si el organizador cancela, Stripe devuelve automáticamente

---

*Generado para el proyecto EventPass — Next.js 15 + Vercel Learning Project*
