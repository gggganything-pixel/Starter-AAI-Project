# Budiman HRMS – Login Module – Design

## 1. Tables

### `User` – one row per person who can log in

| Field | Type | Required? | What it holds |
|-------|------|-----------|---------------|
| `id` | number | auto | Unique number for the row |
| `name` | text | yes | Full name |
| `icNo` | text | yes | Identity card number, format `xx-xxxxxx` (two digits, hyphen, six digits). Unique |
| `email` | text | yes | Work email, always ends `@budiman.com`. Unique — used to log in |
| `passwordHash` | text | yes | bcrypt hash of the password (starts `$2b$`). Never plain text |
| `role` | text | yes | One of: Employee, Supervisor, HR, Admin (see Reference A) |
| `division` | text | yes | One of the five divisions (see Reference A) |
| `designation` | text | yes | Job title from the division's list (see Reference A) |
| `createdAt` | date | auto | Set automatically when the account is created |

Leave-request tables are deliberately absent — they belong to the leave module's
design spec.

## 2. Business rules

1. **Login is the only door.** A user logs in with their `email` plus their
   password. The stored bcrypt hash is checked with bcryptjs.
2. **One generic error.** A wrong email or a wrong password always shows
   "Invalid email or password". Nothing more specific is ever said (U2, AC-02).
3. **Guessing is slowed.** After 10 failed attempts for one email within
   5 minutes, further attempts for that email are refused for the rest of the
   window — even with the right password (U6, AC-06). The count is kept in
   server memory; a restart clears it, which is fine for this app.
4. **One role per user.** `role` has exactly one value; the value decides the
   home page and the pages the user may open.
5. **The session is one signed cookie.** After a successful login the server
   sets a single httpOnly, signed cookie holding the user id and role, valid 8
   hours. There is no session table. A restart of the browser keeps the user
   logged in until the cookie expires (U4, AC-04).
6. **Servers decide, browsers suggest.** Pages are *not* secured by hiding
   links. Every role page and every action re-checks the cookie and the role
   on the server before showing or changing anything (U3, AC-03).
7. **Logout clears the session.** The Logout button runs a server action that
   removes the cookie and returns to `/login` (U5, AC-05).
8. **No self sign-up.** Accounts exist only from the seed (U7, AC-07) or from
   the Admin add-user page (U8, AC-08).
9. **Admin add-user is admin-only, Low priority.** The Admin fills name, IC,
   email, role, division and designation; the system generates a random
   one-time password, shows it once on screen, and stores only its bcrypt hash.
   Emails and IC numbers must pass the format and uniqueness checks, or the
   row is not created.
10. **Confirm before acting.** Adding a user and logging out ask for
    confirmation first and show a success message afterwards (FR-07).

## 3. Technology

Fixed by the HRMS document (section 7.1) — versions pinned in `package.json`.

| Part | Choice | In plain words |
|------|--------|----------------|
| Framework | Next.js 16 + TypeScript | Screens and server logic in one project |
| Database | SQLite with Prisma | One file, no database server; Prisma defines the `User` table |
| Styling | Tailwind CSS | Styles sit next to each screen |
| Passwords | bcryptjs | Hashes on seed and on add-user; compares on login |
| Session | Signed httpOnly cookie | Proof the user logged in, valid 8 hours, unreadable and unforgeable by the browser |
| Forms | Server actions | Log in, log out and add-user post straight to the server, no separate API |

## 4. Screens (routes)

| Route | Who | What it shows | Status |
|-------|-----|---------------|--------|
| `/` | Anyone | Not logged in: the login form. Logged in: sent to the role's home | To do |
| `/login` | Not logged in | Email + password form, one generic error line, a "too many attempts" note when blocked. Already-logged-in visitors are sent to their home | To do |
| `/employee` | Employee | Employee home (placeholder until the leave module builds it), header with the user's name and a Logout button | To do |
| `/supervisor` | Supervisor | Supervisor home (placeholder), same header | To do |
| `/hr` | HR | HR home (placeholder), same header | To do |
| `/admin` | Admin | Admin home (placeholder), same header, plus a link to Add user | To do |
| `/admin/users` | Admin | Add-user form; shows the generated one-time password once after a successful create | To do |

