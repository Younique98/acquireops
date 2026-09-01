import { getCurrentUser } from "@/lib/session";
import { getPortfolioStats } from "@/lib/portfolioStats";
import { MetricCard } from "@/components/MetricCard";
import { EquityTrendChart } from "@/components/EquityTrendChart";
import { formatCurrency, formatPercent } from "@/lib/format";

// Always reflects live portfolio data - never statically prerendered.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const stats = await getPortfolioStats(user.id);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary mb-1">
        Portfolio dashboard
      </h1>
      <p className="text-ink-secondary mb-8">
        {stats.ownedCount} owned {stats.ownedCount === 1 ? "property" : "properties"}
      </p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <MetricCard
          label="Total equity"
          value={formatCurrency(stats.totalEquity)}
        />
        <MetricCard
          label="Monthly cash flow"
          value={formatCurrency(stats.totalMonthlyCashFlow)}
          tone={stats.totalMonthlyCashFlow >= 0 ? "good" : "critical"}
        />
        <MetricCard
          label="Blended cap rate"
          value={formatPercent(stats.blendedCapRatePct)}
        />
      </div>

      <EquityTrendChart points={stats.equityTrend} />
    </main>
  );
}
