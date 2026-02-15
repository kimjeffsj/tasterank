import Link from "next/link";

export default function SearchPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-24">
      <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600 mb-4">
        search
      </span>
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
        Search
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Coming Soon</p>
      <Link
        href="/"
        className="text-primary font-semibold text-sm hover:underline"
      >
        Back to Home
      </Link>
    </main>
  );
}
