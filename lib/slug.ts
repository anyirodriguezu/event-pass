// Convierte un texto a un slug URL-safe: minúsculas, sin acentos, con guiones.
// Función pura (sin efectos) — por eso vive aquí y no dentro de un archivo
// "use server": así se puede importar en tests y en cualquier contexto.
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD") // separa letra y acento: "á" -> "a" + combining accent
    .replace(/[̀-ͯ]/g, "") // elimina los acentos (combining marks)
    .replace(/[^a-z0-9]+/g, "-") // cualquier cosa no alfanumérica -> guion
    .replace(/(^-|-$)/g, ""); // sin guiones al inicio/fin
}
