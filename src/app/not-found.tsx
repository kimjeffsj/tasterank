import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600 mb-4">
          explore_off
        </span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Page not found
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="bg-primary text-white font-bold px-6 py-3 rounded-full shadow-glow active:scale-95 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
