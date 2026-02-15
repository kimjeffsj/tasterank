import { Skeleton } from "@/components/layout/Skeleton";

export default function RankingLoading() {
  return (
    <div className="mx-auto w-full max-w-md min-h-screen">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </div>
        {/* Tag filter skeleton */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* 1st place skeleton */}
        <Skeleton className="aspect-[4/5] rounded-3xl" />

        {/* 2nd/3rd place skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>

        {/* Runner-ups skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
