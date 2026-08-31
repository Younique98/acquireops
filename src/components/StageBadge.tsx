import { Stage, STAGE_LABELS } from "@/lib/types";
import clsx from "clsx";

// Pipeline stages (watching -> under_contract) use the ordinal blue ramp to
// show progression. Owned/passed/sold are terminal states, not progression,
// so they get distinct treatments rather than continuing the ramp.
const STAGE_STYLES: Record<Stage, string> = {
  watching: "bg-brand-100 text-brand-600",
  analyzing: "bg-brand-200 text-brand-600",
  offer_made: "bg-brand-300 text-white",
  under_contract: "bg-brand-450 text-white",
  owned: "bg-status-good text-white",
  passed: "bg-line-grid text-ink-secondary",
  sold: "bg-ink-secondary text-white",
};

export const StageBadge = ({ stage }: { stage: Stage }) => (
  <span
    className={clsx(
      "inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
      STAGE_STYLES[stage],
    )}
  >
    {STAGE_LABELS[stage]}
  </span>
);
