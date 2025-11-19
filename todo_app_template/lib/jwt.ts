// lib/jwt.ts
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

const SECRET = process.env.JWT_SECRET as string;

/**
 * Create a signed JWT
 * payload can include userId or anything else you want
 */
export function signJWT(payload: object, expiresIn: string | number = "7d") {
  const opts = { expiresIn } as any;
  return (jwt as any).sign(payload as any, SECRET as any, opts);
}

/**
 * Verify a JWT and return the payload
 * Returns null if invalid / expired
 */
export function verifyJWT(token: string): any | null {
  try {
    return (jwt as any).verify(token, SECRET as any);
  } catch (err) {
    return null;
  }
}

/**
 * Safe decode: returns `null` if token invalid
 */
export function decodeJWT(token: string): any | null {
  try {
    return (jwt as any).decode(token);
  } catch {
    return null;
  }
}
