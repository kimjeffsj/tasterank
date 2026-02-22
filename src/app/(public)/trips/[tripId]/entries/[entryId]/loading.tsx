export default function EntryDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-md min-h-screen animate-pulse">
      {/* Photo skeleton */}
      <div className="h-[400px] bg-gray-200 dark:bg-gray-800" />

      <div className="px-6 pt-6 pb-4">
        {/* Title skeleton */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1" />
          <div className="h-12 w-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>

        {/* Restaurant skeleton */}
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />

        {/* Tags skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Creator skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>

      {/* Reviews section skeleton */}
      <div className="px-6 py-4">
        <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 mb-3"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
