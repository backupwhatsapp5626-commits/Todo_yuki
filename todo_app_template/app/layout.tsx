// app/layout.tsx
import "@/styles/globals.css";
import type { ReactNode } from "react";

export const metadata = { title: "To-Do App" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
