"use client";

import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function ProfileContent() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { profile, stats, loading: profileLoading } = useProfile(user?.id);

  const loading = authLoading || profileLoading;

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-md min-h-screen pb-24">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 pt-12 pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight">Profile</h1>
        </header>

        <div className="px-6 space-y-6">
          {/* User Info Skeleton */}
          <div className="glass-card rounded-[2.5rem] p-6 h-64 animate-pulse">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 bg-gray-200 dark:bg-gray-700 rounded-full mb-4" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card rounded-3xl p-5 h-32 animate-pulse"
              >
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-24">
        <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600 mb-4">
          person
        </span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
          Sign in to see your profile
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
          View your trips, entries, and ratings
        </p>
        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 rounded-2xl font-semibold text-sm shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all active:scale-95"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332A8.997 8.997 0 009.003 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0A8.997 8.997 0 00.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
      </main>
    );
  }

  // Authenticated state
  const displayName = profile?.display_name || user.email || "User";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="mx-auto w-full max-w-md min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 pt-12 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Profile</h1>
      </header>

      <div className="px-6 space-y-6">
        {/* User Info Card */}
        <section className="glass-card rounded-[2.5rem] p-6">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-primary to-primary-light">
                {profile?.avatar_url ? (
                  <img
                    alt="User Avatar"
                    src={profile.avatar_url}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-900"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-900">
                    <span className="material-icons-round text-5xl text-gray-400 dark:text-gray-500">
                      person
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Display Name */}
            <h2 className="text-2xl font-bold">{displayName}</h2>

            {/* Username */}
            {profile?.username && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                @{profile.username}
              </p>
            )}

            {/* Member Since */}
            {memberSince && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Member since {memberSince}
              </p>
            )}
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-3 gap-4">
          {/* Trips */}
          <div className="glass-card rounded-3xl p-5 flex flex-col justify-between h-32">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-primary">
              <span className="material-icons-round">flight_takeoff</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold">
                {stats?.tripCount ?? 0}
              </p>
              <p className="text-xs font-medium text-gray-500">Trips</p>
            </div>
          </div>

          {/* Entries */}
          <div className="glass-card rounded-3xl p-5 flex flex-col justify-between h-32">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
              <span className="material-icons-round">restaurant</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold">
                {stats?.entryCount ?? 0}
              </p>
              <p className="text-xs font-medium text-gray-500">Entries</p>
            </div>
          </div>

          {/* Ratings */}
          <div className="glass-card rounded-3xl p-5 flex flex-col justify-between h-32">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
              <span className="material-icons-round">star</span>
            </div>
            <div>
              <p className="text-2xl font-extrabold">
                {stats?.ratingCount ?? 0}
              </p>
              <p className="text-xs font-medium text-gray-500">Ratings</p>
            </div>
          </div>
        </section>

        {/* Settings Card */}
        <section className="glass-card rounded-3xl overflow-hidden">
          {/* Appearance */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="material-icons-round text-gray-600 dark:text-gray-400">
                palette
              </span>
              <span className="font-semibold">Appearance</span>
            </div>
            <ThemeToggle />
          </div>

          {/* Log Out */}
          <button
            onClick={signOut}
            className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5 active:bg-gray-100 dark:active:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="material-icons-round text-error">logout</span>
              <span className="font-semibold text-error">Log Out</span>
            </div>
          </button>
        </section>
      </div>
    </div>
  );
}
