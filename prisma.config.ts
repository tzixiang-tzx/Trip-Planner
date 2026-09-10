import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Next.js loads .env on its own; the Prisma CLI needs it loaded explicitly.
try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  // .env is optional when DATABASE_URL is already in the environment
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
