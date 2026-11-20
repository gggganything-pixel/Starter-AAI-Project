# Budiman HRMS – Login Module – Tasks

Build one task at a time, in order. When a task is done, the AI changes its
Status to Done. At the end, you check the whole app against the specs.
If something is wrong, fix the spec first, then ask the AI to rebuild.

**Priority.** Every task is **High**, **Medium** or **Low**. Do High first.
Do Low only if time is left, and only if you ask.

| Status | # | Task | Priority | Checks (from requirements §4) |
|--------|---|------|----------|-------------------------------|
| Done | 1 | Set up the database and the Users table | High | AC-07 |
| Done | 2 | Add the six demo users (seed) | High | AC-07 |
| Done | 3 | Log in and reach your role's home | High | AC-01 |
| Done | 4 | Reject wrong logins with one generic error | High | AC-02 |
| Done | 5 | Protect every page on the server | High | AC-03 |
| Done | 6 | Keep the user logged in for 8 hours | High | AC-04 |
| Done | 7 | Header with the name and a Logout button | High | AC-05 |
| Done | 8 | Block password guessing (10 per 5 min) | High | AC-06 |
| Done | 9 | Admin can add a user (Low extra) | Low | AC-08 |
| Done | 10 | Full walkthrough against the specs | High | All ACs |

---

## Task 1 – Database and Users table *(High)*

- **Goal:** A SQLite database exists with the `User` table exactly as design §1,
  reachable through one shared Prisma client.
- **Files:** `prisma/schema.prisma` (SQLite datasource + `User` model),
  `src/lib/db.ts`, database file (created by `npx prisma db push`).
- **Check:** AC-07 (table part) — open `npx prisma studio` and see the `User`
  table with the nine fields from design §1: `name`, `icNo`, `email`,
  `passwordHash`, `role`, `division`, `designation`, `createdAt`, plus `id`.
- **Trace:** design §1 (the field list is the HRMS doc §7.2 Users table);
  enables AC-07 (U7).

## Task 2 – Seed the six demo users *(High)*

- **Goal:** `npm run seed` fills an empty database with the six users from
  design Reference B, each password stored as a bcrypt hash of `password123`.
- **Files:** `prisma/seed.ts`, `package.json` (add the seed script).
- **Check:** AC-07 — after seeding, `npx prisma studio` shows the six rows with
  the right roles, divisions and designations, and every `passwordHash` starts
  `$2b$` with no plain `password123` anywhere.
- **Trace:** U7 / AC-07; design rule 8 and Reference B; HRMS doc §7.2 demo data.

## Task 3 – Log in and reach your role's home *(High)*

- **Goal:** A visitor at `/` sees the login form; entering a demo email +
  `password123` creates the signed 8-hour session cookie and lands the user on
  their own home page (placeholder), with `/login` sending logged-in visitors
  to their home instead.
- **Files:** `src/app/page.tsx` (replace placeholder), `src/app/login/page.tsx`,
  `src/app/employee/page.tsx`, `src/app/supervisor/page.tsx`,
  `src/app/hr/page.tsx`, `src/app/admin/page.tsx`, `src/lib/auth.ts` (login
  action), `src/lib/session.ts` (create session), `.env` (`SESSION_SECRET`,
  not committed).
- **Check:** AC-01 — log in with each of the six demo accounts and see the
  matching home page. Before logging in, the only page you can open is the
  login form.
- **Trace:** U1 / AC-01; design rules 1, 5 and §4; HRMS doc FR-01.

## Task 4 – One generic error for wrong logins *(High)*

- **Goal:** A wrong password or unknown email shows exactly "Invalid email or
  password", nothing more specific, and no session cookie is created.
- **Files:** `src/app/login/page.tsx`, `src/lib/auth.ts`.
- **Check:** AC-02 — try a wrong password for a real email, then an unknown
  email: both times the single generic message appears.
- **Trace:** U2 / AC-02; design rule 2; HRMS doc §7.5 (OWASP A07).

## Task 5 – Protect every page on the server *(High)*

- **Goal:** Every role page checks the cookie and role on the server:
  logged-out visitors are sent to `/login`, and a logged-in user who types
  another role's route is sent to their own home — data is never rendered
  first, links are never the protection.
- **Files:** `src/lib/guard.ts`, the four role pages from Task 3.
- **Check:** AC-03 — as `employee-1@budiman.com`, type `/admin`: back to the
  employee home with no admin data. Logged out, type `/hr`: sent to `/login`.
- **Trace:** U3 / AC-03; design rules 6 and §4 note; HRMS doc FR-01, §7.5
  (OWASP A01).

## Task 6 – Session lasts 8 hours *(High)*

- **Goal:** The session cookie keeps the user logged in across browser restarts
  and expires after 8 hours of use.
- **Files:** `src/lib/session.ts` (expiry), `.env` (lifetime value).
- **Check:** AC-04 — log in as `hr-1@budiman.com`, close and reopen the
  browser: still on the HR home. Then set the lifetime temporarily to 1 minute,
  wait, click any page: back to `/login`. Restore the 8-hour value afterwards.
- **Trace:** U4 / AC-04; design rule 5.

## Task 7 – Header with name and Logout *(High)*

- **Goal:** Logged-in users see their name and a Logout button in the header of
  every role page; Logout asks for confirmation, clears the cookie, shows a
  success message and returns to `/login`.
- **Files:** `src/app/layout.tsx`, `src/lib/auth.ts` (logout action).
- **Check:** AC-05 — from any role page: Logout → confirm → `/login`; browser
  Back shows no role data; logging in again works.
- **Trace:** U5 / AC-05; design rules 7 and 10 (FR-07); HRMS doc §5.3 rule 7.

## Task 8 – Block password guessing *(High)*

- **Goal:** After 10 failed attempts for one email within 5 minutes, further
  attempts for that email are refused with "too many attempts, try again
  later" — even with the correct password — until the window passes.
- **Files:** `src/lib/auth.ts` (in-memory counter).
- **Check:** AC-06 — fail 10 logins for `employee-1@budiman.com`, try the
  correct password on attempt 11: refused. `hr-1@budiman.com` still logs in.
  After 5 minutes, `employee-1` works again.
- **Trace:** U6 / AC-06; design rule 3; HRMS doc §7.5 (OWASP A07).

## Task 9 – Admin adds a user *(Low)*

- **Goal:** `/admin/users` (Admin only) offers the add-user form; on create the
  server checks the email/IC formats and uniqueness, stores a bcrypt hash of a
  generated one-time password, and shows the OTP once.
- **Files:** `src/app/admin/users/page.tsx`, `src/lib/auth.ts` (add-user
  action), `src/app/admin/page.tsx` (link).
- **Check:** AC-08 — as `admin@budiman.com`, create `test-1@budiman.com`
  (Employee, Finance, Accounts Clerk, IC `00-200001`): OTP shown once, gone on
  reload; log out and log in as `test-1@budiman.com` with the OTP → employee
  home. Also try a bad IC or a duplicate email: refused with a clear message.
- **Trace:** U8 / AC-08 (Low-priority extra, agreed in the interview); design
  rules 9 and 10; HRMS doc §7.2 field formats.

## Task 10 – Full walkthrough *(High)*

- **Goal:** The whole login module is checked end to end the way the HRMS doc's
  plan step 6 says: every role works as described.
- **Files:** none new — run the checklist.
- **Check:** AC-01 … AC-08 all pass in one sitting, `npm run lint` is clean,
  and confirmation + success messages appear for logout and add-user (FR-07).
- **Trace:** requirements §4 (all); HRMS doc §8 step 6.
