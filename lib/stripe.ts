import Stripe from "stripe";

// Cliente de Stripe (solo servidor). Usa la secret key de MODO TEST (sk_test_...).
// Inicialización perezosa como lib/email.ts: no crea el cliente hasta que se usa,
// así el build no falla si la env var no está presente en tiempo de compilación.
let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("Falta STRIPE_SECRET_KEY");
    _stripe = new Stripe(key);
  }
  return _stripe;
}
