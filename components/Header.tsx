"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, Settings, TrendingUp, TrendingDown } from "lucide-react";
import { formatPercent } from "@/lib/calculations";

interface HeaderProps {
  bankName: string;
  currentRate: number;
  rateDirection?: "up" | "down" | null;
}

export default function Header({ bankName, currentRate, rateDirection }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="glass-inner flex h-11 w-11 items-center justify-center">
          <CreditCard className="h-5 w-5 text-bank-red" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">{bankName}</h1>
          <p className="text-xs text-ink-secondary sm:text-sm">
            Premium banking dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="glass-inner flex items-center gap-1.5 px-3 py-2">
          <span className="text-xs text-ink-secondary">Rate</span>
          <span className="tabular text-sm font-semibold text-white">
            {formatPercent(currentRate)}
          </span>
          {rateDirection === "up" && (
            <TrendingUp className="h-3.5 w-3.5 text-bank-warn" strokeWidth={2.5} />
          )}
          {rateDirection === "down" && (
            <TrendingDown className="h-3.5 w-3.5 text-bank-green" strokeWidth={2.5} />
          )}
        </div>
        <Link
          href="/settings"
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white"
          aria-label="Settings"
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
        </Link>
      </div>
    </motion.header>
  );
}
