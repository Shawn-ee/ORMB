import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORMB Demo",
  description:
    "Testnet-only, whitelisted enterprise settlement token demo for stablecoin infrastructure workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link className="brand" href="/">
              <span className="brand-name">ORMB</span>
              <span className="brand-subtitle">Testnet settlement infrastructure demo</span>
            </Link>
            <nav className="nav" aria-label="Primary navigation">
              <Link href="/admin">Admin</Link>
              <Link href="/company">Company</Link>
              <Link href="/status">System Status</Link>
            </nav>
          </header>
          <div className="banner">
            Testnet-only demo. Mock assets only. No real USDT, RMB, customer funds, or production payment activity.
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
