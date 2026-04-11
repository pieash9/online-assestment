import { PrismaMariaDb } from "@prisma/adapter-mariadb";

type AdapterConfig = {
  connectionLimit: number;
  connectTimeout: number;
  acquireTimeout: number;
};

const DEFAULT_ADAPTER_CONFIG: AdapterConfig = {
  connectionLimit: 10,
  connectTimeout: 10_000,
  acquireTimeout: 10_000,
};

export function createMySqlAdapter(
  databaseUrlValue: string,
  adapterConfig: AdapterConfig = DEFAULT_ADAPTER_CONFIG,
) {
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
    connectionLimit: adapterConfig.connectionLimit,
    connectTimeout: adapterConfig.connectTimeout,
    acquireTimeout: adapterConfig.acquireTimeout,
  });
}
