import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/auth/passwords";
import { getDb } from "@/db/client";
import { isUniqueViolation } from "@/db/errors";
import { users, type User } from "@/db/schema";

export type PublicUser = Pick<User, "id" | "name" | "email" | "role">;

function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function findUserByCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await getDb().select().from(users).where(eq(users.email, normalizedEmail));

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return toPublicUser(user);
}

/** Creates a patient account. Returns null when the email is already taken. */
export async function createPatient(
  name: string,
  email: string,
  password: string,
): Promise<PublicUser | null> {
  try {
    const [user] = await getDb()
      .insert(users)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: hashPassword(password),
        role: "patient",
      })
      .returning();

    return toPublicUser(user);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return null;
    }

    throw error;
  }
}
