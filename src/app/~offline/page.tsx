export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="material-icons-round text-6xl text-[var(--color-text-tertiary)]">
        wifi_off
      </span>
      <h1 className="mt-4 text-xl font-bold text-[var(--color-text-primary)]">
        You&apos;re offline
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Check your internet connection and try again.
      </p>
    </div>
  );
}
