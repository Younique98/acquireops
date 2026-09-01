CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS properties_user_id_idx ON properties(user_id);

-- Historical snapshots of value/equity, written whenever current_value or
-- mortgage_balance changes, so the portfolio dashboard can chart a trend.
-- Ownership is transitive through properties.user_id - every query reaches
-- this table via a property_id list already scoped to the current user.
CREATE TABLE IF NOT EXISTS equity_snapshots (
    id SERIAL PRIMARY KEY,
    property_id INT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    current_value NUMERIC(12, 2) NOT NULL,
    mortgage_balance NUMERIC(12, 2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS equity_snapshots_property_id_idx ON equity_snapshots(property_id);

-- One demo account + example property so the app isn't an empty shell on
-- first run. Password is "demo1234" (bcrypt hash below). Sign up for your
-- own real account instead of reusing this one - delete it once you have.
INSERT INTO users (email, password_hash, name)
VALUES (
    'demo@example.com',
    '$2a$10$iwgDgndrQn/MY9l21VPzb.KcagM60LKEfPqbf5hZIG14m7WM2oBR.',
    'Demo Investor'
) ON CONFLICT DO NOTHING;

INSERT INTO properties (
    user_id, address, city, state, zip, stage, notes,
    purchase_price, monthly_rent, property_tax_annual, insurance_annual,
    hoa_monthly, maintenance_pct, vacancy_pct, management_pct,
    down_payment_pct, interest_rate_pct, loan_term_years, closing_costs,
    current_value, mortgage_balance
)
SELECT
    id, '123 Example St', 'Example City', 'TX', '75001', 'owned',
    'Sample property - delete once you add your real portfolio.',
    200000, 2000, 2400, 1200,
    0, 5, 5, 8,
    20, 6, 30, 4000,
    230000, 152000
FROM users WHERE email = 'demo@example.com'
ON CONFLICT DO NOTHING;
