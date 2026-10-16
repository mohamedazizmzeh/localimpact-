import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";   // 👈 HERE — after imports, before the component

export default async function AdminPage() {
  const session = await requireRole(["ADMIN"]);

  return (
    <div className="max-w-xl mx-auto mt-16 p-6">
      <h1 className="text-2xl font-bold mb-4">Admin area</h1>
      <p>Welcome, {session.user.name}</p>
      <p>Only admins can see this page.</p>
    </div>
  );
}