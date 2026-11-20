// The session is ONE signed httpOnly cookie (design §2 rule 5): a base64url
// JSON payload plus an HMAC-SHA256 signature, checked with timingSafeEqual.
// The signing secret lives in .env (never committed).
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "hrms_session";
// Session lifetime in seconds, from .env (Task 6); default 8 hours.
const DEFAULT_MAX_AGE_SECONDS = 8 * 60 * 60;
const configuredMaxAge = Number(process.env.SESSION_MAX_AGE_SECONDS);
const MAX_AGE_SECONDS =
  Number.isFinite(configuredMaxAge) && configuredMaxAge > 0
    ? configuredMaxAge
    : DEFAULT_MAX_AGE_SECONDS;

export type Session = { userId: number; role: string; exp: number };

export const HOME: Record<string, string> = {
  Employee: "/employee",
  Supervisor: "/supervisor",
  HR: "/hr",
  Admin: "/admin",
};

function sign(payload: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set in .env");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function createSession(userId: number, role: string) {
  const payload = Buffer.from(
    JSON.stringify({ userId, role, exp: Date.now() + MAX_AGE_SECONDS * 1000 }),
  ).toString("base64url");
  const store = await cookies();
  store.set(COOKIE_NAME, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  const given = Buffer.from(signature);
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (typeof data.userId !== "number" || typeof data.role !== "string") return null;
    if (Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}
