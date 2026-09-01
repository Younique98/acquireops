import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

export const Nav = () => (
  <header className="border-b border-line bg-surface">
    <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
      <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight text-ink-primary">
        Acquire<span className="text-navy-text">Ops</span>
      </Link>
      <nav className="flex items-center gap-6 text-sm font-semibold text-ink-secondary">
        <Link href="/dashboard" className="hover:text-ink-primary transition">
          Dashboard
        </Link>
        <Link href="/dashboard/properties" className="hover:text-ink-primary transition">
          Properties
        </Link>
        <Link
          href="/dashboard/properties/new"
          className="px-4 py-2 rounded-full bg-navy text-white hover:bg-navy-hover transition"
        >
          Add property
        </Link>
        <SignOutButton />
      </nav>
    </div>
  </header>
);
