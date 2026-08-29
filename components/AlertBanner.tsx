"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/calculations";

interface AlertBannerProps {
  daysPastDue: number;
  totalToCatchUp: number;
  onPayNow: () => void;
  onViewPlan: () => void;
}

export default function AlertBanner({
  daysPastDue,
  totalToCatchUp,
  onPayNow,
  onViewPlan,
}: AlertBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-card border border-bank-darkred/40 bg-bank-darkred/20 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-bank-darkred/40">
          <AlertTriangle className="h-[18px] w-[18px] text-bank-warn" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">
            Missed payment — {daysPastDue} day{daysPastDue === 1 ? "" : "s"} overdue
          </p>
          <p className="mt-0.5 text-sm text-white/70">
            Pay {formatCurrency(totalToCatchUp)} to stop penalty interest and clear
            the late fee.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={onPayNow} className="btn-danger">
              Pay now
            </button>
            <button type="button" onClick={onViewPlan} className="btn-secondary">
              View recovery plan
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
