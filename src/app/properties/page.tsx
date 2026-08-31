import Link from "next/link";
import pool from "@/lib/db";
import { underwrite } from "@/lib/underwriting";
import { Property, Stage, STAGE_LABELS } from "@/lib/types";
import { StageBadge } from "@/components/StageBadge";
import { formatCurrency, formatPercent } from "@/lib/format";
import clsx from "clsx";

const FILTERS: (Stage | null)[] = [
  null,
  "watching",
  "analyzing",
  "offer_made",
  "under_contract",
  "owned",
  "passed",
  "sold",
];

async function getProperties(stage: string | undefined) {
  if (stage) {
    const result = await pool.query<Property>(
      "SELECT * FROM properties WHERE stage = $1 ORDER BY updated_at DESC",
      [stage],
    );
    return result.rows;
  }
  const result = await pool.query<Property>("SELECT * FROM properties ORDER BY updated_at DESC");
  return result.rows;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage } = await searchParams;
  const properties = await getProperties(stage);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-primary mb-6">
        Properties
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map(filter => (
          <Link
            key={filter ?? "all"}
            href={filter ? `/properties?stage=${filter}` : "/properties"}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-semibold border transition",
              stage === filter || (!stage && filter === null)
                ? "bg-brand-450 text-white border-brand-450"
                : "bg-surface text-ink-secondary border-line-border hover:border-brand-300",
            )}
          >
            {filter ? STAGE_LABELS[filter] : "All"}
          </Link>
        ))}
      </div>

      {properties.length === 0 ? (
        <p className="text-ink-muted italic">No properties in this view yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map(property => {
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

            return (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="rounded-2xl border border-line-border bg-surface p-5 hover:shadow-md transition block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-bold text-ink-primary">{property.address}</h2>
                  <StageBadge stage={property.stage} />
                </div>
                <p className="text-sm text-ink-secondary mb-3">
                  {[property.city, property.state].filter(Boolean).join(", ")}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-muted">
                    {formatCurrency(Number(property.purchase_price))}
                  </span>
                  <span
                    className={clsx(
                      "font-semibold",
                      result.monthlyCashFlow >= 0 ? "text-status-good" : "text-status-critical",
                    )}
                  >
                    {formatCurrency(result.monthlyCashFlow)}/mo
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  Cap rate {formatPercent(result.capRatePct)} &middot; Cash-on-cash{" "}
                  {formatPercent(result.cashOnCashReturnPct)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
