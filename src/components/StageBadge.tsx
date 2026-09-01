import { Stage, STAGE_LABELS } from "@/lib/types";
import clsx from "clsx";

// Pipeline stages (watching -> under_contract) use the ordinal blue ramp to
// show progression. Owned/passed/sold are terminal states, not progression,
// so they get distinct treatments rather than continuing the ramp.
//
// White text only clears 4.5:1 contrast from brand-500 onward - brand-300
// and brand-450 (offer_made/under_contract's original steps) both failed
// WCAG AA with white text, so those two now sit on the darker end of the
// ramp that actually works (500/550) rather than continuing visually from
// analyzing's lighter steps. bg-ink-secondary flips to a light gray in
// dark mode (correct for its usual job as body text), which made "sold"
// nearly invisible as a dark-mode badge fill (1.79:1) - swapped for a
// fixed neutral that doesn't move with theme.
const STAGE_STYLES: Record<Stage, string> = {
  watching: "bg-brand-100 text-brand-600",
  analyzing: "bg-brand-200 text-brand-600",
  offer_made: "bg-brand-500 text-white",
  under_contract: "bg-brand-550 text-white",
  owned: "bg-status-good text-white",
  passed: "bg-line-grid text-ink-secondary",
  sold: "bg-gray-700 text-white",
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
