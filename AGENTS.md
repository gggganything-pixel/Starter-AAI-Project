# Project Rules

## What this is
Budiman HRMS — a Leave Request module replacing the paper leave form process
(~200 employees). Four roles — Employee, Supervisor, HR, Admin — move a request
from submission, to supervisor sign-off, to an HR decision. The source of truth is
`docs/Agentic AI - HRMS Doc.pdf`; read it before building anything.

## What it is built with (fixed — do not swap)
Next.js + TypeScript, SQLite with Prisma, Tailwind CSS, server actions, session
cookie login, passwords hashed with bcryptjs. Versions are pinned in package.json.

## How to run
`npm install`, then `npm run dev` and open http://localhost:3000. Check code with
`npm run lint`. Needs Node 20.9 or newer.

## Where things live
- `docs/Agentic AI - HRMS Doc.pdf` — requirements, rules, and data tables (7.2)
- `docs/templates/` — blank spec files to copy; `docs/specs/` — your filled specs
- `src/app/` — Next.js pages and server actions

## How to work
- Spec-driven: write or fix the spec in `docs/specs/` first, then the code.
  Something wrong? Fix the spec, then the code.
- Build order: High-priority requirements first (FR-01 login first), then Medium,
  then Low. One task at a time.
- Security by design: every feature follows section 7.5 of the doc and the OWASP
  Top 10 (2025). Hash passwords, never store them plain; check the logged-in
  user's role before showing data or allowing changes.
- Stay in scope: build only what section 6 lists. New ideas go into the spec as
  Low priority first.
- Ask permission before building or committing.

## Commits
Every commit message uses conventional commits: `type: short lowercase
description`, e.g. `feat: add login page`. Common types: feat, fix, docs,
refactor, test, chore.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
