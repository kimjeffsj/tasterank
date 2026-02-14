"use client";

import { useParams, useRouter } from "next/navigation";
import { EntryForm, type EntryFormData } from "@/components/entry/EntryForm";
import { useEntries } from "@/hooks/useEntries";
import { useAuth } from "@/hooks/useAuth";
import { uploadEntryPhotos } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

export default function NewEntryPage() {
  const params = useParams<{ tripId: string }>();
  const router = useRouter();
  const { createEntry } = useEntries(params.tripId);
  const { user } = useAuth();

  const handleSubmit = async (data: EntryFormData) => {
    if (!user) throw new Error("You must be logged in");

    const entry = await createEntry({
      trip_id: params.tripId,
      created_by: user.id,
      title: data.title,
      restaurant_name: data.restaurant_name || null,
      location_name: data.location_name || null,
      description: data.description || null,
    });

    // Upload photos, save rating, and save tags in parallel
    const promises: Promise<unknown>[] = [];

    if (data.photos.length > 0) {
      promises.push(
        uploadEntryPhotos(data.photos, params.tripId, entry.id, user.id),
      );
    }

    const supabase = createClient();
    promises.push(
      (async () => {
        await supabase.from("ratings").insert({
          entry_id: entry.id,
          user_id: user.id,
          score: data.score,
        });
      })(),
    );

    // Save tags: upsert each tag then link to entry
    if (data.tags.length > 0) {
      promises.push(
        (async () => {
          for (const tag of data.tags) {
            const { data: upserted } = await supabase
              .from("tags")
              .upsert(
                { name: tag.name, category: tag.category ?? null },
                { onConflict: "name" },
              )
              .select()
              .single();

            if (upserted) {
              await supabase.from("food_entry_tags").insert({
                entry_id: entry.id,
                tag_id: upserted.id,
                is_ai_suggested: tag.isAiSuggested ?? false,
              });
            }
          }
        })(),
      );
    }

    await Promise.all(promises);

    router.push(`/trips/${params.tripId}`);
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
          <h1 className="text-xl font-bold dark:text-white">New Memory</h1>
        </div>
      </header>

      {/* Form */}
      <div className="px-6 py-6">
        <EntryForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}
