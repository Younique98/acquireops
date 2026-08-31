import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Stage } from "@/lib/types";

const VALID_STAGES: Stage[] = [
  "watching",
  "analyzing",
  "offer_made",
  "under_contract",
  "owned",
  "passed",
  "sold",
];

export async function GET(request: NextRequest) {
  const stage = request.nextUrl.searchParams.get("stage");

  try {
    if (stage) {
      if (!VALID_STAGES.includes(stage as Stage)) {
        return NextResponse.json({ error: "Invalid stage value." }, { status: 400 });
      }
      const result = await pool.query(
        "SELECT * FROM properties WHERE stage = $1 ORDER BY updated_at DESC",
        [stage],
      );
      return NextResponse.json(result.rows);
    }

    const result = await pool.query("SELECT * FROM properties ORDER BY updated_at DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(
      `[DB_ERROR]: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return NextResponse.json(
      { error: "Something went wrong retrieving properties." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { address, purchasePrice, monthlyRent } = body;
  if (!address || typeof address !== "string") {
    return NextResponse.json({ error: "Address is required." }, { status: 400 });
  }
  if (typeof purchasePrice !== "number" || purchasePrice <= 0) {
    return NextResponse.json(
      { error: "Purchase price must be a positive number." },
      { status: 400 },
    );
  }
  if (typeof monthlyRent !== "number" || monthlyRent < 0) {
    return NextResponse.json(
      { error: "Monthly rent must be a non-negative number." },
      { status: 400 },
    );
  }

  try {
    const result = await pool.query(
      `INSERT INTO properties (
         address, city, state, zip, stage, notes,
         purchase_price, monthly_rent, property_tax_annual, insurance_annual,
         hoa_monthly, maintenance_pct, vacancy_pct, management_pct,
         down_payment_pct, interest_rate_pct, loan_term_years, closing_costs
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING *`,
      [
        address,
        body.city ?? null,
        body.state ?? null,
        body.zip ?? null,
        VALID_STAGES.includes(body.stage) ? body.stage : "watching",
        body.notes ?? null,
        purchasePrice,
        monthlyRent,
        body.propertyTaxAnnual ?? 0,
        body.insuranceAnnual ?? 0,
        body.hoaMonthly ?? 0,
        body.maintenancePct ?? 5,
        body.vacancyPct ?? 5,
        body.managementPct ?? 0,
        body.downPaymentPct ?? 20,
        body.interestRatePct ?? 7,
        body.loanTermYears ?? 30,
        body.closingCosts ?? 0,
      ],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(
      `[DB_ERROR]: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return NextResponse.json(
      { error: "Something went wrong creating the property." },
      { status: 500 },
    );
  }
}
