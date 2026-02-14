"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/search", icon: "search", label: "Search" },
  { href: "/trips/new", icon: "add", label: null }, // center button
  { href: "/saved", icon: "bookmark", label: "Saved" },
  { href: "/profile", icon: "person", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on trip-specific pages (they have their own navigation/FAB)
  if (pathname.startsWith("/trips/")) return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-20">
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-100 dark:border-gray-700 px-6 py-3 flex items-center gap-8 max-w-sm w-full justify-between">
        {navItems.map((item) => {
          // Center add button — special styling
          if (item.label === null) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="Add"
                className="-mt-8"
              >
                <div className="bg-primary shadow-lg shadow-primary/40 text-white w-14 h-14 rounded-full flex items-center justify-center transform transition active:scale-95">
                  <span className="material-icons-round text-2xl">
                    {item.icon}
                  </span>
                </div>
              </Link>
            );
          }

          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                active
                  ? "text-primary"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              <span className="material-icons-round">{item.icon}</span>
              <span
                className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
