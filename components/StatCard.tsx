"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/calculations";

type Accent = "red" | "green" | "gold" | "darkred" | "neutral";

const ACCENT_STYLES: Record<Accent, { text: string; bg: string; bar: string }> = {
  red: { text: "text-bank-red", bg: "bg-bank-red/10", bar: "bg-bank-red" },
  green: { text: "text-bank-green", bg: "bg-bank-green/10", bar: "bg-bank-green" },
  gold: { text: "text-bank-gold", bg: "bg-bank-gold/10", bar: "bg-bank-gold" },
  darkred: {
    text: "text-bank-warn",
    bg: "bg-bank-darkred/20",
    bar: "bg-bank-darkred",
  },
  neutral: { text: "text-white", bg: "bg-white/10", bar: "bg-white/30" },
};

interface StatCardProps {
  label: string;
  sublabel?: string;
  value: number;
  format?: "currency" | "percent";
  icon: LucideIcon;
  accent: Accent;
  index?: number;
}

export default function StatCard({
  label,
  sublabel,
  value,
  format = "currency",
  icon: Icon,
  accent,
  index = 0,
}: StatCardProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="glass-inner relative overflow-hidden p-4 sm:p-5"
    >
      <span className={`absolute inset-y-0 left-0 w-[3px] ${styles.bar}`} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
            {label}
          </p>
          <p className="tabular mt-2 text-xl font-bold text-white sm:text-2xl">
            {format === "percent" ? formatPercent(value) : formatCurrency(value)}
          </p>
          {sublabel && (
            <p className="mt-1 truncate text-[11px] text-ink-muted">{sublabel}</p>
          )}
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control ${styles.bg}`}>
          <Icon className={`h-[18px] w-[18px] ${styles.text}`} strokeWidth={2} />
        </div>
      </div>
    </motion.div>
  );
}
