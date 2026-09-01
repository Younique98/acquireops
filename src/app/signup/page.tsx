"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong. Try again.");
      setSubmitting(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setSubmitting(false);

    if (!result || result.error) {
      router.push("/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-lg font-bold tracking-tight text-ink-primary">
          Acquire<span className="text-brand-450">Ops</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold text-ink-primary">Create your account</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Free to start. Your properties and deal data are private to your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-ink-secondary mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-line-border bg-surface px-3 py-2 text-sm text-ink-primary"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-ink-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line-border bg-surface px-3 py-2 text-sm text-ink-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-ink-secondary mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line-border bg-surface px-3 py-2 text-sm text-ink-primary"
            />
            <p className="mt-1 text-xs text-ink-muted">At least 8 characters.</p>
          </div>

          {error && (
            <p className="text-sm text-status-critical" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-full bg-brand-450 text-white font-semibold hover:bg-brand-500 transition disabled:opacity-60"
          >
            {submitting ? "Creating your account..." : "Create your account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-450 font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
