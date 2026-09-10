"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser, requireTrip } from "@/lib/session";
import { parseTripInput } from "@/lib/trip-input";

export type TripFormState = { error?: string } | undefined;

export async function createTrip(_prev: TripFormState, formData: FormData): Promise<TripFormState> {
  const user = await requireUser();

  const parsed = await parseTripInput(formData);
  if (!parsed.ok) return { error: parsed.error };

  await db.trip.create({
    data: {
      ...parsed.data,
      members: { create: { userId: user.id, role: "organiser" } },
    },
  });

  redirect("/itinerary");
}

export async function updateTrip(_prev: TripFormState, formData: FormData): Promise<TripFormState> {
  const { trip } = await requireTrip();

  const parsed = await parseTripInput(formData, trip.id);
  if (!parsed.ok) return { error: parsed.error };

  await db.trip.update({ where: { id: trip.id }, data: parsed.data });

  revalidatePath("/", "layout");
  redirect("/trip");
}

/**
 * Clears the sample content but keeps the trip, its members and the gallery —
 * for when you want the shell of the app with none of the demo data in it.
 */
export async function clearTripContent() {
  const { trip } = await requireTrip();

  await db.expense.deleteMany({ where: { tripId: trip.id } });
  await db.announcement.deleteMany({ where: { tripId: trip.id } });
  await db.itineraryItem.deleteMany({ where: { tripId: trip.id } });

  revalidatePath("/", "layout");
  redirect("/itinerary");
}
