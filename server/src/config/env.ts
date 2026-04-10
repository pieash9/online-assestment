import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  DB_POOL_LIMIT: z.coerce.number().int().positive().default(1),
  DB_CONNECT_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  DB_ACQUIRE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment configuration", parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsedEnv.data;
