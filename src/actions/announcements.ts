"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTrip } from "@/lib/session";

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function createAnnouncement(formData: FormData) {
  const { trip, user } = await requireTrip();

  const title = str(formData, "title");
  const body = str(formData, "body");
  if (!title || !body) return;

  await db.announcement.create({
    data: {
      tripId: trip.id,
      authorId: user.id,
      title,
      body,
      pinned: formData.get("pinned") === "on",
    },
  });

  revalidatePath("/announcements");
}

export async function togglePin(formData: FormData) {
  const { trip } = await requireTrip();
  const id = str(formData, "id");
  if (!id) return;

  const announcement = await db.announcement.findFirst({ where: { id, tripId: trip.id } });
  if (!announcement) return;

  await db.announcement.update({ where: { id }, data: { pinned: !announcement.pinned } });
  revalidatePath("/announcements");
}

export async function deleteAnnouncement(formData: FormData) {
  const { trip, user } = await requireTrip();
  const id = str(formData, "id");
  if (!id) return;

  // only the author may remove their own post
  await db.announcement.deleteMany({ where: { id, tripId: trip.id, authorId: user.id } });
  revalidatePath("/announcements");
}

export async function addComment(formData: FormData) {
  const { trip, user } = await requireTrip();

  const announcementId = str(formData, "announcementId");
  const body = str(formData, "body");
  if (!announcementId || !body) return;

  const announcement = await db.announcement.findFirst({
    where: { id: announcementId, tripId: trip.id },
    select: { id: true },
  });
  if (!announcement) return;

  await db.comment.create({ data: { announcementId, authorId: user.id, body } });
  revalidatePath("/announcements");
}

export async function deleteComment(formData: FormData) {
  const { user } = await requireTrip();
  const id = str(formData, "id");
  if (!id) return;

  await db.comment.deleteMany({ where: { id, authorId: user.id } });
  revalidatePath("/announcements");
}
