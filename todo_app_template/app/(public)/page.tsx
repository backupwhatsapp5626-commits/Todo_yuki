"use client";
import { useEffect, useState } from "react";
import LoginEmail from "@/components/LoginEmail";
import LoginWallet from "@/components/LoginWallet";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) router.replace("/dashboard");
      else setLoading(false);
    })();
  }, [router]);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <main className="min-h-screen grid place-items-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-6">
        <h1 className="text-2xl font-semibold text-center">Welcome to To-Do</h1>
        <LoginEmail />
        <div className="relative flex items-center">
          <div className="flex-grow border-t" />
          <span className="mx-4 text-xs text-gray-500">or</span>
          <div className="flex-grow border-t" />
        </div>
        <LoginWallet />
      </div>
    </main>
  );
}
