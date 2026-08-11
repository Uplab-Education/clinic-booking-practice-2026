import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { AppUser } from "./users";

const cookieName = "clinic_booking_session";
const maxAgeSeconds = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.AUTH_SECRET ?? "local-development-secret-change-me";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(user: AppUser) {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const payload = encodeBase64Url(JSON.stringify({ user, expiresAt }));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload)) as {
      user: AppUser;
      expiresAt: number;
    };

    if (!parsed.expiresAt || parsed.expiresAt < Date.now()) {
      return null;
    }

    return parsed.user;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(cookieName)?.value);
}

export async function setSessionCookie(user: AppUser) {
  const cookieStore = await cookies();

  cookieStore.set(cookieName, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}
