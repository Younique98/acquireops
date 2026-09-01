import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { Property, STAGE_LABELS } from "@/lib/types";
import {
  underwrite,
  equity as computeEquity,
  availableRefiEquity,
  returnOnEquityPct,
  shouldConsiderRedeployingCapital,
} from "@/lib/underwriting";
import { StageBadge } from "@/components/StageBadge";
import { MetricCard } from "@/components/MetricCard";
import { formatCurrency, formatPercent } from "@/lib/format";
import { DeletePropertyButton } from "@/components/DeletePropertyButton";
import clsx from "clsx";

async function getProperty(id: string): Promise<Property | null> {
  const numericId = parseInt(id, 10);
  if (!Number.isInteger(numericId)) return null;
  const result = await pool.query<Property>("SELECT * FROM properties WHERE id = $1", [
    numericId,
  ]);
  return result.rows[0] ?? null;
}

// One unique, descriptive title per property (address + city/state) rather
// than a single generic title repeated across every listing page - this
// stays private (root layout sets robots: noindex) but still gives each
// tab/bookmark/browser-history entry something specific to identify it by.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return { title: "Property not found" };

  const location = [property.city, property.state].filter(Boolean).join(", ");
  return {
    title: location ? `${property.address}, ${location}` : property.address,
    description: `${property.address} - ${formatCurrency(
      Number(property.purchase_price),
    )} purchase price, ${formatCurrency(Number(property.monthly_rent))}/mo rent. ${STAGE_LABELS[property.stage]} in the deal pipeline.`,
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

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

  const hasOwnershipData =
    property.current_value !== null && property.mortgage_balance !== null;
  const currentValue = hasOwnershipData ? Number(property.current_value) : 0;
  const mortgageBalance = hasOwnershipData ? Number(property.mortgage_balance) : 0;
  const currentEquity = hasOwnershipData ? computeEquity(currentValue, mortgageBalance) : 0;
  const refiAvailable = hasOwnershipData
    ? availableRefiEquity(currentValue, mortgageBalance)
    : 0;
  const annualCashFlow = result.monthlyCashFlow * 12;
  const roe = hasOwnershipData ? returnOnEquityPct(annualCashFlow, currentEquity) : 0;
  const flagRedeploy =
    hasOwnershipData && shouldConsiderRedeployingCapital(annualCashFlow, currentEquity);

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/properties" className="text-sm font-semibold text-brand-450 hover:underline">
        &larr; All properties
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary">
            {property.address}
          </h1>
          <p className="text-ink-secondary">
            {[property.city, property.state, property.zip].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StageBadge stage={property.stage} />
          <Link
            href={`/properties/${property.id}/edit`}
            className="px-4 py-2 rounded-full border border-line-border text-sm font-semibold text-ink-secondary hover:border-brand-300 transition"
          >
            Edit
          </Link>
          <DeletePropertyButton id={property.id} />
        </div>
      </div>

      {property.notes && (
        <p className="mt-4 text-ink-secondary bg-surface border border-line-border rounded-lg p-4">
          {property.notes}
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold text-ink-primary mb-3">Underwriting</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Monthly cash flow"
            value={formatCurrency(result.monthlyCashFlow)}
            tone={result.monthlyCashFlow >= 0 ? "good" : "critical"}
          />
          <MetricCard label="Cap rate" value={formatPercent(result.capRatePct)} />
          <MetricCard
            label="Cash-on-cash return"
            value={formatPercent(result.cashOnCashReturnPct)}
          />
          <MetricCard
            label="1% rule"
            value={formatPercent(result.onePercentRulePct, 2)}
            tone={result.meetsOnePercentRule ? "good" : "neutral"}
            helpText={result.meetsOnePercentRule ? "Meets the 1% rule" : "Below the 1% rule"}
          />
          <MetricCard label="DSCR" value={result.dscr.toFixed(2)} />
          <MetricCard
            label="Monthly mortgage payment"
            value={formatCurrency(result.monthlyMortgagePayment)}
          />
        </div>
      </section>

      {hasOwnershipData && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-ink-primary mb-3">Equity</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard label="Current equity" value={formatCurrency(currentEquity)} />
            <MetricCard
              label="Available via cash-out refi"
              value={formatCurrency(refiAvailable)}
              helpText="Estimated at 75% max LTV - not a lender commitment"
            />
            <MetricCard label="Return on equity" value={formatPercent(roe)} />
          </div>

          {flagRedeploy && (
            <div
              className={clsx(
                "mt-4 rounded-lg border p-4 text-sm",
                "border-status-warning bg-surface",
              )}
            >
              <p className="font-semibold text-ink-primary">
                Consider redeploying capital from this property
              </p>
              <p className="text-ink-secondary mt-1">
                This property&rsquo;s cash flow is returning less than{" "}
                {formatPercent(6)} against its current equity. A refinance or sale
                could free up capital for a higher-yielding acquisition - this is a
                planning signal based on the numbers, not tax or financial advice.
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
