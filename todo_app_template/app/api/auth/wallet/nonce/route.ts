import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "node:crypto";

function makeNonce(len = 24) {
  // 24 chars ~ 96 bits; cryptographically random
  return randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
}

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid address" },
        { status: 400 }
      );
    }

    const addr = address.toLowerCase().trim();
    const nonce = makeNonce(24);

    // Create user if not exists, otherwise rotate nonce
    await prisma.user.upsert({
      where: { walletAddress: addr },
      create: { walletAddress: addr, walletNonce: nonce },
      update: { walletNonce: nonce },
    });

    return NextResponse.json({ nonce });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to issue nonce" },
      { status: 500 }
    );
  }
}
