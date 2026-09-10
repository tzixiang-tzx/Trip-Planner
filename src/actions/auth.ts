"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const ACCENTS = ["sage", "clay", "sun", "sea"] as const;

function clean(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = clean(formData.get("email")).toLowerCase();
  const password = clean(formData.get("password"));

  if (!email || !password) return { error: "Enter your email and password." };

  const user = await db.user.findUnique({ where: { email } });
  // Compare regardless of whether the user exists so timing doesn't leak accounts.
  const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
  const ok = await bcrypt.compare(password, hash);

  if (!user || !ok) return { error: "That email and password don't match." };

  await createSession(user.id);
  redirect("/itinerary");
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = clean(formData.get("name"));
  const email = clean(formData.get("email")).toLowerCase();
  const password = clean(formData.get("password"));
  const inviteCode = clean(formData.get("inviteCode")).toUpperCase();

  if (!name || !email || !password) return { error: "Name, email and password are all needed." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "That email doesn't look right." };
  if (password.length < 8) return { error: "Use at least 8 characters for your password." };

  // An invite code is optional: without one you land on the start page and
  // either enter a code there or create the trip yourself.
  const trip = inviteCode ? await db.trip.findUnique({ where: { inviteCode } }) : null;
  if (inviteCode && !trip) return { error: "That invite code doesn't match any trip." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists — try signing in." };

  const memberCount = trip ? await db.membership.count({ where: { tripId: trip.id } }) : 0;
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      accent: ACCENTS[memberCount % ACCENTS.length],
      ...(trip ? { memberships: { create: { tripId: trip.id, role: "traveller" } } } : {}),
    },
  });

  await createSession(user.id);
  redirect(trip ? "/itinerary" : "/start");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function joinTrip(_prev: FormState, formData: FormData): Promise<FormState> {
  const { requireUser } = await import("@/lib/session");
  const user = await requireUser();
  const inviteCode = clean(formData.get("inviteCode")).toUpperCase();

  const trip = await db.trip.findUnique({ where: { inviteCode } });
  if (!trip) return { error: "That invite code doesn't match any trip." };

  await db.membership.upsert({
    where: { userId_tripId: { userId: user.id, tripId: trip.id } },
    create: { userId: user.id, tripId: trip.id },
    update: {},
  });

  redirect("/itinerary");
}
