import "server-only";
import { db } from "@/lib/db";

export type TripInput = {
  name: string;
  destination: string;
  blurb: string;
  currency: string;
  inviteCode: string;
  startDate: Date;
  endDate: Date;
};

export type ParsedTrip = { ok: false; error: string } | { ok: true; data: TripInput };

function clean(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseDay(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Validation shared by creating and editing a trip. `existingTripId` is passed
 * when editing, so a trip doesn't clash with its own invite code.
 */
export async function parseTripInput(formData: FormData, existingTripId?: string): Promise<ParsedTrip> {
  const name = clean(formData.get("name"));
  const destination = clean(formData.get("destination"));
  const blurb = clean(formData.get("blurb"));
  const currency = clean(formData.get("currency")).toUpperCase() || "SGD";
  const inviteCode = clean(formData.get("inviteCode")).toUpperCase();
  const startDate = parseDay(clean(formData.get("startDate")));
  const endDate = parseDay(clean(formData.get("endDate")));

  if (!name) return { ok: false, error: "Give the trip a name." };
  if (!destination) return { ok: false, error: "Where are you going?" };
  if (!startDate || !endDate) return { ok: false, error: "Pick both a start and an end date." };
  if (endDate < startDate) return { ok: false, error: "The trip can't end before it starts." };
  if (!/^[A-Z0-9]{4,12}$/.test(inviteCode)) {
    return { ok: false, error: "Invite code should be 4–12 letters or numbers, no spaces." };
  }

  const clash = await db.trip.findUnique({ where: { inviteCode }, select: { id: true } });
  if (clash && clash.id !== existingTripId) {
    return { ok: false, error: "That invite code is already taken — try another." };
  }

  return { ok: true, data: { name, destination, blurb, currency, inviteCode, startDate, endDate } };
}
