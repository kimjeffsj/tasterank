"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { TripForm, type TripFormData } from "@/components/trip/TripForm";
import { useTrips } from "@/hooks/useTrips";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

type Trip = Tables<"trips">;

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();
  const { updateTrip, deleteTrip } = useTrips();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("trips")
        .select("*")
        .eq("id", params.tripId)
        .single();
      setTrip(data);
      setLoading(false);
    };
    fetchTrip();
  }, [params.tripId]);

  const handleSubmit = async (data: TripFormData) => {
    await updateTrip(params.tripId, {
      name: data.name,
      description: data.description || null,
      is_public: data.is_public,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    });
    router.push(`/trips/${params.tripId}`);
  };

  const handleDelete = async () => {
    await deleteTrip(params.tripId);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-md min-h-screen flex items-center justify-center">
        <span className="material-icons-round text-4xl text-gray-300 animate-spin">
          refresh
        </span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto w-full max-w-md min-h-screen flex flex-col items-center justify-center gap-3">
        <span className="material-icons-round text-5xl text-gray-300">
          error_outline
        </span>
        <p className="text-gray-500 font-medium">Trip not found</p>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold">Edit Trip</h1>
        </div>
      </header>

      {/* Form */}
      <div className="px-6 py-6">
        <TripForm
          trip={trip}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel="Save Changes"
        />

        {/* Delete Section */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
          {showDeleteConfirm ? (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">
                Are you sure? This will permanently delete the trip and all its
                entries, ratings, and photos.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-full font-bold text-gray-500 bg-white dark:bg-surface-dark"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-full font-bold text-white bg-red-500 active:scale-[0.97] transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-medium"
            >
              <span className="material-icons-round text-xl">delete</span>
              Delete Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
