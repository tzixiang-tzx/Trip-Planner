"use server";

import { revalidatePath } from "next/cache";
import { requireTrip } from "@/lib/session";
import { removeUpload, saveUploads } from "@/lib/media-store";

export type UploadState = { error?: string; uploaded?: number } | undefined;

export async function uploadMedia(_prev: UploadState, formData: FormData): Promise<UploadState> {
  const { trip, user } = await requireTrip();

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Pick at least one photo or video." };

  const caption = typeof formData.get("caption") === "string" ? (formData.get("caption") as string).trim() : "";

  const { uploaded, skipped } = await saveUploads(trip.id, user.id, files, caption);

  revalidatePath("/gallery");

  if (uploaded === 0) return { error: `Nothing uploaded — ${skipped.join(", ")}` };
  if (skipped.length > 0) return { uploaded, error: `Skipped ${skipped.join(", ")}` };
  return { uploaded };
}

export async function deleteMedia(formData: FormData) {
  const { trip, user } = await requireTrip();
  const id = typeof formData.get("id") === "string" ? (formData.get("id") as string) : "";
  if (!id) return;

  await removeUpload(id, trip.id, user.id);
  revalidatePath("/gallery");
}
