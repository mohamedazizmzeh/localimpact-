import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="max-w-md mx-auto mt-16 p-6 text-center">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Access denied</h1>
      <p className="mb-6">
        You don&apos;t have permission to view this page.
      </p>
      <Link href="/dashboard" className="text-blue-600">
        Back to dashboard
      </Link>
    </div>
  );
}