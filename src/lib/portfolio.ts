import { EquitySnapshot } from "./types";

export interface EquityTrendPoint {
  date: string;
  totalEquity: number;
}

/**
 * Reduces per-property equity snapshots (taken at arbitrary, independent
 * times) into a single portfolio-level equity trend: one point per distinct
 * snapshot timestamp, where each property's contribution is its most recent
 * snapshot at or before that timestamp (carried forward). A property with
 * no snapshot yet at a given timestamp contributes nothing at that point.
 */
export function computeEquityTrend(snapshots: EquitySnapshot[]): EquityTrendPoint[] {
  if (snapshots.length === 0) return [];

  const sorted = [...snapshots].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
  );

  const distinctTimestamps = Array.from(
    new Set(sorted.map(s => s.recorded_at)),
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return distinctTimestamps.map(timestamp => {
    const cutoff = new Date(timestamp).getTime();
    const latestByProperty = new Map<number, EquitySnapshot>();

    for (const snapshot of sorted) {
      if (new Date(snapshot.recorded_at).getTime() > cutoff) continue;
      const existing = latestByProperty.get(snapshot.property_id);
      if (
        !existing ||
        new Date(snapshot.recorded_at).getTime() > new Date(existing.recorded_at).getTime()
      ) {
        latestByProperty.set(snapshot.property_id, snapshot);
      }
    }

    const totalEquity = Array.from(latestByProperty.values()).reduce(
      (sum, s) => sum + (s.current_value - s.mortgage_balance),
      0,
    );

    return { date: timestamp, totalEquity };
  });
}
