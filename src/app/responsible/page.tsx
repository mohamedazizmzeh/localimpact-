import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";   // 👈 HERE

export default async function ResponsiblePage() {
  const session = await requireRole(["RESPONSIBLE", "ADMIN"]);

  return (
    <div className="max-w-xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-4">Responsible area</h1>
      <p>Welcome, {session.user.name}</p>
      <p>Responsibles and admins can see this page.</p>
    </div>
  );
}