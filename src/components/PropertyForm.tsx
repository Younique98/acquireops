"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Property, Stage, STAGE_LABELS } from "@/lib/types";

type TPropertyFormData = {
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  stage: Stage;
  notes?: string;
  purchasePrice: number;
  monthlyRent: number;
  propertyTaxAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  maintenancePct: number;
  vacancyPct: number;
  managementPct: number;
  downPaymentPct: number;
  interestRatePct: number;
  loanTermYears: number;
  closingCosts: number;
  currentValue?: number;
  mortgageBalance?: number;
};

const ALL_STAGES: Stage[] = [
  "watching",
  "analyzing",
  "offer_made",
  "under_contract",
  "owned",
  "passed",
  "sold",
];

const inputClass =
  "w-full border border-line-border rounded-lg px-3 py-2 bg-surface text-ink-primary focus:outline-none focus:ring-2 focus:ring-brand-300";
const labelClass = "block text-sm font-semibold text-ink-secondary mb-1";

export const PropertyForm = ({ property }: { property?: Property }) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(property);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<TPropertyFormData>({
      defaultValues: property
        ? {
            address: property.address,
            city: property.city ?? "",
            state: property.state ?? "",
            zip: property.zip ?? "",
            stage: property.stage,
            notes: property.notes ?? "",
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
            currentValue: property.current_value ? Number(property.current_value) : undefined,
            mortgageBalance: property.mortgage_balance
              ? Number(property.mortgage_balance)
              : undefined,
          }
        : {
            stage: "watching",
            maintenancePct: 5,
            vacancyPct: 5,
            managementPct: 0,
            downPaymentPct: 20,
            interestRatePct: 7,
            loanTermYears: 30,
            closingCosts: 0,
            propertyTaxAnnual: 0,
            insuranceAnnual: 0,
            hoaMonthly: 0,
          },
    });

  const onSubmit = async (data: TPropertyFormData) => {
    setError(null);
    const payload = {
      ...data,
      purchasePrice: Number(data.purchasePrice),
      monthlyRent: Number(data.monthlyRent),
      propertyTaxAnnual: Number(data.propertyTaxAnnual),
      insuranceAnnual: Number(data.insuranceAnnual),
      hoaMonthly: Number(data.hoaMonthly),
      maintenancePct: Number(data.maintenancePct),
      vacancyPct: Number(data.vacancyPct),
      managementPct: Number(data.managementPct),
      downPaymentPct: Number(data.downPaymentPct),
      interestRatePct: Number(data.interestRatePct),
      loanTermYears: Number(data.loanTermYears),
      closingCosts: Number(data.closingCosts),
      currentValue: data.currentValue !== undefined && `${data.currentValue}` !== "" ? Number(data.currentValue) : undefined,
      mortgageBalance:
        data.mortgageBalance !== undefined && `${data.mortgageBalance}` !== ""
          ? Number(data.mortgageBalance)
          : undefined,
    };

    try {
      const response = await fetch(
        isEdit ? `/api/properties/${property!.id}` : "/api/properties",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save property.");
      }
      const saved = await response.json();
      router.push(`/dashboard/properties/${saved.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {error && (
        <p className="text-status-critical text-sm font-semibold" role="alert">
          {error}
        </p>
      )}

      <section>
        <h2 className="text-lg font-bold text-ink-primary mb-3">Property</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="address">Address</label>
            <input id="address" className={inputClass} {...register("address", { required: "Address is required." })} />
            {errors.address && <p className="text-status-critical text-sm mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="city">City</label>
            <input id="city" className={inputClass} {...register("city")} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass} htmlFor="state">State</label>
              <input id="state" className={inputClass} maxLength={2} {...register("state")} />
            </div>
            <div>
              <label className={labelClass} htmlFor="zip">ZIP</label>
              <input id="zip" className={inputClass} {...register("zip")} />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="stage">Stage</label>
            <select id="stage" className={inputClass} {...register("stage")}>
              {ALL_STAGES.map(stage => (
                <option key={stage} value={stage}>{STAGE_LABELS[stage]}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="notes">Notes</label>
            <textarea id="notes" rows={3} className={inputClass} {...register("notes")} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-ink-primary mb-3">Underwriting inputs</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="purchasePrice">Purchase price ($)</label>
            <input id="purchasePrice" type="number" step="0.01" className={inputClass} {...register("purchasePrice", { required: "Required", valueAsNumber: true, min: { value: 0.01, message: "Must be positive" } })} />
            {errors.purchasePrice && <p className="text-status-critical text-sm mt-1">{errors.purchasePrice.message}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="monthlyRent">Monthly rent ($)</label>
            <input id="monthlyRent" type="number" step="0.01" className={inputClass} {...register("monthlyRent", { required: "Required", valueAsNumber: true, min: { value: 0, message: "Must be 0 or more" } })} />
            {errors.monthlyRent && <p className="text-status-critical text-sm mt-1">{errors.monthlyRent.message}</p>}
          </div>
          <div>
            <label className={labelClass} htmlFor="propertyTaxAnnual">Property tax (annual, $)</label>
            <input id="propertyTaxAnnual" type="number" step="0.01" className={inputClass} {...register("propertyTaxAnnual", { valueAsNumber: true })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="insuranceAnnual">Insurance (annual, $)</label>
            <input id="insuranceAnnual" type="number" step="0.01" className={inputClass} {...register("insuranceAnnual", { valueAsNumber: true })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="hoaMonthly">HOA (monthly, $)</label>
            <input id="hoaMonthly" type="number" step="0.01" className={inputClass} {...register("hoaMonthly", { valueAsNumber: true })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="closingCosts">Closing costs ($)</label>
            <input id="closingCosts" type="number" step="0.01" className={inputClass} {...register("closingCosts", { valueAsNumber: true })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="maintenancePct">Maintenance (% of rent)</label>
            <input id="maintenancePct" type="number" step="0.1" className={inputClass} {...register("maintenancePct", { valueAsNumber: true })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="vacancyPct">Vacancy (% of rent)</label>
            <input id="vacancyPct" type="number" step="0.1" className={inputClass} {...register("vacancyPct", { valueAsNumber: true })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="managementPct">Management (% of rent)</label>
            <input id="managementPct" type="number" step="0.1" className={inputClass} {...register("managementPct", { valueAsNumber: true })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="downPaymentPct">Down payment (%)</label>
            <input id="downPaymentPct" type="number" step="0.1" className={inputClass} {...register("downPaymentPct", { valueAsNumber: true })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="interestRatePct">Interest rate (%)</label>
            <input id="interestRatePct" type="number" step="0.01" className={inputClass} {...register("interestRatePct", { valueAsNumber: true })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="loanTermYears">Loan term (years)</label>
            <input id="loanTermYears" type="number" className={inputClass} {...register("loanTermYears", { valueAsNumber: true })} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-ink-primary mb-1">Ownership</h2>
        <p className="text-xs text-ink-muted mb-3">
          Only needed once this property is owned - used for equity tracking and the
          portfolio dashboard.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="currentValue">Current value ($)</label>
            <input id="currentValue" type="number" step="0.01" className={inputClass} {...register("currentValue", { valueAsNumber: true })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="mortgageBalance">Mortgage balance ($)</label>
            <input id="mortgageBalance" type="number" step="0.01" className={inputClass} {...register("mortgageBalance", { valueAsNumber: true })} />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-3 rounded-full bg-brand-450 text-white font-semibold hover:bg-brand-500 transition disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Add property"}
      </button>
    </form>
  );
};
