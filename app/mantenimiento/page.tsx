export default function MantenimientoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-6 bg-background">
      <p className="text-6xl">🔧</p>
      <div className="space-y-3 max-w-md">
        <h1 className="font-heading font-bold text-3xl">
          Estamos mejorando EventPass
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Realizando tareas de mantenimiento programado. Volvemos pronto.
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Mantenimiento en progreso
      </div>
    </div>
  );
}
