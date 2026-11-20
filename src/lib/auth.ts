"use server";

import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { createSession, destroySession, getSession, HOME } from "@/lib/session";

export type LoginState = { error?: string };

// In-memory password-guessing guard (design §2 rule 3): 10 failures per
// email inside a rolling 5-minute window blocks that email until the window
// passes. Server memory only — a restart clears it, which is acceptable here.
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 5 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; firstAt: number }>();

function isBlocked(email: string): boolean {
  const entry = failedAttempts.get(email);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    failedAttempts.delete(email);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(email: string) {
  const entry = failedAttempts.get(email);
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    failedAttempts.set(email, { count: 1, firstAt: Date.now() });
  } else {
    entry.count += 1;
  }
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (isBlocked(email)) {
    return { error: "too many attempts, try again later" };
  }
  const user =
    email && password ? await db.user.findUnique({ where: { email } }) : null;
  const home = user ? HOME[user.role] : undefined;
  if (user && home && (await compare(password, user.passwordHash))) {
    failedAttempts.delete(email);
    await createSession(user.id, user.role);
    redirect(home);
  }
  if (email) recordFailure(email);
  // One generic message for every failure (design §2 rule 2): the user must
  // never learn whether the email or the password was the wrong part.
  return { error: "Invalid email or password" };
}

export type AddUserState = { error?: string; createdEmail?: string; otp?: string };

// Fixed lists from design Reference A. "Admin" is included as a division with
// the "Admin Manager" title because the seeded admin account uses it (design
// Reference B), so the form must accept it too.
const ROLES = ["Employee", "Supervisor", "HR", "Admin"];
const DESIGNATIONS: Record<string, string[]> = {
  Finance: ["Finance Manager", "Accountant", "Accounts Clerk"],
  "Human Resources": ["HR Manager", "HR Officer", "HR Assistant"],
  "Information Technology": ["IT Manager", "Software Developer", "IT Support Officer"],
  Operations: ["Operations Manager", "Operations Supervisor", "Operations Executive"],
  Marketing: ["Marketing Manager", "Marketing Executive", "Marketing Assistant"],
  Admin: ["Admin Manager"],
};

export async function addUser(
  _prev: AddUserState,
  formData: FormData,
): Promise<AddUserState> {
  // Every action re-checks the session on the server (design §2 rule 6).
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return { error: "Only admins can add users" };
  }
  const name = String(formData.get("name") ?? "").trim();
  const icNo = String(formData.get("icNo") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");
  const division = String(formData.get("division") ?? "");
  const designation = String(formData.get("designation") ?? "").trim();
  if (!name) return { error: "Name is required" };
  if (!/^\d{2}-\d{6}$/.test(icNo)) {
    return { error: "IC number must be in the format xx-xxxxxx (for example 00-200001)" };
  }
  if (!/^[^@\s]+@budiman\.com$/.test(email)) {
    return { error: "Email must be a @budiman.com address" };
  }
  if (!ROLES.includes(role)) return { error: "Choose a role" };
  if (!DESIGNATIONS[division]?.includes(designation)) {
    return { error: "Choose the designation that belongs to the selected division" };
  }
  if (await db.user.findUnique({ where: { email } })) {
    return { error: "That email is already taken" };
  }
  if (await db.user.findUnique({ where: { icNo } })) {
    return { error: "That IC number is already taken" };
  }
  // Random one-time password (design rule 10): shown to the admin once,
  // stored only as a bcrypt hash.
  const otp = randomBytes(9).toString("base64url");
  await db.user.create({
    data: {
      name,
      icNo,
      email,
      role,
      division,
      designation,
      passwordHash: await hash(otp, 10),
    },
  });
  return { createdEmail: email, otp };
}

export async function logout(): Promise<void> {
  // Actions re-check the session on the server (design §2 rule 6).
  const session = await getSession();
  if (!session) redirect("/login");
  await destroySession();
  redirect("/login?msg=logged-out");
}
