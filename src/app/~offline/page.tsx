export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600">
        wifi_off
      </span>
      <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
        You&apos;re offline
      </h1>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Check your internet connection and try again.
      </p>
    </div>
  );
}
