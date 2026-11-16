import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { OrganizerRegisterForm } from "@/components/organizer/OrganizerRegisterForm";

export const metadata: Metadata = { title: "Registro de organizador" };

export default async function RegistroOrganizadorPage() {
  const session = await auth();
  if (session?.user.role === "ORGANIZER") redirect("/organizer");

  return (
    <div className="relative min-h-screen aurora-bg overflow-hidden flex items-center justify-center p-4">
      <div className="blob w-80 h-80 bg-fuchsia-500/40 top-[-4rem] right-[-4rem]" />
      <div className="blob w-72 h-72 bg-violet-600/40 bottom-[-5rem] left-[-3rem]" style={{ animationDelay: "-7s" }} />
      <OrganizerRegisterForm />
    </div>
  );
}
