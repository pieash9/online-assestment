import { PrismaMariaDb } from "@prisma/adapter-mariadb";

export function createMySqlAdapter(databaseUrlValue: string) {
  const databaseUrl = new URL(databaseUrlValue);

  if (databaseUrl.protocol !== "mysql:") {
    throw new Error("DATABASE_URL must use the mysql:// protocol");
  }

  const database = databaseUrl.pathname.replace(/^\/+/, "");

  if (!database) {
    throw new Error("DATABASE_URL must include a database name");
  }

  return new PrismaMariaDb({
    host: databaseUrl.hostname,
    port: databaseUrl.port ? Number(databaseUrl.port) : 3306,
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database,
    connectionLimit: 5
  });
}
