"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-blue-100">
        Email
        <input
          name="email"
          type="email"
          required
          placeholder="username@gmail.com"
          autoComplete="username"
          className="rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-300"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-blue-100">
        Password
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          autoComplete="current-password"
          className="rounded-md bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-300"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-[#0c2d52] py-2.5 font-semibold text-white transition-colors hover:bg-[#0a2440] disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-200">
          {state.error}
        </p>
      )}
    </form>
  );
}
