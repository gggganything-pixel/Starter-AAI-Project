# Budiman HRMS – Login Module – Requirements

## 1. The problem

Nothing in the leave system can be trusted unless we know who is using it:
supervisor sign-offs, HR decisions and the admin view all depend on identity, and
the whole system must be secure by design (FR-01, FR-10, section 7.5 of the HRMS
doc). There is no login yet — the app currently shows the same page to everyone.

This module provides:

1. Email + password login for the four roles (Employee, Supervisor, HR, Admin).
2. A home page per role and server-side protection of every page.
3. A safe 8-hour session kept in one signed httpOnly cookie, plus logout.
4. Protection against password guessing (generic error + attempt limit).
5. The six demo users from the doc (section 7.2) loaded by seed, and an
   Admin-only "add user" page (Low-priority extra, not in section 6).

## 2. Who uses it (roles)

| Role | Home page | What they do |
|------|-----------|--------------|
| **Employee** | `/employee` | Logs in and lands on their home page. Leave features come in a later spec. |
| **Supervisor** | `/supervisor` | Logs in and lands on their home page. |
| **HR** | `/hr` | Logs in and lands on their home page. |
| **Admin** | `/admin` | Logs in and lands on their home page; can add users (Low). |
| **Anonymous** | `/login` | Anyone not logged in only ever sees the login page. |

## 3. User stories

- **U1. Log in** *(High)*. As an Employee, I can log in with my @budiman.com email
  and password so that I can use the system.
  Hand test: open http://localhost:3000 → enter `employee-1@budiman.com` /
  `password123` → the employee home appears. Repeat with the other five demo
  accounts → each lands on its own role home.
- **U2. Wrong credentials are rejected** *(High)*. As anyone, when my credentials
  are wrong I see one generic error, so I cannot learn which part was wrong.
  Hand test: try `employee-1@budiman.com` + a wrong password → "Invalid email or
  password". Try `nobody@budiman.com` + `password123` → exactly the same message.
- **U3. Role pages are protected** *(High)*. As a logged-in user, I cannot open
  another role's pages, so each person sees only what they need (FR-01).
  Hand test: log in as `employee-1@budiman.com`, then type `/admin` in the address
  bar → blocked and returned to the employee home, no admin data shown. Log out,
  then type `/hr` → sent to `/login`.
- **U4. Session lasts 8 hours** *(High)*. As a user, I stay logged in between
  pages and after reopening the browser until 8 hours of use have passed, so I am
  not asked for my password constantly.
  Hand test: log in as `hr-1@budiman.com`, close and reopen the browser → still on
  the HR home. Then have the session lifetime temporarily set to 1 minute, wait a
  minute and click any page → back to `/login`.
- **U5. Log out** *(High)*. As a user, I can log out from any page so the next
  person at this laptop cannot see my data.
  Hand test: on any role page press **Logout** → `/login`. Press the browser Back
  button → no role data is shown. Logging in again works normally.
- **U6. Password-guessing protection** *(High)*. As the system, I temporarily
  block an email after 10 failed logins in 5 minutes, so password guessing is
  slowed (section 7.5, OWASP Top 10).
  Hand test: fail 10 logins for `employee-1@budiman.com` → the 11th attempt shows
  "too many attempts, try again later" even with the correct password. Meanwhile
  `hr-1@budiman.com` can still log in. Wait 5 minutes → `employee-1` works again.
- **U7. Demo accounts exist** *(High)*. As a tester, I can load the six demo
  users from the doc (section 7.2) into an empty database so everyone has the
  same logins.
  Hand test: on a fresh database, run the seed command → all six accounts
  (`employee-1`, `supervisor-1`, `supervisor-2`, `hr-1`, `hr-2`, `admin`)
  @budiman.com log in with `password123` and their correct roles/divisions appear.
- **U8. Admin adds a user** *(Low)*. As Admin, I can create a new account and the
  system shows a generated one-time password once, so the new person can log in.
  Hand test: log in as `admin@budiman.com` → Add user: name "Test 1", IC
  `00-200001`, email `test-1@budiman.com`, Employee, Finance, Accounts Clerk → an
  OTP is shown once. Log out → log in as `test-1@budiman.com` with the OTP → the
  employee home appears.

## 4. Acceptance checklist

| Status | ID | Check | How to test |
|--------|----|-------|-------------|
| To do | AC-01 | (U1) Each of the six demo accounts logs in and lands on its own role's home page | • Open the app<br>• Log in with each of the six demo emails + `password123`<br>• You should see `/employee`, `/supervisor`, `/hr`, `/admin` as appropriate |
| To do | AC-02 | (U2) Wrong email and wrong password both show the same generic error | • Try a wrong password for a real email<br>• Try an unknown email with any password<br>• You should see "Invalid email or password" both times, nothing more specific |
| To do | AC-03 | (U3) Role pages are blocked on the server, not just hidden | • As employee-1, open `/admin` directly → returned to own home, no admin data<br>• Logged out, open `/hr` → sent to `/login` |
| To do | AC-04 | (U4) The session survives a browser restart and ends after 8 hours of use | • Log in, close and reopen the browser → still logged in<br>• With lifetime temporarily 1 minute, wait and click a page → back to `/login` |
| To do | AC-05 | (U5) Logout clears the session everywhere | • Press Logout → `/login`<br>• Browser Back → no role data<br>• A fresh login works |
| To do | AC-06 | (U6) An email is blocked for 5 minutes after 10 failed attempts | • Fail 10 logins for employee-1 → 11th attempt refused even with the right password<br>• Other accounts unaffected<br>• After 5 minutes it works again |
| To do | AC-07 | (U7) The seed creates the six users with bcrypt hashes, never plain text | • Seed a fresh database and inspect the stored password column → values start with `$2b$`, never `password123`<br>• All six can log in |
| To do | AC-08 | (U8) Admin add-user works and the OTP is shown once | • As admin, create `test-1@budiman.com` → OTP shown once<br>• Reload the page → OTP not shown again<br>• New account logs in with the OTP and reaches its role home |

## 5. Not included (for now)

- Self sign-up, "forgotten password", password change or reset.
- Everything outside login — leave requests, approvals, admin leave view
  (separate specs).
- Multi-factor authentication or external logins (Google, Active Directory).
- A server-side session table or a logout audit log.
- Notifying anyone when an account is rate-limited; permanent lockouts.
- "Remember me" beyond 8 hours.
- Admin editing or deleting users (add only, and it is Low priority).
