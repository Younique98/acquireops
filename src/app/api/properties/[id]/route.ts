import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Stage } from "@/lib/types";
import { getCurrentUser } from "@/lib/session";

const VALID_STAGES: Stage[] = [
  "watching",
  "analyzing",
  "offer_made",
  "under_contract",
  "owned",
  "passed",
  "sold",
];

// Maps request body keys (camelCase) to DB columns (snake_case). Only keys
// present in the request body are ever included in the UPDATE.
const UPDATABLE_FIELDS: Record<string, string> = {
  address: "address",
  city: "city",
  state: "state",
  zip: "zip",
  stage: "stage",
  notes: "notes",
  purchasePrice: "purchase_price",
  monthlyRent: "monthly_rent",
  propertyTaxAnnual: "property_tax_annual",
  insuranceAnnual: "insurance_annual",
  hoaMonthly: "hoa_monthly",
  maintenancePct: "maintenance_pct",
  vacancyPct: "vacancy_pct",
  managementPct: "management_pct",
  downPaymentPct: "down_payment_pct",
  interestRatePct: "interest_rate_pct",
  loanTermYears: "loan_term_years",
  closingCosts: "closing_costs",
  currentValue: "current_value",
  mortgageBalance: "mortgage_balance",
};

function parseId(id: string): number | null {
  const numeric = parseInt(id, 10);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid property id." }, { status: 400 });
  }

  try {
    const result = await pool.query("SELECT * FROM properties WHERE id = $1 AND user_id = $2", [
      id,
      user.id,
    ]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(
      `[DB_ERROR]: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return NextResponse.json(
      { error: "Something went wrong retrieving the property." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid property id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.stage !== undefined && !VALID_STAGES.includes(body.stage)) {
    return NextResponse.json({ error: "Invalid stage value." }, { status: 400 });
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const [bodyKey, column] of Object.entries(UPDATABLE_FIELDS)) {
    if (Object.prototype.hasOwnProperty.call(body, bodyKey)) {
      setClauses.push(`${column} = $${paramIndex}`);
      values.push(body[bodyKey]);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 });
  }

  setClauses.push(`updated_at = now()`);

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      values.push(id, user.id);
      const updateResult = await client.query(
        `UPDATE properties SET ${setClauses.join(", ")} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
        values,
      );

      if (updateResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ error: "Property not found." }, { status: 404 });
      }

      const updated = updateResult.rows[0];

      const valueChanged =
        Object.prototype.hasOwnProperty.call(body, "currentValue") ||
        Object.prototype.hasOwnProperty.call(body, "mortgageBalance");

      if (valueChanged && updated.current_value !== null && updated.mortgage_balance !== null) {
        await client.query(
          `INSERT INTO equity_snapshots (property_id, current_value, mortgage_balance)
           VALUES ($1, $2, $3)`,
          [id, updated.current_value, updated.mortgage_balance],
        );
      }

      await client.query("COMMIT");
      return NextResponse.json(updated);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      `[DB_ERROR]: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return NextResponse.json(
      { error: "Something went wrong updating the property." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseId((await params).id);
  if (id === null) {
    return NextResponse.json({ error: "Invalid property id." }, { status: 400 });
  }

  try {
    const result = await pool.query(
      "DELETE FROM properties WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, user.id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(
      `[DB_ERROR]: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return NextResponse.json(
      { error: "Something went wrong deleting the property." },
      { status: 500 },
    );
  }
}
