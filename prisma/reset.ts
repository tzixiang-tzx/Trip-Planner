import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { readdir, unlink } from "node:fs/promises";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // fall back to whatever is already in the environment
}

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const db = new PrismaClient({ adapter });

/** Empties the database and the uploads folder, leaving a blank app to fill in. */
async function main() {
  await db.mediaItem.deleteMany();
  await db.expenseShare.deleteMany();
  await db.expense.deleteMany();
  await db.comment.deleteMany();
  await db.announcement.deleteMany();
  await db.itineraryItem.deleteMany();
  await db.membership.deleteMany();
  await db.trip.deleteMany();
  await db.user.deleteMany();

  const dir = path.join(process.cwd(), "uploads");
  for (const file of await readdir(dir)) {
    if (file !== ".gitkeep") await unlink(path.join(dir, file)).catch(() => {});
  }

  console.log("\nCleared. Nothing left in the database and no uploaded files.\n");
  console.log("Start the app, register an account, and pick \"I'm starting the trip\".\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
