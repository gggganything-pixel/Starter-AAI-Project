// The six demo users are fixed by docs/specs/02-design.md Reference B
// (HRMS doc §7.2). Everyone logs in with password123, stored only as a
// bcrypt hash. Re-running replaces the table, so the seed is idempotent.
import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const db = new PrismaClient();

const PASSWORD = "password123";

const users = [
  { name: "Employee 1", icNo: "00-148888", email: "employee-1@budiman.com", role: "Employee", division: "Finance", designation: "Accounts Clerk" },
  { name: "Supervisor 1", icNo: "00-157777", email: "supervisor-1@budiman.com", role: "Supervisor", division: "Finance", designation: "Finance Manager" },
  { name: "Supervisor 2", icNo: "00-166666", email: "supervisor-2@budiman.com", role: "Supervisor", division: "Finance", designation: "Accountant" },
  { name: "HR 1", icNo: "00-175555", email: "hr-1@budiman.com", role: "HR", division: "Human Resources", designation: "HR Officer" },
  { name: "HR 2", icNo: "00-184444", email: "hr-2@budiman.com", role: "HR", division: "Human Resources", designation: "HR Officer" },
  { name: "Admin", icNo: "00-193333", email: "admin@budiman.com", role: "Admin", division: "Admin", designation: "Admin Manager" },
];

async function main() {
  const passwordHash = hashSync(PASSWORD, 10);
  await db.user.deleteMany();
  for (const u of users) {
    await db.user.create({ data: { ...u, passwordHash } });
  }
  console.log(`Seeded ${users.length} users. Everyone logs in with ${PASSWORD} (stored hashed).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
