import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";
import type { AppUser } from "./users";

/** Use in pages that need any signed-in user. Redirects guests to /login. */
export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/** Use in admin pages. Redirects guests to /login and patients to /. */
export async function requireAdmin(): Promise<AppUser> {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
}
