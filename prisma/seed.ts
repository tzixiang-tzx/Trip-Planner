import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { splitEvenly } from "../src/lib/money";

try {
  process.loadEnvFile(new URL("../.env", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
} catch {
  // fall back to whatever is already in the environment
}

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const db = new PrismaClient({ adapter });

const INVITE_CODE = "KYOTO26";
const PASSWORD = "wanderlist";

/** Trip runs from a few days out, so the countdown and "today" states are visible. */
function dayFromToday(offset: number): Date {
  const now = new Date();
  const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return new Date(base + offset * 86_400_000);
}

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function main() {
  console.log("Seeding Wanderlist…");

  // A clean slate every time the seed runs.
  await db.mediaItem.deleteMany();
  await db.expenseShare.deleteMany();
  await db.expense.deleteMany();
  await db.comment.deleteMany();
  await db.announcement.deleteMany();
  await db.itineraryItem.deleteMany();
  await db.membership.deleteMany();
  await db.trip.deleteMany();
  await db.user.deleteMany();

  const start = dayFromToday(-1);
  const end = dayFromToday(5);

  const trip = await db.trip.create({
    data: {
      name: "Kyoto, slowly",
      destination: "Kyoto, Japan",
      blurb: "Seven days, no rushing.",
      startDate: start,
      endDate: end,
      currency: "SGD",
      inviteCode: INVITE_CODE,
    },
  });

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const people = [
    { name: "Mei Tan", email: "mei@example.com", accent: "sage", role: "organiser" },
    { name: "Arjun Rao", email: "arjun@example.com", accent: "clay", role: "traveller" },
    { name: "Sofia Reyes", email: "sofia@example.com", accent: "sun", role: "traveller" },
    { name: "Daniel Koh", email: "daniel@example.com", accent: "sea", role: "traveller" },
  ];

  const users = [];
  for (const person of people) {
    users.push(
      await db.user.create({
        data: {
          name: person.name,
          email: person.email,
          passwordHash,
          accent: person.accent,
          memberships: { create: { tripId: trip.id, role: person.role } },
        },
      }),
    );
  }

  const [mei, arjun, sofia, daniel] = users;

  await db.itineraryItem.createMany({
    data: [
      {
        tripId: trip.id, createdById: mei.id, day: dayFromToday(-1), startTime: "07:40", endTime: "15:20",
        title: "Flight SQ618 to Osaka", location: "Changi T3 → Kansai", category: "travel",
        notes: "Meet at the check-in counter by 05:30. Arjun has the pocket wifi.",
      },
      {
        tripId: trip.id, createdById: mei.id, day: dayFromToday(-1), startTime: "18:00",
        title: "Check in at Nishiki machiya", location: "Nakagyo Ward", category: "stay",
        notes: "Lockbox code is in the pinned announcement.",
      },
      {
        tripId: trip.id, createdById: sofia.id, day: dayFromToday(0), startTime: "09:00", endTime: "11:30",
        title: "Fushimi Inari before the crowds", location: "Fushimi Inari Taisha", category: "explore",
        notes: "Earlier is genuinely better. Bring water for the climb.",
      },
      {
        tripId: trip.id, createdById: arjun.id, day: dayFromToday(0), startTime: "13:00",
        title: "Lunch at Nishiki Market", location: "Nishiki Market", category: "food",
      },
      {
        tripId: trip.id, createdById: daniel.id, day: dayFromToday(0), startTime: "19:30",
        title: "Izakaya night in Pontocho", location: "Pontocho Alley", category: "food",
        notes: "Booked for four under Daniel.",
      },
      {
        tripId: trip.id, createdById: sofia.id, day: dayFromToday(1), startTime: "08:30", endTime: "12:00",
        title: "Arashiyama bamboo grove", location: "Arashiyama", category: "explore",
      },
      {
        tripId: trip.id, createdById: mei.id, day: dayFromToday(2), startTime: "10:00",
        title: "Day trip to Nara", location: "Nara Park", category: "travel",
        notes: "Deer crackers, but do not let them corner you.",
      },
      {
        tripId: trip.id, createdById: arjun.id, day: dayFromToday(3), startTime: "11:00",
        title: "Tea ceremony", location: "Camellia Garden", category: "explore",
      },
      {
        tripId: trip.id, createdById: mei.id, day: dayFromToday(5), startTime: "12:15",
        title: "Flight home", location: "Kansai → Changi", category: "travel",
      },
    ],
  });

  const pinned = await db.announcement.create({
    data: {
      tripId: trip.id, authorId: mei.id, pinned: true,
      title: "House rules and the lockbox code",
      body: "Machiya lockbox is 4417. Shoes off at the step, not in the hallway.\n\nRubbish goes out Tuesday night — burnables in the yellow bag.\n\nIf you get in late, the side gate sticks. Lift it while you turn.",
    },
  });

  await db.comment.createMany({
    data: [
      { announcementId: pinned.id, authorId: arjun.id, body: "Saved a screenshot, thanks Mei." },
      { announcementId: pinned.id, authorId: daniel.id, body: "Landing at 21:00 so I will be the late one." },
    ],
  });

  await db.announcement.create({
    data: {
      tripId: trip.id, authorId: sofia.id,
      title: "Bring cash",
      body: "Half the places we want to eat are cash only. Pull out ¥20,000 at the airport 7-Eleven — the rate is better than the exchange counters.",
    },
  });

  await db.announcement.create({
    data: {
      tripId: trip.id, authorId: daniel.id,
      title: "Rain on Thursday",
      body: "Forecast says most of the afternoon. Pack the light jacket, and we can swap Arashiyama for the museum if it holds.",
    },
  });

  const costs = [
    { description: "Machiya, 6 nights", amountCents: 184000, category: "stay", paidById: mei.id, offset: -1, participants: users.map((u) => u.id), notes: "" },
    { description: "Airport train, all four", amountCents: 12800, category: "travel", paidById: arjun.id, offset: -1, participants: users.map((u) => u.id), notes: "" },
    { description: "Izakaya in Pontocho", amountCents: 21640, category: "food", paidById: daniel.id, offset: 0, participants: users.map((u) => u.id), notes: "Cash, split evenly" },
    { description: "Nishiki Market lunch", amountCents: 8300, category: "food", paidById: sofia.id, offset: 0, participants: [sofia.id, arjun.id, daniel.id], notes: "Mei had eaten already" },
    { description: "Pocket wifi rental", amountCents: 6400, category: "general", paidById: arjun.id, offset: -1, participants: users.map((u) => u.id), notes: "" },
    { description: "Tea ceremony booking", amountCents: 16000, category: "fun", paidById: mei.id, offset: 3, participants: users.map((u) => u.id), notes: "Prepaid deposit" },
  ];

  for (const cost of costs) {
    const amounts = splitEvenly(cost.amountCents, cost.participants.length);
    await db.expense.create({
      data: {
        tripId: trip.id,
        description: cost.description,
        amountCents: cost.amountCents,
        category: cost.category,
        paidById: cost.paidById,
        notes: cost.notes,
        spentOn: new Date(`${isoDay(dayFromToday(cost.offset))}T12:00:00.000Z`),
        shares: { create: cost.participants.map((userId, i) => ({ userId, shareCents: amounts[i] })) },
      },
    });
  }

  console.log("\nSeeded and ready.\n");
  console.log(`  Trip         ${trip.name} (${trip.destination})`);
  console.log(`  Invite code  ${INVITE_CODE}`);
  console.log("  Sign in with any of these — password is 'wanderlist':");
  for (const person of people) console.log(`    ${person.email.padEnd(22)} ${person.name}`);
  console.log("\nThe gallery starts empty so you can upload your own photos and videos.\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
