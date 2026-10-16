import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6">
      <main className="max-w-lg text-center">
        <h1 className="text-4xl font-bold mb-4 text-zinc-900">
          LocalImpact
        </h1>
        <p className="text-lg text-zinc-600 mb-8">
          Signalez et suivez les problèmes du quotidien dans votre campus,
          votre résidence ou votre quartier.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50"
          >
            Register
          </Link>
        </div>
      </main>
    </div>
  );
}