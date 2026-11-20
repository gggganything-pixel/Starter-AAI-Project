import Link from "next/link";
import { requireRole } from "@/lib/guard";

export default async function AdminHome() {
  await requireRole("Admin");
  return (
    <main className="mx-auto mt-24 max-w-2xl px-4">
      <h1 className="text-2xl font-bold">Admin home</h1>
      <p className="mt-2 text-gray-600">Placeholder — the leave module will build this page.</p>
      <p className="mt-6">
        <Link href="/admin/users" className="text-blue-700 underline">
          Add user
        </Link>
      </p>
    </main>
  );
}
