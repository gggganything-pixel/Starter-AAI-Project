"use client";

import { useActionState } from "react";
import { addUser, type AddUserState } from "@/lib/auth";

const initialState: AddUserState = {};

const ROLES = ["Employee", "Supervisor", "HR", "Admin"];
const DIVISIONS = [
  "Finance",
  "Human Resources",
  "Information Technology",
  "Operations",
  "Marketing",
  "Admin",
];

export function AddUserForm() {
  const [state, formAction, pending] = useActionState(addUser, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input name="name" required className="rounded border border-gray-300 p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        IC number
        <input
          name="icNo"
          required
          placeholder="00-200001"
          pattern="\d{2}-\d{6}"
          className="rounded border border-gray-300 p-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          placeholder="name@budiman.com"
          className="rounded border border-gray-300 p-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Role
        <select name="role" required className="rounded border border-gray-300 p-2">
          {ROLES.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Division
        <select name="division" required className="rounded border border-gray-300 p-2">
          {DIVISIONS.map((division) => (
            <option key={division}>{division}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Designation
        <input
          name="designation"
          required
          placeholder="must belong to the division"
          className="rounded border border-gray-300 p-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-700 p-2 text-white disabled:opacity-50"
      >
        {pending ? "Creating…" : "Add user"}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.otp && (
        <p className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-900">
          Account created for <strong>{state.createdEmail}</strong>. One-time
          password: <code className="font-mono font-bold">{state.otp}</code>.
          This password is shown only now — share it once, it is not stored as
          text.
        </p>
      )}
    </form>
  );
}
