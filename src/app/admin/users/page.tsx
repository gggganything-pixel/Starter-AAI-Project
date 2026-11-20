import { requireRole } from "@/lib/guard";
import { AddUserForm } from "./add-user-form";

export const metadata = { title: "Add user | Budiman HRMS" };

export default async function AdminUsersPage() {
  await requireRole("Admin");
  return (
    <main className="mx-auto mt-24 max-w-md px-4">
      <h1 className="text-2xl font-bold">Add a user</h1>
      <p className="mt-2 mb-6 text-gray-600">
        The new account gets a generated one-time password shown once below.
      </p>
      <AddUserForm />
    </main>
  );
}
