import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";
import { createMySqlAdapter } from "./prisma-adapter";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter: createMySqlAdapter(env.DATABASE_URL, {
      connectionLimit: env.DB_POOL_LIMIT,
      connectTimeout: env.DB_CONNECT_TIMEOUT_MS,
      acquireTimeout: env.DB_ACQUIRE_TIMEOUT_MS,
    }),
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
