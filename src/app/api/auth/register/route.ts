import { NextResponse } from "next/server";
import { setSessionCookie } from "@/auth/session";
import { createRegisteredUser } from "@/auth/users";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!name || !email.includes("@") || password.length < 6) {
    return NextResponse.json(
      { message: "Enter a name, valid email, and password with at least 6 characters." },
      { status: 400 },
    );
  }

  const user = await createRegisteredUser(name, email, password);

  if (!user) {
    return NextResponse.json(
      { message: "An account with this email already exists." },
      { status: 409 },
    );
  }

  await setSessionCookie(user);

  return NextResponse.json({ user }, { status: 201 });
}
