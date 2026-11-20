import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budiman HRMS",
  description: "Leave Request module for Budiman Company.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session
    ? await db.user.findUnique({ where: { id: session.userId } })
    : null;
  return (
    <html lang="en">
      <body>
        {user && (
          <header className="flex items-center justify-between border-b bg-white px-4 py-3">
            <span className="font-semibold">Budiman HRMS</span>
            <span className="flex items-center gap-3 text-sm">
              {user.name}
              <LogoutButton />
            </span>
          </header>
        )}
        {children}
      </body>
    </html>
  );
}
