"use client";

import { logout } from "@/lib/auth";

// FR-07: logout asks for confirmation before the action runs.
export function LogoutButton() {
  return (
    <form action={logout} className="inline">
      <button
        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
        onClick={(e) => {
          if (!window.confirm("Log out?")) e.preventDefault();
        }}
      >
        Log out
      </button>
    </form>
  );
}
