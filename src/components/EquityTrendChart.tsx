"use client";

import { useMemo, useState } from "react";
import { EquityTrendPoint } from "@/lib/portfolio";
import { formatCurrency } from "@/lib/format";

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 28, left: 16 };

export const EquityTrendChart = ({ points }: { points: EquityTrendPoint[] }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { path, areaPath, scaleX, scaleY, minY, maxY } = useMemo(() => {
    const plotWidth = WIDTH - PADDING.left - PADDING.right;
    const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

    if (points.length === 0) {
      return { path: "", areaPath: "", scaleX: () => 0, scaleY: () => 0, minY: 0, maxY: 0 };
    }

    const values = points.map(p => p.totalEquity);
    const rawMin = Math.min(...values, 0);
    const rawMax = Math.max(...values, 0);
    const span = rawMax - rawMin || 1;
    const yMin = rawMin - span * 0.1;
    const yMax = rawMax + span * 0.1;

    const scaleX = (index: number) =>
      points.length === 1
        ? PADDING.left + plotWidth / 2
        : PADDING.left + (index / (points.length - 1)) * plotWidth;

    const scaleY = (value: number) =>
      PADDING.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;

    const linePoints = points.map((p, i) => `${scaleX(i)},${scaleY(p.totalEquity)}`);
    const path = `M ${linePoints.join(" L ")}`;

    const areaPath =
      `M ${scaleX(0)},${scaleY(0)} ` +
      points.map((p, i) => `L ${scaleX(i)},${scaleY(p.totalEquity)}`).join(" ") +
      ` L ${scaleX(points.length - 1)},${scaleY(0)} Z`;

    return { path, areaPath, scaleX, scaleY, minY: yMin, maxY: yMax };
  }, [points]);

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-muted text-sm">
        No equity history yet. Once you update a property&rsquo;s value or mortgage
        balance, this chart will start tracking your portfolio equity over time.
      </div>
    );
  }

  const zeroLineY = scaleY(0);
  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const lastPoint = points[points.length - 1];

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 relative">
      <p className="text-sm font-semibold text-ink-secondary mb-2">Portfolio equity over time</p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {minY < 0 && maxY > 0 && (
          <line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={zeroLineY}
            y2={zeroLineY}
            stroke="var(--border)"
            strokeWidth={1}
          />
        )}

        <path d={areaPath} fill="var(--navy)" fillOpacity={0.1} stroke="none" />
        <path
          d={path}
          fill="none"
          stroke="var(--navy)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* End marker + value label */}
        <circle
          cx={scaleX(points.length - 1)}
          cy={scaleY(lastPoint.totalEquity)}
          r={4}
          fill="var(--navy)"
          stroke="var(--surface)"
          strokeWidth={2}
        />
        <text
          x={scaleX(points.length - 1)}
          y={scaleY(lastPoint.totalEquity) - 10}
          textAnchor="end"
          className="fill-ink-primary text-[11px] font-semibold"
        >
          {formatCurrency(lastPoint.totalEquity)}
        </text>

        {/* Hover targets */}
        {points.map((p, i) => (
          <rect
            key={p.date}
            x={scaleX(i) - (WIDTH / points.length) / 2}
            y={0}
            width={WIDTH / points.length}
            height={HEIGHT}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
          />
        ))}

        {hovered && (
          <>
            <line
              x1={scaleX(hoverIndex!)}
              x2={scaleX(hoverIndex!)}
              y1={PADDING.top}
              y2={HEIGHT - PADDING.bottom}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <circle
              cx={scaleX(hoverIndex!)}
              cy={scaleY(hovered.totalEquity)}
              r={4}
              fill="var(--navy)"
              stroke="var(--surface)"
              strokeWidth={2}
            />
          </>
        )}
      </svg>

      {hovered && (
        <div className="absolute top-5 right-5 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-sm">
          <p className="font-semibold text-ink-primary">
            {formatCurrency(hovered.totalEquity)}
          </p>
          <p className="text-ink-muted">
            {new Date(hovered.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      )}
    </div>
  );
};
