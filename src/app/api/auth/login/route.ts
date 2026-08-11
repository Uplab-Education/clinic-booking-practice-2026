import { NextResponse } from "next/server";
import { setSessionCookie } from "@/auth/session";
import { findUserByCredentials } from "@/auth/users";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  const user = await findUserByCredentials(body.email ?? "", body.password ?? "");

  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 },
    );
  }

  await setSessionCookie(user);

  return NextResponse.json({ user });
}
