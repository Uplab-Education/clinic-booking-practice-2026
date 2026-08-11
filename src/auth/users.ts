// Thin auth-facing wrapper over the users table. The session cookie and the
// auth API routes only ever see this sanitized user shape - password hashes
// stay inside the query layer.

import * as userQueries from "@/db/queries/users";
import type { UserRole } from "@/db/schema";

export type { UserRole };

export type AppUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export async function findUserByCredentials(
  email: string,
  password: string,
): Promise<AppUser | null> {
  return userQueries.findUserByCredentials(email, password);
}

/** Registers a patient account. Returns null when the email is already taken. */
export async function createRegisteredUser(
  name: string,
  email: string,
  password: string,
): Promise<AppUser | null> {
  return userQueries.createPatient(name, email, password);
}
