"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="hover:text-ink-primary transition"
    >
      Log out
    </button>
  );
}
