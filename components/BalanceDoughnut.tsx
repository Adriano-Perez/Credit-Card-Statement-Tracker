"use client";

import { Chart as ChartJS, ArcElement, Tooltip, ChartOptions } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/calculations";
import { DerivedStatement } from "@/types";

ChartJS.register(ArcElement, Tooltip);

export type SliceKey = "safe" | "newSpending" | "accruing" | "pastDue";

interface BalanceDoughnutProps {
  derived: DerivedStatement;
  onSliceClick: (key: SliceKey) => void;
}

const SLICE_META: { key: SliceKey; label: string; color: string }[] = [
  { key: "safe", label: "Safe balance", color: "#2C7A4D" },
  { key: "newSpending", label: "New spending", color: "#C9A84C" },
  { key: "accruing", label: "Accruing interest", color: "#D1453B" },
  { key: "pastDue", label: "Past due", color: "#8B0000" },
];

export default function BalanceDoughnut({ derived, onSliceClick }: BalanceDoughnutProps) {
  const values = SLICE_META.map((s) => derived.slices[s.key]);
  const total = values.reduce((a, b) => a + b, 0);
  const isEmpty = total <= 0.005;

  // Only slices with a nonzero amount are drawn — this is how the green
  // slice actually "disappears" once paid off, rather than showing a
  // zero-width sliver.
  const visible = SLICE_META.map((s, i) => ({ ...s, value: values[i] })).filter(
    (s) => s.value > 0.005
  );

  const data = {
    labels: (isEmpty ? SLICE_META : visible).map((s) => s.label),
    datasets: [
      {
        data: isEmpty ? [1] : visible.map((s) => s.value),
        backgroundColor: isEmpty ? ["rgba(255,255,255,0.08)"] : visible.map((s) => s.color),
        borderColor: "#0A0A0F",
        borderWidth: 3,
        hoverOffset: isEmpty ? 0 : 6,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    cutout: "72%",
    responsive: true,
    maintainAspectRatio: true,
    animation: { animateRotate: true, duration: 600, easing: "easeOutQuart" },
    onClick: (_evt, elements) => {
      if (isEmpty || elements.length === 0) return;
      const idx = elements[0].index;
      onSliceClick(visible[idx].key);
    },
    plugins: {
      tooltip: {
        enabled: !isEmpty,
        backgroundColor: "#15151D",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.parsed)}`,
        },
      },
      legend: { display: false },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-5"
    >
      <div className="relative mx-auto aspect-square w-full max-w-[220px] cursor-pointer">
        <Doughnut data={data} options={options} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] uppercase tracking-wider text-ink-secondary">
            Total balance
          </span>
          <span className="tabular text-[1.55rem] font-bold text-white">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <ul className="grid w-full grid-cols-2 gap-2">
        {SLICE_META.map((s) => {
          const value = derived.slices[s.key];
          const isActive = value > 0.005;
          return (
            <li
              key={s.key}
              onClick={() => isActive && onSliceClick(s.key)}
              className={`flex items-center justify-between gap-2 rounded-control bg-white/[0.04] px-3 py-2 ${
                isActive ? "cursor-pointer hover:bg-white/[0.08]" : "opacity-35"
              }`}
            >
              <span className="flex items-center gap-1.5 text-[11px] text-ink-secondary">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                  aria-hidden
                />
                <span className="truncate">{s.label}</span>
              </span>
              <span className="tabular text-[12px] font-medium text-white">
                {formatCurrency(value)}
              </span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
