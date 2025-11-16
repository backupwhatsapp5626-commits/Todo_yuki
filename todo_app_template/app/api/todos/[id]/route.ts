import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

function getUserId() {
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
 * GET /api/todos/:id
 */
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const userId = getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todo = await prisma.todo.findFirst({
    where: { id: context.params.id, userId },
  });

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json({ todo });
}

/**
 * PUT /api/todos/:id
 * Body can include { title?, description?, status? }
 */
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const userId = getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const update: any = {};
  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.description === "string") update.description = body.description.trim();
  if (typeof body.status === "string") update.status = body.status;

  // Update only user's own todo
  const todo = await prisma.todo.updateMany({
    where: { id: context.params.id, userId },
    data: update,
  });

  if (todo.count === 0) {
    return NextResponse.json({ error: "Todo not found or unauthorized" }, { status: 404 });
  }

  const updated = await prisma.todo.findUnique({
    where: { id: context.params.id },
  });

  return NextResponse.json({ todo: updated });
}

/**
 * DELETE /api/todos/:id
 */
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const userId = getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await prisma.todo.deleteMany({
    where: { id: context.params.id, userId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Todo not found or unauthorized" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
