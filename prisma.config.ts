import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

const appEnv = process.env.APP_ENV ?? "dev";

// Mirror env.ts loading: .env.{APP_ENV} first, .env fills gaps
const envFile = path.resolve(`.env.${appEnv}`);
if (existsSync(envFile)) {
  dotenv.config({ path: envFile, override: false });
}
dotenv.config({ override: false });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
