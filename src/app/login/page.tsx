import { redirect } from "next/navigation";
import { getSession, HOME } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata = { title: "Login — Budiman HRMS" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const session = await getSession();
  if (session && HOME[session.role]) redirect(HOME[session.role]);
  const { msg } = await searchParams;
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f6ac0] via-[#0a4d94] to-[#073763] px-4">
      {/* decorative backdrop shapes */}
      <div className="pointer-events-none absolute inset-x-12 inset-y-10 rounded-[2.5rem] bg-white/5" />
      <div className="pointer-events-none absolute -left-16 top-1/4 h-72 w-72 rounded-full bg-blue-400/25 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] top-[18%] h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-[25%] h-72 w-96 rotate-6 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[15%] left-[18%] h-40 w-72 -rotate-12 rounded-full bg-sky-200/15 blur-2xl" />
      <div className="pointer-events-none absolute left-[35%] top-[6%] h-24 w-24 rounded-full border-[14px] border-cyan-300/40 [border-right-color:transparent] [border-bottom-color:transparent] blur-[2px]" />

      {/* login card */}
      <div className="relative w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <p className="text-center text-xl font-bold text-white">Budiman HRMS</p>
        <h1 className="mb-6 mt-8 text-2xl font-bold text-white">Login</h1>
        {msg === "logged-out" && (
          <p className="mb-4 rounded-lg bg-white/15 p-2 text-sm text-white">
            Logged out successfully.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
