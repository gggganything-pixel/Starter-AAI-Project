import { redirect } from "next/navigation";
import { getSession, HOME, type Session } from "@/lib/session";

// Called at the top of every role page (design §2 rule 6): the server, not
// hidden links, decides who sees what. Logged out -> /login; wrong role ->
// that user's own home page.
export async function requireRole(role: string): Promise<Session> {
  const session = await getSession();
  if (!session || !HOME[session.role]) redirect("/login");
  if (session.role !== role) redirect(HOME[session.role]);
  return session;
}
