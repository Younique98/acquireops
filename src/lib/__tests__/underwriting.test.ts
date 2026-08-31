import {
  monthlyMortgagePayment,
  underwrite,
  equity,
  availableRefiEquity,
  returnOnEquityPct,
  shouldConsiderRedeployingCapital,
  DEFAULT_MAX_REFI_LTV_PCT,
} from "@/lib/underwriting";

describe("monthlyMortgagePayment", () => {
  it("matches the standard 30yr/6% amortization factor ($5.9955 per $1,000)", () => {
    // Well-known amortization table value: a $160,000 loan at 6% over 30
    // years pays $959.28/mo (160 * $5.9955 per $1,000 borrowed).
    expect(monthlyMortgagePayment(160000, 6, 30)).toBeCloseTo(959.28, 0);
  });

  it("divides evenly for a 0% interest loan", () => {
    expect(monthlyMortgagePayment(120000, 0, 10)).toBeCloseTo(1000, 5);
  });

  it("returns 0 for a zero-length term", () => {
    expect(monthlyMortgagePayment(100000, 6, 0)).toBe(0);
  });
});

describe("underwrite", () => {
  const baseFinancials = {
    purchasePrice: 200000,
    monthlyRent: 2000,
    propertyTaxAnnual: 2400,
    insuranceAnnual: 1200,
    hoaMonthly: 0,
    maintenancePct: 5,
    vacancyPct: 5,
    managementPct: 8,
    downPaymentPct: 20,
    interestRatePct: 6,
    loanTermYears: 30,
    closingCosts: 4000,
  };

  it("computes cash flow, cap rate, cash-on-cash, and DSCR correctly", () => {
    const result = underwrite(baseFinancials);

    expect(result.loanAmount).toBe(160000);
    expect(result.monthlyMortgagePayment).toBeCloseTo(959.28, 0);
    expect(result.monthlyOperatingExpenses).toBeCloseTo(560, 2);
    expect(result.monthlyCashFlow).toBeCloseTo(380.72, 0);
    expect(result.annualNOI).toBeCloseTo(16080, 0);
    expect(result.capRatePct).toBeCloseTo(8.04, 1);
    expect(result.cashInvested).toBe(44000);
    expect(result.cashOnCashReturnPct).toBeCloseTo(10.38, 1);
    expect(result.dscr).toBeCloseTo(1.397, 2);
  });

  it("flags the 1% rule correctly at the boundary", () => {
    const atBoundary = underwrite({ ...baseFinancials, monthlyRent: 2000 });
    expect(atBoundary.onePercentRulePct).toBeCloseTo(1, 5);
    expect(atBoundary.meetsOnePercentRule).toBe(true);

    const belowBoundary = underwrite({ ...baseFinancials, monthlyRent: 1999 });
    expect(belowBoundary.meetsOnePercentRule).toBe(false);
  });
});

describe("equity and refinance helpers", () => {
  it("computes equity as current value minus mortgage balance", () => {
    expect(equity(300000, 150000)).toBe(150000);
  });

  it("computes available refi equity at the default 75% LTV", () => {
    expect(availableRefiEquity(300000, 150000)).toBe(75000);
    expect(DEFAULT_MAX_REFI_LTV_PCT).toBe(75);
  });

  it("floors available refi equity at 0 for an underwater property", () => {
    expect(availableRefiEquity(100000, 200000)).toBe(0);
  });

  it("respects a custom max LTV", () => {
    expect(availableRefiEquity(300000, 100000, 80)).toBe(140000);
  });
});

describe("return on equity and redeploy-capital flag", () => {
  it("computes return on equity as a percentage", () => {
    expect(returnOnEquityPct(9000, 150000)).toBeCloseTo(6, 5);
  });

  it("does not flag at or above the threshold", () => {
    expect(shouldConsiderRedeployingCapital(9000, 150000)).toBe(false); // exactly 6%
    expect(shouldConsiderRedeployingCapital(15000, 150000)).toBe(false); // 10%
  });

  it("flags below the threshold", () => {
    expect(shouldConsiderRedeployingCapital(8000, 150000)).toBe(true); // ~5.3%
  });

  it("never flags a property with no or negative equity", () => {
    expect(shouldConsiderRedeployingCapital(-5000, 0)).toBe(false);
    expect(shouldConsiderRedeployingCapital(-5000, -10000)).toBe(false);
  });
});
