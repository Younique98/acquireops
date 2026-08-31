// Underwriting math for a single-family/small residential rental property.
// These are standard real-estate-investing formulas for planning purposes -
// not professional financial, tax, or lending advice.

export interface PropertyFinancials {
  purchasePrice: number;
  monthlyRent: number;
  propertyTaxAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  maintenancePct: number; // % of rent set aside for maintenance
  vacancyPct: number; // % of rent lost to vacancy
  managementPct: number; // % of rent paid to a property manager
  downPaymentPct: number;
  interestRatePct: number; // annual rate, e.g. 7 for 7%
  loanTermYears: number;
  closingCosts: number;
}

export interface UnderwritingResult {
  loanAmount: number;
  monthlyMortgagePayment: number;
  monthlyOperatingExpenses: number;
  monthlyCashFlow: number;
  annualNOI: number;
  capRatePct: number;
  cashInvested: number;
  cashOnCashReturnPct: number;
  onePercentRulePct: number;
  meetsOnePercentRule: boolean;
  dscr: number;
}

/** Standard amortizing loan payment (principal + interest). */
export function monthlyMortgagePayment(
  loanAmount: number,
  annualRatePct: number,
  termYears: number,
): number {
  const monthlyRate = annualRatePct / 100 / 12;
  const numPayments = termYears * 12;
  if (numPayments <= 0) return 0;
  if (monthlyRate === 0) return loanAmount / numPayments;
  const factor = Math.pow(1 + monthlyRate, numPayments);
  return (loanAmount * (monthlyRate * factor)) / (factor - 1);
}

/**
 * Full underwriting summary for a candidate or owned property.
 * NOI and cap rate exclude debt service (standard definition) - they
 * measure the property itself, not the effect of financing.
 */
export function underwrite(financials: PropertyFinancials): UnderwritingResult {
  const {
    purchasePrice,
    monthlyRent,
    propertyTaxAnnual,
    insuranceAnnual,
    hoaMonthly,
    maintenancePct,
    vacancyPct,
    managementPct,
    downPaymentPct,
    interestRatePct,
    loanTermYears,
    closingCosts,
  } = financials;

  const loanAmount = purchasePrice * (1 - downPaymentPct / 100);
  const mortgagePayment = monthlyMortgagePayment(
    loanAmount,
    interestRatePct,
    loanTermYears,
  );

  const vacancyLossMonthly = monthlyRent * (vacancyPct / 100);
  const effectiveRentMonthly = monthlyRent - vacancyLossMonthly;

  const maintenanceMonthly = monthlyRent * (maintenancePct / 100);
  const managementMonthly = monthlyRent * (managementPct / 100);
  const taxMonthly = propertyTaxAnnual / 12;
  const insuranceMonthly = insuranceAnnual / 12;

  const monthlyOperatingExpenses =
    taxMonthly + insuranceMonthly + hoaMonthly + maintenanceMonthly + managementMonthly;

  const monthlyNOI = effectiveRentMonthly - monthlyOperatingExpenses;
  const annualNOI = monthlyNOI * 12;

  const monthlyCashFlow = monthlyNOI - mortgagePayment;

  const capRatePct = purchasePrice > 0 ? (annualNOI / purchasePrice) * 100 : 0;

  const downPayment = purchasePrice * (downPaymentPct / 100);
  const cashInvested = downPayment + closingCosts;
  const annualCashFlow = monthlyCashFlow * 12;
  const cashOnCashReturnPct =
    cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : 0;

  const onePercentRulePct = purchasePrice > 0 ? (monthlyRent / purchasePrice) * 100 : 0;
  const meetsOnePercentRule = onePercentRulePct >= 1;

  const annualDebtService = mortgagePayment * 12;
  const dscr = annualDebtService > 0 ? annualNOI / annualDebtService : 0;

  return {
    loanAmount,
    monthlyMortgagePayment: mortgagePayment,
    monthlyOperatingExpenses,
    monthlyCashFlow,
    annualNOI,
    capRatePct,
    cashInvested,
    cashOnCashReturnPct,
    onePercentRulePct,
    meetsOnePercentRule,
    dscr,
  };
}

// Typical conventional cash-out refinance ceiling. A planning default, not
// a guarantee any specific lender will offer this loan-to-value.
export const DEFAULT_MAX_REFI_LTV_PCT = 75;

/** Equity available to pull via a cash-out refinance, floored at 0. */
export function availableRefiEquity(
  currentValue: number,
  mortgageBalance: number,
  maxLtvPct: number = DEFAULT_MAX_REFI_LTV_PCT,
): number {
  const maxLoan = currentValue * (maxLtvPct / 100);
  return Math.max(0, maxLoan - mortgageBalance);
}

export function equity(currentValue: number, mortgageBalance: number): number {
  return currentValue - mortgageBalance;
}

// Common landlord rule of thumb: if a property's annual cash flow is
// returning less than this against its current trapped equity, it may be
// more effective to sell or refinance and redeploy that capital. This is a
// planning heuristic, not tax or investment advice - a 1031 exchange or
// sale has real tax consequences a CPA should weigh in on.
export const LOW_RETURN_ON_EQUITY_THRESHOLD_PCT = 6;

export function returnOnEquityPct(annualCashFlow: number, currentEquity: number): number {
  return currentEquity > 0 ? (annualCashFlow / currentEquity) * 100 : 0;
}

export function shouldConsiderRedeployingCapital(
  annualCashFlow: number,
  currentEquity: number,
): boolean {
  if (currentEquity <= 0) return false;
  return returnOnEquityPct(annualCashFlow, currentEquity) < LOW_RETURN_ON_EQUITY_THRESHOLD_PCT;
}
