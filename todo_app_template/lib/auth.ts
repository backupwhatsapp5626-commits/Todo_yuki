// lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export function getUserIdFromRequest(): string | null {
  try {
    const token = cookies().get("session")?.value;
    if (!token) return null;

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId?: string };

    return payload.userId ?? null;
  } catch (err) {
    return null;
  }
}
