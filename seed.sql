CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(120),
    state VARCHAR(2),
    zip VARCHAR(10),
    stage VARCHAR(20) NOT NULL DEFAULT 'watching' CHECK (
        stage IN ('watching', 'analyzing', 'offer_made', 'under_contract', 'owned', 'passed', 'sold')
    ),
    notes TEXT,

    -- Underwriting inputs
    purchase_price NUMERIC(12, 2) NOT NULL,
    monthly_rent NUMERIC(10, 2) NOT NULL,
    property_tax_annual NUMERIC(10, 2) NOT NULL DEFAULT 0,
    insurance_annual NUMERIC(10, 2) NOT NULL DEFAULT 0,
    hoa_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0,
    maintenance_pct NUMERIC(5, 2) NOT NULL DEFAULT 5,
    vacancy_pct NUMERIC(5, 2) NOT NULL DEFAULT 5,
    management_pct NUMERIC(5, 2) NOT NULL DEFAULT 0,
    down_payment_pct NUMERIC(5, 2) NOT NULL DEFAULT 20,
    interest_rate_pct NUMERIC(5, 3) NOT NULL DEFAULT 7,
    loan_term_years INT NOT NULL DEFAULT 30,
    closing_costs NUMERIC(10, 2) NOT NULL DEFAULT 0,

    -- Ownership tracking (only meaningful once stage = 'owned' or 'sold')
    current_value NUMERIC(12, 2),
    mortgage_balance NUMERIC(12, 2),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Historical snapshots of value/equity, written whenever current_value or
-- mortgage_balance changes, so the portfolio dashboard can chart a trend.
CREATE TABLE IF NOT EXISTS equity_snapshots (
    id SERIAL PRIMARY KEY,
    property_id INT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    current_value NUMERIC(12, 2) NOT NULL,
    mortgage_balance NUMERIC(12, 2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS equity_snapshots_property_id_idx ON equity_snapshots(property_id);

-- One example row so the app isn't an empty shell on first run. Delete it
-- once you've added your real properties.
INSERT INTO properties (
    address, city, state, zip, stage, notes,
    purchase_price, monthly_rent, property_tax_annual, insurance_annual,
    hoa_monthly, maintenance_pct, vacancy_pct, management_pct,
    down_payment_pct, interest_rate_pct, loan_term_years, closing_costs,
    current_value, mortgage_balance
) VALUES (
    '123 Example St', 'Example City', 'TX', '75001', 'owned',
    'Sample property - delete once you add your real portfolio.',
    200000, 2000, 2400, 1200,
    0, 5, 5, 8,
    20, 6, 30, 4000,
    230000, 152000
) ON CONFLICT DO NOTHING;
