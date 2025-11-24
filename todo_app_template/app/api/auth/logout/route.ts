import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Remove the session cookie
    cookies().set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // set to true in production
      path: "/",
      sameSite='lax',
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
