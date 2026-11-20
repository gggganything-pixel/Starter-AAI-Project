import { PrismaClient } from "@prisma/client";

// One client for the whole app. Reused across hot reloads in development
// so we do not exhaust SQLite connections.
const globalForPrisma = globalThis as unknown as { db?: PrismaClient };

export const db = globalForPrisma.db ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.db = db;
