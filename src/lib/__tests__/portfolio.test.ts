import { computeEquityTrend } from "@/lib/portfolio";
import { EquitySnapshot } from "@/lib/types";

const snapshot = (
  id: number,
  property_id: number,
  current_value: number,
  mortgage_balance: number,
  recorded_at: string,
): EquitySnapshot => ({ id, property_id, current_value, mortgage_balance, recorded_at });

describe("computeEquityTrend", () => {
  it("returns an empty array for no snapshots", () => {
    expect(computeEquityTrend([])).toEqual([]);
  });

  it("carries each property's most recent value forward at each timestamp", () => {
    const snapshots: EquitySnapshot[] = [
      snapshot(1, 1, 200000, 160000, "2026-01-01T00:00:00Z"), // property 1, equity 40k
      snapshot(2, 2, 150000, 120000, "2026-02-01T00:00:00Z"), // property 2, equity 30k
      snapshot(3, 1, 210000, 155000, "2026-03-01T00:00:00Z"), // property 1 updated, equity 55k
    ];

    const trend = computeEquityTrend(snapshots);

    expect(trend).toHaveLength(3);

    // Jan: only property 1 exists yet
    expect(trend[0].date).toBe("2026-01-01T00:00:00Z");
    expect(trend[0].totalEquity).toBe(40000);

    // Feb: property 1 (still at Jan's value) + property 2
    expect(trend[1].date).toBe("2026-02-01T00:00:00Z");
    expect(trend[1].totalEquity).toBe(70000);

    // Mar: property 1 updated to its new value, property 2 unchanged
    expect(trend[2].date).toBe("2026-03-01T00:00:00Z");
    expect(trend[2].totalEquity).toBe(85000);
  });

  it("handles unsorted input the same as sorted input", () => {
    const sorted: EquitySnapshot[] = [
      snapshot(1, 1, 100000, 50000, "2026-01-01T00:00:00Z"),
      snapshot(2, 1, 110000, 45000, "2026-02-01T00:00:00Z"),
    ];
    const shuffled = [sorted[1], sorted[0]];

    expect(computeEquityTrend(shuffled)).toEqual(computeEquityTrend(sorted));
  });

  it("sums multiple properties at the same timestamp", () => {
    const snapshots: EquitySnapshot[] = [
      snapshot(1, 1, 200000, 150000, "2026-01-01T00:00:00Z"),
      snapshot(2, 2, 100000, 60000, "2026-01-01T00:00:00Z"),
    ];

    const trend = computeEquityTrend(snapshots);
    expect(trend).toHaveLength(1);
    expect(trend[0].totalEquity).toBe(90000); // 50k + 40k
  });
});
