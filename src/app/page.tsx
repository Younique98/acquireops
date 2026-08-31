import pool from "@/lib/db";
import { underwrite } from "@/lib/underwriting";
import { computeEquityTrend } from "@/lib/portfolio";
import { Property, EquitySnapshot } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";

// Always reflects live portfolio data - never statically prerendered.
export const dynamic = "force-dynamic";
import { EquityTrendChart } from "@/components/EquityTrendChart";
import { formatCurrency, formatPercent } from "@/lib/format";

async function getPortfolioStats() {
  const ownedResult = await pool.query<Property>(
    "SELECT * FROM properties WHERE stage = 'owned' ORDER BY address ASC",
  );
  const owned = ownedResult.rows;

  let totalEquity = 0;
  let totalMonthlyCashFlow = 0;
  let totalAnnualNOI = 0;
  let totalValueForCapRate = 0;

  for (const property of owned) {
    const result = underwrite({
      purchasePrice: Number(property.purchase_price),
      monthlyRent: Number(property.monthly_rent),
      propertyTaxAnnual: Number(property.property_tax_annual),
      insuranceAnnual: Number(property.insurance_annual),
      hoaMonthly: Number(property.hoa_monthly),
      maintenancePct: Number(property.maintenance_pct),
      vacancyPct: Number(property.vacancy_pct),
      managementPct: Number(property.management_pct),
      downPaymentPct: Number(property.down_payment_pct),
      interestRatePct: Number(property.interest_rate_pct),
      loanTermYears: Number(property.loan_term_years),
      closingCosts: Number(property.closing_costs),
    });

    totalMonthlyCashFlow += result.monthlyCashFlow;
    totalAnnualNOI += result.annualNOI;

    const valueForCapRate = property.current_value ?? property.purchase_price;
    totalValueForCapRate += Number(valueForCapRate);

    if (property.current_value !== null && property.mortgage_balance !== null) {
      totalEquity += Number(property.current_value) - Number(property.mortgage_balance);
    }
  }

  const blendedCapRatePct =
    totalValueForCapRate > 0 ? (totalAnnualNOI / totalValueForCapRate) * 100 : 0;

  const propertyIds = owned.map(p => p.id);
  let equityTrend: ReturnType<typeof computeEquityTrend> = [];
  if (propertyIds.length > 0) {
    const snapshotsResult = await pool.query<EquitySnapshot>(
      `SELECT * FROM equity_snapshots WHERE property_id = ANY($1::int[]) ORDER BY recorded_at ASC`,
      [propertyIds],
    );
    equityTrend = computeEquityTrend(snapshotsResult.rows);
  }

  return {
    ownedCount: owned.length,
    totalEquity,
    totalMonthlyCashFlow,
    blendedCapRatePct,
    equityTrend,
  };
}

export default async function DashboardPage() {
  const stats = await getPortfolioStats();

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