Wrong-role or logged-out visits follow rule 6: the server redirects to the
login page (logged out) or to the user's own home (wrong role). A logged-in
employee typing `/admin` never sees admin data.

## 5. Where the code lives

| Folder / file | What's in it |
|---------------|--------------|
| `prisma/schema.prisma` | The `User` model (section 1), SQLite datasource |
| `prisma/seed.ts` | Creates the six demo users from Reference B with bcrypt-hashed `password123` |
| `src/app/layout.tsx` | Shared shell; renders the header (name + Logout) only when logged in |
| `src/app/page.tsx` | Replaced: decides `/login` vs the role's home |
| `src/app/login/page.tsx` | The login form and its error messages |
| `src/app/employee/page.tsx` | Employee home |
| `src/app/supervisor/page.tsx` | Supervisor home |
| `src/app/hr/page.tsx` | HR home |
| `src/app/admin/page.tsx` | Admin home |
| `src/app/admin/users/page.tsx` | Add-user form + one-time password display |
| `src/lib/db.ts` | The one shared Prisma client |
| `src/lib/session.ts` | Create / read / destroy the signed session cookie |
| `src/lib/auth.ts` | Server actions: log in, log out, add user; plus the role check every page calls |
| `src/lib/guard.ts` | Server-side redirect rules for the role routes (used by pages, not just links) |

Before writing code, follow AGENTS.md: read the matching guide in
`node_modules/next/dist/docs/` for anything Next.js-specific.

## 6. Security (in plain words)

- Every role page and every server action checks the session cookie and the
  user's role on the server — hiding links is never the protection (OWASP A01).
- Passwords are stored only as bcrypt hashes (cost 10). The plain password is
  never written to the database, logs, or the screen (OWASP A02).
- The session cookie is httpOnly and signed; the signing secret lives in an
  environment variable (`.env`, not committed) (OWASP A02, A05).
- Login errors are generic, and repeated guessing per email is blocked for
  5 minutes (OWASP A07).
- Email (`@budiman.com`, unique), IC (`xx-xxxxxx`, unique) and role/division/
  designation choices are re-checked on the server, whatever the browser sent
  (OWASP A03, A05).
- Inputs are rendered as plain text; no user-supplied text is trusted (OWASP A03).

## 7. Commands

| Command | What it does |
|---------|--------------|
| `npm install` | Install the pinned tools |
| `npx prisma db push` | Create the SQLite database and the `User` table from the schema |
| `npm run seed` | Load the six demo users from Reference B |
| `npm run dev` | Start the app at http://localhost:3000 |
| `npm run lint` | Check the code |
| `npx prisma studio` | Open the database in the browser (how AC-07 is checked) |

---

# Reference

## Reference A. Fixed lists

- **Roles:** Employee, Supervisor, HR, Admin
- **Finance:** Finance Manager, Accountant, Accounts Clerk
- **Human Resources:** HR Manager, HR Officer, HR Assistant
- **Information Technology:** IT Manager, Software Developer, IT Support Officer
- **Operations:** Operations Manager, Operations Supervisor, Operations Executive
- **Marketing:** Marketing Manager, Marketing Executive, Marketing Assistant

## Reference B. Demo data (seed)

All log in with `password123` (stored hashed). Names and IC numbers are made up.

| Email | Name | IC No. | Role | Division | Designation |
|-------|------|--------|------|----------|-------------|
| `employee-1@budiman.com` | Employee 1 | `00-148888` | Employee | Finance | Accounts Clerk |
| `supervisor-1@budiman.com` | Supervisor 1 | `00-157777` | Supervisor | Finance | Finance Manager |
| `supervisor-2@budiman.com` | Supervisor 2 | `00-166666` | Supervisor | Finance | Accountant |
| `hr-1@budiman.com` | HR 1 | `00-175555` | HR | Human Resources | HR Officer |
| `hr-2@budiman.com` | HR 2 | `00-184444` | HR | Human Resources | HR Officer |
| `admin@budiman.com` | Admin | `00-193333` | Admin | Admin | Admin Manager |
