// Parallel Routes layout — acepta el slot @modal además de children
// Cuando el usuario navega a /eventos/[slug] desde esta página,
// Next.js renderiza el @modal slot en lugar de navegar completo
// Si el usuario refresca /eventos/[slug] directamente, ve la página full
export default function EventosLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
