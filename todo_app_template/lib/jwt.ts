// lib/jwt.ts
import jwt, { Secret } from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}

const SECRET = process.env.JWT_SECRET as string;

/**
 * Create a signed JWT
 * payload can include userId or anything else you want
 */
export function signJWT(payload: object, expiresIn: string | number = "7d") {
  const opts = { expiresIn: expiresIn as unknown as string } ;
  return jwt.sign(payload as any, SECRET as Secret, opts as any);
}

/**
 * Verify a JWT and return the payload
 * Returns null if invalid / expired
 */
export function verifyJWT(token: string): any | null {
  try {
    return jwt.verify(token, SECRET as Secret);
  } catch (err) {
    return null;
  }
}

/**
 * Safe decode: returns `null` if token invalid
 */
export function decodeJWT(token: string): any | null {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
}
