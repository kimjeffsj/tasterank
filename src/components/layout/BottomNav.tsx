"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginPrompt } from "@/components/auth/LoginPrompt";

/** Extract tripId from paths like /trips/[tripId] or /trips/[tripId]/ranking */
function getTripIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/trips\/([^/]+)(\/ranking)?$/);
  return match ? match[1] : null;
}

/** Hide nav on full-screen flows (create, edit, entry forms) */
function shouldHideNav(pathname: string): boolean {
  if (pathname === "/trips/new") return true;
  if (pathname.match(/^\/trips\/[^/]+\/edit$/)) return true;
  if (pathname.match(/^\/trips\/[^/]+\/entries\//)) return true;
  return false;
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (shouldHideNav(pathname)) return null;

  const tripId = getTripIdFromPath(pathname);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleCenterClick = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (tripId) {
      router.push(`/trips/${tripId}/entries/new`);
    } else {
      router.push("/trips/new");
    }
  };

  const handleProfileClick = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    router.push("/profile");
  };

  const navItems = [
    { href: "/", icon: "home", label: "HOME" },
    { href: "/explore", icon: "explore", label: "EXPLORE" },
    { type: "center" as const },
    { href: "/my-trips", icon: "luggage", label: "MY TRIPS" },
    { type: "profile" as const },
  ];

  return (
    <>
      <nav className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-20">
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-100 dark:border-gray-700 px-6 py-3 flex items-center gap-6 max-w-sm w-full justify-between">
          {navItems.map((item) => {
            // Center button — contextual auth-gated action
            if ("type" in item && item.type === "center") {
              return (
                <button
                  key="center"
                  onClick={handleCenterClick}
                  aria-label={tripId ? "Add Photos" : "Add Trip"}
                  className="-mt-8"
                >
                  <div className="bg-primary shadow-lg shadow-primary/40 text-white w-14 h-14 rounded-full flex items-center justify-center transform transition active:scale-95">
                    <span className="material-icons-round text-2xl">
                      photo_camera
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-primary mt-1 block text-center whitespace-nowrap">
                    {tripId ? "ADD PHOTOS" : "ADD TRIP"}
                  </span>
                </button>
              );
            }

            // Profile / Sign In — auth-aware
            if ("type" in item && item.type === "profile") {
              const active = isActive("/profile");
              return (
                <button
                  key="profile"
                  onClick={handleProfileClick}
                  className={`flex flex-col items-center gap-1 transition-colors ${
                    active
                      ? "text-primary"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  }`}
                >
                  <span className="material-icons-round">person</span>
                  <span
                    className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}
                  >
                    {user ? "PROFILE" : "SIGN IN"}
                  </span>
                </button>
              );
            }

            // Standard nav items
            const { href, icon, label } = item as { href: string; icon: string; label: string };
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
              >
                <span className="material-icons-round">{icon}</span>
                <span
                  className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <LoginPrompt open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
}
