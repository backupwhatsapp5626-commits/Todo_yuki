import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Remove the session cookie
    cookies().set("session", "", {
      httpOnly: true,
      secure: false, // set to true in production
      path: "/",
      maxAge: 0,     // expire immediately
    });

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
