"use client";

import { Trash2, TrendingUp } from "lucide-react";
import { RateHistoryEntry } from "@/types";
import { formatPercent } from "@/lib/calculations";
import { formatDateLong } from "@/lib/dates";

interface RateHistoryTimelineProps {
  entries: RateHistoryEntry[];
  currentRate: number;
  onDelete: (id: string) => void;
}

export default function RateHistoryTimeline({
  entries,
  currentRate,
  onDelete,
}: RateHistoryTimelineProps) {
  const sorted = [...entries].sort((a, b) =>
    a.effectiveDate < b.effectiveDate ? 1 : -1
  );

  return (
    <div className="glass p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-ink-secondary" strokeWidth={2} />
        <h2 className="text-lg font-semibold text-white">Rate history</h2>
      </div>

      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          No rate changes logged yet. Current rate: {formatPercent(currentRate)}.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((r, i) => {
            const isCurrent = i === 0;
            const isPenalty = r.reason.toLowerCase().includes("penalty");
            return (
              <li
                key={r.id}
                className={`flex items-start justify-between gap-3 rounded-control px-3 py-2.5 ${
                  isCurrent ? "bg-white/[0.06]" : "bg-white/[0.02]"
                }`}
              >
                <div className="min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isPenalty ? "text-bank-warn" : "text-white"
                    }`}
                  >
                    {formatPercent(r.rate)}{" "}
                    {isCurrent && (
                      <span className="ml-1 text-[10px] uppercase tracking-wider text-ink-muted">
                        current
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    {formatDateLong(r.effectiveDate)} · {r.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  className="focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/30 hover:bg-bank-red/10 hover:text-bank-red"
                  aria-label="Delete rate entry"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
