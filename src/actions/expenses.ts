"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireTrip } from "@/lib/session";
import { splitEvenly, toMinorUnits } from "@/lib/money";

const CATEGORIES = ["food", "stay", "travel", "fun", "general"];

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function createExpense(formData: FormData) {
  const { trip, user } = await requireTrip();

  const description = str(formData, "description");
  const amountCents = toMinorUnits(str(formData, "amount"), trip.currency);
  if (!description || amountCents <= 0) return;

  const memberIds = (
    await db.membership.findMany({ where: { tripId: trip.id }, select: { userId: true } })
  ).map((m) => m.userId);

  // Only ever split between people who are actually on this trip.
  const requested = formData.getAll("participants").filter((v): v is string => typeof v === "string");
  const participants = requested.filter((id) => memberIds.includes(id));
  const splitBetween = participants.length > 0 ? participants : memberIds;
  if (splitBetween.length === 0) return;

  const paidByRaw = str(formData, "paidById");
  const paidById = memberIds.includes(paidByRaw) ? paidByRaw : user.id;

  const category = str(formData, "category");
  const spentOnRaw = str(formData, "spentOn");
  const spentOn = /^\d{4}-\d{2}-\d{2}$/.test(spentOnRaw) ? new Date(`${spentOnRaw}T12:00:00.000Z`) : new Date();

  const amounts = splitEvenly(amountCents, splitBetween.length);

  await db.expense.create({
    data: {
      tripId: trip.id,
      description,
      amountCents,
      paidById,
      spentOn,
      notes: str(formData, "notes"),
      category: CATEGORIES.includes(category) ? category : "general",
      shares: {
        create: splitBetween.map((userId, i) => ({ userId, shareCents: amounts[i] })),
      },
    },
  });

  revalidatePath("/expenses");
}

export async function updateExpense(formData: FormData) {
  const { trip, user } = await requireTrip();

  const id = str(formData, "id");
  const description = str(formData, "description");
  const amountCents = toMinorUnits(str(formData, "amount"), trip.currency);
  if (!id || !description || amountCents <= 0) return;

  const existing = await db.expense.findFirst({ where: { id, tripId: trip.id } });
  if (!existing) return;

  const memberIds = (
    await db.membership.findMany({ where: { tripId: trip.id }, select: { userId: true } })
  ).map((m) => m.userId);

  const requested = formData.getAll("participants").filter((v): v is string => typeof v === "string");
  const participants = requested.filter((id) => memberIds.includes(id));
  const splitBetween = participants.length > 0 ? participants : memberIds;
  if (splitBetween.length === 0) return;

  const paidByRaw = str(formData, "paidById");
  const paidById = memberIds.includes(paidByRaw) ? paidByRaw : user.id;

  const category = str(formData, "category");
  const spentOnRaw = str(formData, "spentOn");
  const spentOn = /^\d{4}-\d{2}-\d{2}$/.test(spentOnRaw) ? new Date(`${spentOnRaw}T12:00:00.000Z`) : new Date();

  const amounts = splitEvenly(amountCents, splitBetween.length);

  await db.expense.update({
    where: { id },
    data: {
      description,
      amountCents,
      paidById,
      spentOn,
      notes: str(formData, "notes"),
      category: CATEGORIES.includes(category) ? category : "general",
      shares: {
        deleteMany: {},
        create: splitBetween.map((userId, i) => ({ userId, shareCents: amounts[i] })),
      },
    },
  });

  revalidatePath("/expenses");
}

export async function deleteExpense(formData: FormData) {
  const { trip } = await requireTrip();
  const id = str(formData, "id");
  if (!id) return;

  await db.expense.deleteMany({ where: { id, tripId: trip.id } });
  revalidatePath("/expenses");
}
