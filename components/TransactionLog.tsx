"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, ArrowDownCircle, AlertCircle, Receipt } from "lucide-react";
import { Transaction } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import { formatDateShort } from "@/lib/dates";

interface TransactionLogProps {
  transactions: Transaction[];
}

const TYPE_META = {
  purchase: { icon: ShoppingBag, color: "text-bank-gold", sign: "+" },
  payment: { icon: ArrowDownCircle, color: "text-bank-green", sign: "-" },
  late_fee: { icon: AlertCircle, color: "text-bank-warn", sign: "+" },
} as const;

export default function TransactionLog({ transactions }: TransactionLogProps) {
  const sorted = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 25);

  return (
    <div className="glass p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Receipt className="h-4 w-4 text-ink-secondary" strokeWidth={2} />
        <h2 className="text-lg font-semibold text-white">Transaction log</h2>
      </div>

      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">
          No transactions yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {sorted.map((t) => {
              const meta = TYPE_META[t.type];
              const Icon = meta.icon;
              return (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 rounded-control px-2 py-2.5 hover:bg-white/[0.03]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-white/[0.06]">
                    <Icon className={`h-4 w-4 ${meta.color}`} strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white/90">{t.description}</p>
                    <p className="text-[11px] text-ink-muted">
                      {formatDateShort(t.date)} · {formatPercent(t.interestRateAtTime)} APR
                    </p>
                  </div>
                  <span className="tabular shrink-0 text-sm font-medium text-white">
                    {meta.sign}
                    {formatCurrency(t.amount)}
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
