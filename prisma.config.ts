import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource:
    tursoUrl && !tursoUrl.startsWith("file:")
      ? {
          adapter: async () => {
            const { PrismaLibSql } = await import(
              "@prisma/adapter-libsql"
            );
            return new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
          },
        }
      : {
          url:
            process.env["DATABASE_URL"] ??
            `file:${path.join(process.cwd(), "prisma/dev.db")}`,
        },
});
