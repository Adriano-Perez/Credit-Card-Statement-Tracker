"use client";

import { formatCurrency, formatPercent, RateBreakdownEntry } from "@/lib/calculations";

interface RateBreakdownProps {
  entries: RateBreakdownEntry[];
}

export default function RateBreakdown({ entries }: RateBreakdownProps) {
  if (entries.length === 0) return null;
  const total = entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="glass p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Balance by rate
      </h2>
      <ul className="flex flex-col gap-3">
        {entries.map((e, i) => {
          const pct = total > 0 ? (e.amount / total) * 100 : 0;
          return (
            <li key={`${e.rate}-${e.label}-${i}`}>
              <div className="mb-1.5 flex items-baseline justify-between text-sm">
                <span className="text-white/80">
                  {formatPercent(e.rate)}{" "}
                  <span className="text-ink-muted">— {e.label}</span>
                </span>
                <span className="tabular font-medium text-white">
                  {formatCurrency(e.amount)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-bank-red"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
