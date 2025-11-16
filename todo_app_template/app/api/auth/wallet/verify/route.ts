// app/api/auth/wallet/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";

export async function POST(req: Request) {
  try {
    const { address, signature } = await req.json();

    if (!address || !signature) {
      return NextResponse.json(
        { error: "Missing address or signature" },
        { status: 400 }
      );
    }

    const addr = address.toLowerCase().trim();

    // Fetch user and their nonce
    const user = await prisma.user.findUnique({
      where: { walletAddress: addr },
    });

    if (!user || !user.walletNonce) {
      return NextResponse.json(
        { error: "Wallet not registered or nonce missing" },
        { status: 400 }
      );
    }

    const message = `Login nonce: ${user.walletNonce}`;

    // Recover signer
    const recovered = ethers.verifyMessage(message, signature).toLowerCase();

    if (recovered !== addr) {
      return NextResponse.json(
        { error: "Signature does not match wallet address" },
        { status: 401 }
      );
    }

    // Signature valid → clear nonce and authenticate user
    await prisma.user.update({
      where: { walletAddress: addr },
      data: { walletNonce: null },
    });

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Set session cookie
    cookies().set("session", token, {
      httpOnly: true,
      secure: false, // set true on production HTTPS
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Wallet verification failed" },
      { status: 500 }
    );
  }
}
