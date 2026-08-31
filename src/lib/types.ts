export type Stage =
  | "watching"
  | "analyzing"
  | "offer_made"
  | "under_contract"
  | "owned"
  | "passed"
  | "sold";

export const PIPELINE_STAGES: Stage[] = [
  "watching",
  "analyzing",
  "offer_made",
  "under_contract",
];

export const STAGE_LABELS: Record<Stage, string> = {
  watching: "Watching",
  analyzing: "Analyzing",
  offer_made: "Offer made",
  under_contract: "Under contract",
  owned: "Owned",
  passed: "Passed",
  sold: "Sold",
};

export interface Property {
  id: number;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  stage: Stage;
  notes: string | null;

  purchase_price: number;
  monthly_rent: number;
  property_tax_annual: number;
  insurance_annual: number;
  hoa_monthly: number;
  maintenance_pct: number;
  vacancy_pct: number;
  management_pct: number;
  down_payment_pct: number;
  interest_rate_pct: number;
  loan_term_years: number;
  closing_costs: number;

  current_value: number | null;
  mortgage_balance: number | null;

  created_at: string;
  updated_at: string;
}

export interface EquitySnapshot {
  id: number;
  property_id: number;
  current_value: number;
  mortgage_balance: number;
  recorded_at: string;
}
