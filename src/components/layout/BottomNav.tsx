"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoginPrompt } from "@/components/auth/LoginPrompt";
import { createClient } from "@/lib/supabase/client";

/** Extract tripId from paths like /trips/[tripId] or /trips/[tripId]/ranking */
function getTripIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/trips\/([^/]+)(\/ranking)?$/);
  return match ? match[1] : null;
}

/** Hide nav on full-screen flows (create, edit, entry forms, tournament) */
function shouldHideNav(pathname: string): boolean {
  if (pathname === "/trips/new") return true;
  if (pathname.match(/^\/trips\/[^/]+\/edit$/)) return true;
  if (pathname.match(/^\/trips\/[^/]+\/entries\//)) return true;
  if (pathname.match(/^\/trips\/[^/]+\/tournament$/)) return true;
  return false;
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showMemberPopover, setShowMemberPopover] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const centerButtonRef = useRef<HTMLButtonElement>(null);

  // Compute tripId here so it's available in useEffect below
  const tripId = getTripIdFromPath(pathname);

  // BottomNav renders outside TripMembershipProvider scope, so query membership directly
  useEffect(() => {
    if (!tripId || !user) {
      setIsMember(false);
      setMembershipLoading(false);
      return;
    }

    setMembershipLoading(true);
    const supabase = createClient();
    supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", tripId)
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setIsMember(!!data);
        setMembershipLoading(false);
      });
  }, [tripId, user?.id]);

  // Close popover when clicking outside
  useEffect(() => {
    if (!showMemberPopover) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        centerButtonRef.current &&
        !centerButtonRef.current.contains(e.target as Node)
      ) {
        setShowMemberPopover(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [showMemberPopover]);

  if (shouldHideNav(pathname)) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleCenterClick = () => {
    if (tripId) {
      if (isMember) {
        // Member: navigate to add photos
        router.push(`/trips/${tripId}/entries/new`);
      } else if (user) {
        // Logged in but not a member: show popover
        setShowMemberPopover(true);
      } else {
        // Not logged in: show login prompt
        setShowLogin(true);
      }
    } else {
      // Not on a trip page: add new trip
      if (!user) {
        setShowLogin(true);
        return;
      }
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
              // On trip pages: disabled until membership is confirmed
              // (loading, not logged in, or logged in but not a member)
              const isDisabled =
                !!tripId &&
                (authLoading || membershipLoading || !user || !isMember);

              return (
                <button
                  key="center"
                  ref={centerButtonRef}
                  onClick={handleCenterClick}
                  aria-label={tripId ? "Add Photos" : "Add Trip"}
                  className="-mt-8 relative"
                >
                  {/* Member-only popover */}
                  {showMemberPopover && (
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white rounded-xl shadow-lg px-4 py-2 text-sm text-gray-700 whitespace-nowrap z-30"
                      role="tooltip"
                    >
                      You must be a member to add photos.
                      {/* Downward arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
                    </div>
                  )}

                  <div
                    className={`bg-primary shadow-lg shadow-primary/40 text-white w-14 h-14 rounded-full flex items-center justify-center transform transition active:scale-95 ${
                      isDisabled ? "opacity-40" : ""
                    }`}
                  >
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
            const { href, icon, label } = item as {
              href: string;
              icon: string;
              label: string;
            };
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                prefetch={false}
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
