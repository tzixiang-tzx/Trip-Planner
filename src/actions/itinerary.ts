"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTrip } from "@/lib/session";

const CATEGORIES = ["travel", "stay", "food", "explore", "note"];

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** "2026-09-12" -> a stable midnight-UTC bucket for that calendar day. */
function toDayBucket(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function addItineraryItem(formData: FormData) {
  const { trip, user } = await requireTrip();

  const title = str(formData, "title");
  const day = toDayBucket(str(formData, "day"));
  if (!title || !day) return;

  const category = str(formData, "category");

  await db.itineraryItem.create({
    data: {
      tripId: trip.id,
      createdById: user.id,
      title,
      day,
      startTime: str(formData, "startTime"),
      endTime: str(formData, "endTime"),
      location: str(formData, "location"),
      notes: str(formData, "notes"),
      category: CATEGORIES.includes(category) ? category : "explore",
    },
  });

  revalidatePath("/itinerary");
}

export async function updateItineraryItem(formData: FormData) {
  const { trip } = await requireTrip();

  const id = str(formData, "id");
  const title = str(formData, "title");
  const day = toDayBucket(str(formData, "day"));
  if (!id || !title || !day) return;

  const category = str(formData, "category");

  // scoped by tripId so nobody can edit another trip's plans
  await db.itineraryItem.updateMany({
    where: { id, tripId: trip.id },
    data: {
      title,
      day,
      startTime: str(formData, "startTime"),
      endTime: str(formData, "endTime"),
      location: str(formData, "location"),
      notes: str(formData, "notes"),
      category: CATEGORIES.includes(category) ? category : "explore",
    },
  });

  revalidatePath("/itinerary");
}

export async function deleteItineraryItem(formData: FormData) {
  const { trip } = await requireTrip();
  const id = str(formData, "id");
  if (!id) return;

  await db.itineraryItem.deleteMany({ where: { id, tripId: trip.id } });
  revalidatePath("/itinerary");
}
