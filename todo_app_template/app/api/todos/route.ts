import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Helper: read userId from the JWT session cookie
function getUserIdFromCookie(): string | null {
  const token = cookies().get("session")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId?: string };
    return payload.userId ?? null;
  } catch {
    return null;
  }
}

/**
 * GET /api/todos
 * Returns the authenticated user's todos (newest first)
 */
export async function GET() {
  const userId = getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todos = await prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ todos });
}

/**
 * POST /api/todos
 * Body: { title: string, description?: string }
 * Creates a new todo for the authenticated user
 */
export async function POST(req: Request) {
  const userId = getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const todo = await prisma.todo.create({
    data: {
      userId,
      title,
      description,
      // status uses default "pending" from your Prisma schema
    },
  });

  return NextResponse.json({ todo }, { status: 201 });
}
