import clsx from "clsx";

interface MetricCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "critical";
  helpText?: string;
}

const TONE_STYLES = {
  neutral: "text-ink-primary",
  good: "text-status-good",
  critical: "text-status-critical",
};

export const MetricCard = ({ label, value, tone = "neutral", helpText }: MetricCardProps) => (
  <div className="rounded-2xl border border-line-border bg-surface p-5">
    <p className="text-sm font-semibold text-ink-secondary">{label}</p>
    <p className={clsx("mt-1 text-3xl font-extrabold tabular-nums", TONE_STYLES[tone])}>
      {value}
    </p>
    {helpText && <p className="mt-1 text-xs text-ink-muted">{helpText}</p>}
  </div>
);
