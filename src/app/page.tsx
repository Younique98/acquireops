import Link from "next/link";

const FEATURES = [
  {
    title: "Underwrite before you offer",
    body: "Cap rate, cash-on-cash return, the 1% rule, and DSCR - calculated the moment you enter a property's numbers, not after you've already made an offer.",
  },
  {
    title: "Run your pipeline",
    body: "Watching, analyzing, offer made, under contract, owned, sold - track every deal through the stage it's actually in.",
  },
  {
    title: "Know when to hold or redeploy",
    body: "Once a property is owned, AcquireOps tracks its equity over time and flags when its return on equity has dropped low enough that a refinance or sale could fund a better acquisition.",
  },
  {
    title: "Your portfolio, privately",
    body: "Every account's properties, deal notes, and equity history are isolated to that account - never visible to anyone else.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="font-display text-lg font-semibold tracking-tight text-ink-primary">
            Acquire<span className="text-navy-text">Ops</span>
          </span>
          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/login" className="text-ink-secondary hover:text-ink-primary transition">
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-full bg-navy text-white hover:bg-navy-hover transition"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-6 pt-20 pb-24 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink-primary max-w-2xl mx-auto text-balance">
          Underwrite acquisitions. Track your portfolio. Know when to redeploy capital.
        </h1>
        <p className="mt-6 text-lg text-ink-secondary max-w-xl mx-auto">
          AcquireOps is the deal pipeline and underwriting calculator for
          landlords growing a rental portfolio - from first-look numbers on
          a potential deal to equity tracking on what you already own.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-full bg-navy text-white font-semibold hover:bg-navy-hover transition"
          >
            Create your account
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-full border border-line font-semibold text-ink-secondary hover:border-navy transition"
          >
            Log in
          </Link>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto grid gap-6 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="font-display font-semibold text-ink-primary mb-2">{feature.title}</h2>
              <p className="text-sm text-ink-secondary">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
