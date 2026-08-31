import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { underwrite } from "@/lib/underwriting";
import { computeEquityTrend } from "@/lib/portfolio";
import { Property, EquitySnapshot } from "@/lib/types";

export async function GET() {
  try {
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

    return NextResponse.json({
      ownedCount: owned.length,
      totalEquity,
      totalMonthlyCashFlow,
      blendedCapRatePct,
      equityTrend,
    });
  } catch (error) {
    console.error(
      `[DB_ERROR]: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return NextResponse.json(
      { error: "Something went wrong computing portfolio stats." },
      { status: 500 },
    );
  }
}
