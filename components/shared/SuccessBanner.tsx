"use client";

const PARTICLES = [
  { color: "bg-violet-500",  cls: "confetti-a", left: "8%",  delay: "0s" },
  { color: "bg-fuchsia-500", cls: "confetti-b", left: "18%", delay: "0.1s" },
  { color: "bg-pink-400",    cls: "confetti-c", left: "30%", delay: "0.05s" },
  { color: "bg-yellow-400",  cls: "confetti-a", left: "45%", delay: "0.15s" },
  { color: "bg-emerald-400", cls: "confetti-b", left: "60%", delay: "0.08s" },
  { color: "bg-violet-400",  cls: "confetti-c", left: "72%", delay: "0.12s" },
  { color: "bg-fuchsia-400", cls: "confetti-a", left: "84%", delay: "0.03s" },
  { color: "bg-pink-500",    cls: "confetti-b", left: "92%", delay: "0.18s" },
];

export function SuccessBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 px-5 py-4 animate-in fade-in slide-in-from-top-3 duration-500">
      {/* Confetti particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`absolute bottom-2 size-2 rounded-sm ${p.color} ${p.cls}`}
          style={{ left: p.left, animationDelay: p.delay }}
        />
      ))}

      <div className="flex items-start gap-3">
        <div className="text-2xl mt-0.5">🎉</div>
        <div>
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
            ¡Compra exitosa!
          </p>
          <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
            Tus tickets están listos. Recibirás la confirmación por email en unos minutos.
          </p>
        </div>
      </div>
    </div>
  );
}
