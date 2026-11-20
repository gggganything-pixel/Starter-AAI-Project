import { requireRole } from "@/lib/guard";

export default async function EmployeeHome() {
  await requireRole("Employee");
  return (
    <main className="mx-auto mt-24 max-w-2xl px-4">
      <h1 className="text-2xl font-bold">Employee home</h1>
      <p className="mt-2 text-gray-600">Placeholder — the leave module will build this page.</p>
    </main>
  );
}
