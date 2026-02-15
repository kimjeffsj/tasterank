export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <span className="material-icons-round text-4xl text-primary animate-spin">
          refresh
        </span>
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
