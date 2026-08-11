import crypto from "node:crypto";

// Note: this module is imported both by the Next.js app and by the seed script
// (`npm run db:seed`), so it must stay free of Next.js-only imports.

const keyLength = 64;

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, keyLength).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const candidate = crypto.scryptSync(password, salt, keyLength);
  const expected = Buffer.from(hash, "hex");

  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}
