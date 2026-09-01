import { Stage, STAGE_LABELS } from "@/lib/types";
import clsx from "clsx";

// The four non-terminal stages are a genuine sequence a deal moves through
// in order, so a dot-progress indicator earns its place here (vs. decoration
// for its own sake) - filled dots show how far along the pipeline this deal
// is. Terminal states (owned/passed/sold) aren't progression, so they get a
// plain solid badge instead of continuing the dots.
const PIPELINE_STAGES: Stage[] = ["watching", "analyzing", "offer_made", "under_contract"];

const TERMINAL_STYLES: Partial<Record<Stage, string>> = {
  owned: "bg-status-good text-white",
  passed: "bg-surface-2 text-ink-secondary border border-line",
  sold: "bg-gray-700 text-white",
};

export const StageBadge = ({ stage }: { stage: Stage }) => {
  const pipelineIndex = PIPELINE_STAGES.indexOf(stage);

  if (pipelineIndex === -1) {
    return (
      <span
        className={clsx(
          "inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
          TERMINAL_STYLES[stage],
        )}
      >
        {STAGE_LABELS[stage]}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border border-line bg-surface text-ink-secondary">
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {PIPELINE_STAGES.map((s, i) => (
          <span
            key={s}
            className={clsx("w-1.5 h-1.5 rounded-full", i <= pipelineIndex ? "bg-navy" : "bg-line")}
          />
        ))}
      </span>
      {STAGE_LABELS[stage]}
    </span>
  );
};
