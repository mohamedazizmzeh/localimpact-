import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="max-w-md mx-auto mt-16 p-6 text-center">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Access denied</h1>
      <p className="mb-6 text-gray-700">
        You don&apos;t have permission to view this page.
      </p>
      <Link
        href="/dashboard"
        className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}