import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

const appEnvSchema = z.enum(["dev", "test", "prod"]);
const nodeEnvSchema = z.enum(["development", "test", "production"]);

const appEnvToNodeEnv: Record<z.infer<typeof appEnvSchema>, z.infer<typeof nodeEnvSchema>> = {
  dev: "development",
  test: "test",
  prod: "production",
};

const appEnv = appEnvSchema.parse(process.env.APP_ENV ?? "dev");

// .env.{APP_ENV} takes priority; .env fills remaining gaps
// Platform / cross-env values always win (override: false)
const envFile = path.resolve(`.env.${appEnv}`);
if (existsSync(envFile)) {
  dotenv.config({ path: envFile, override: false });
}
dotenv.config({ override: false });

if (!process.env.APP_ENV) {
  process.env.APP_ENV = appEnv;
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = appEnvToNodeEnv[appEnv];
}

const envSchema = z.object({
  APP_ENV: appEnvSchema.default("dev"),
  NODE_ENV: nodeEnvSchema.default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment variables: ${parsedEnv.error.message}`);
}

export const env = parsedEnv.data;
