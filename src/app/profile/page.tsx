import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="max-w-xl mx-auto mt-16 p-6">
      <Link
        href="/dashboard"
        className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 mb-6"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <ProfileForm
        initialName={session.user.name ?? ""}
        initialEmail={session.user.email ?? ""}
        role={session.user.role}
      />
    </div>
  );
}