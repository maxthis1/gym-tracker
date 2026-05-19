import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  let adapter: PrismaLibSql;
  if (tursoUrl && !tursoUrl.startsWith("file:")) {
    // Production: Turso cloud
    adapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
  } else {
    // Development: local SQLite file
    const dbPath = path.join(process.cwd(), "dev.db");
    adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
