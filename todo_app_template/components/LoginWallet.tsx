"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function LoginWallet() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loginWithWallet() {
    try {
      setError(null);
      setLoading(true);

      if (!window.ethereum) {
        setError("MetaMask not detected");
        setLoading(false);
        return;
      }

      // 1. Connect wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = (await signer.getAddress()).toLowerCase();

      // 2. Request a nonce from backend
      const nonceRes = await fetch("/api/auth/wallet/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const nonceData = await nonceRes.json();
      if (!nonceRes.ok) {
        setError(nonceData?.error || "Failed to get nonce");
        setLoading(false);
        return;
      }

      const nonce = nonceData.nonce;
      const message = `Login nonce: ${nonce}`;

      // 3. User signs the message
      const signature = await signer.signMessage(message);

      // 4. Verify signature with backend
      const verifyRes = await fetch("/api/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        setError(verifyData?.error || "Wallet login failed");
        setLoading(false);
        return;
      }

      // ✅ Success → redirect to dashboard
      router.push("/dashboard");
    } catch (e: any) {
      console.error(e);
      setError("Wallet login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={loginWithWallet}
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded-md"
      >
        {loading ? "Connecting…" : "Connect Wallet"}
      </button>

      {error && (
        <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
