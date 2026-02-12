"use client";

import { useRouter } from "next/navigation";
import { TripForm, type TripFormData } from "@/components/trip/TripForm";
import { useTrips } from "@/hooks/useTrips";

export default function NewTripPage() {
  const router = useRouter();
  const { createTrip } = useTrips();

  const handleSubmit = async (data: TripFormData) => {
    const trip = await createTrip({
      name: data.name,
      description: data.description || undefined,
      is_public: data.is_public,
      start_date: data.start_date || undefined,
      end_date: data.end_date || undefined,
    });
    router.push(`/trips/${trip.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-md min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-surface-dark"
          >
            <span className="material-icons-round">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold">New Trip</h1>
        </div>
      </header>

      {/* Form */}
      <div className="px-6 py-6">
        <TripForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel="Create Trip"
        />
      </div>
    </div>
  );
}
