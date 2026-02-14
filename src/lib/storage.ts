import { createClient } from "@/lib/supabase/client";

const BUCKET = "food-photos";

/**
 * Upload a photo to Supabase Storage and return the public URL.
 * Path format: {tripId}/{entryId}/{timestamp}_{filename}
 */
export async function uploadEntryPhoto(
  file: File,
  tripId: string,
  entryId: string,
): Promise<string> {
  const supabase = createClient();
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${tripId}/${entryId}/${timestamp}_${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

/**
 * Upload multiple photos and save references to food_photos table.
 */
export async function uploadEntryPhotos(
  files: File[],
  tripId: string,
  entryId: string,
  uploadedBy: string,
): Promise<void> {
  if (files.length === 0) return;

  const supabase = createClient();

  const photoUrls = await Promise.all(
    files.map((file) => uploadEntryPhoto(file, tripId, entryId)),
  );

  const rows = photoUrls.map((url, index) => ({
    entry_id: entryId,
    photo_url: url,
    display_order: index,
    uploaded_by: uploadedBy,
  }));

  const { error } = await supabase.from("food_photos").insert(rows);
  if (error) throw error;
}
