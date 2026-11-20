import { redirect } from "next/navigation";
import { getSession, HOME } from "@/lib/session";

// Decides between the login page and the role's home (design §4, `/`).
export default async function Home() {
  const session = await getSession();
  if (session && HOME[session.role]) redirect(HOME[session.role]);
  redirect("/login");
}
