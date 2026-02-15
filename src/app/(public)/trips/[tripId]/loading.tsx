import { Skeleton } from "@/components/layout/Skeleton";

export default function TripDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-md min-h-screen">
      {/* Hero skeleton */}
      <Skeleton className="h-[420px] rounded-none" />

      {/* Pill tabs skeleton */}
      <div className="px-6 py-3">
        <Skeleton className="h-11 rounded-full" />
      </div>

      {/* Section title */}
      <div className="px-6 py-6">
        <Skeleton className="h-6 w-32 mb-4" />

        {/* Entry grid skeleton */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-3xl overflow-hidden">
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
