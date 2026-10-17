import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role;

  return (
    <div className="max-w-3xl mx-auto mt-16 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="bg-white border rounded p-4 mb-6">
        <p><strong>Welcome:</strong> {session.user?.name}</p>
        <p><strong>Email:</strong> {session.user?.email}</p>
        <p><strong>Role:</strong> {role}</p>
      </div>

      {/* 👇 NEW: Profile link — visible to every logged-in user */}
      <Link
        href="/profile"
        className="block bg-blue-600 text-white p-3 rounded mb-3 hover:bg-blue-700"
      >
        My Profile →
      </Link>

      {role === "ADMIN" && (
        <Link
          href="/admin"
          className="block bg-purple-600 text-white p-3 rounded mb-3 hover:bg-purple-700"
        >
          Admin area →
        </Link>
      )}

      {(role === "ADMIN" || role === "RESPONSIBLE") && (
        <Link
          href="/responsible"
          className="block bg-green-600 text-white p-3 rounded mb-3 hover:bg-green-700"
        >
          Responsible area →
        </Link>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
        <strong>Coming soon:</strong> reports, comments, assignments, and stats.
      </div>
    </div>
  );
}