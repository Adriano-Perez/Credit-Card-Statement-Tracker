"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Inbox } from "lucide-react";
import { StatementRecord } from "@/types";
import { formatCurrency, formatPercent, getUtilizationTier } from "@/lib/calculations";
import { formatDateLong } from "@/lib/dates";

const TIER_TEXT = {
  excellent: "text-bank-green",
  good: "text-bank-green",
  fair: "text-bank-gold",
  poor: "text-bank-warn",
} as const;

interface HistoryTableProps {
  statements: StatementRecord[];
  onDelete: (id: string) => void;
}

export default function HistoryTable({ statements, onDelete }: HistoryTableProps) {
  return (
    <div className="glass p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Statement history</h2>
          <p className="mt-0.5 text-sm text-ink-secondary">
            {statements.length} statement{statements.length === 1 ? "" : "s"} on file
          </p>
        </div>
      </div>

      {statements.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-control border border-dashed border-white/10 py-12 text-center">
          <Inbox className="h-6 w-6 text-white/20" strokeWidth={1.5} />
          <p className="text-sm text-ink-muted">
            No statements yet. Add one to start tracking.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <ul className="flex flex-col gap-2.5 sm:hidden">
            <AnimatePresence initial={false}>
              {statements.map((s) => (
                <motion.li
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="glass-inner p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/90">
                        {formatDateLong(s.statementDate)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">
                        Due {formatDateLong(s.dueDate)} · {formatPercent(s.interestRate)} APR
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDelete(s.id)}
                      className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-white/30 hover:bg-bank-red/10 hover:text-bank-red"
                      aria-label="Delete statement"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 border-t border-white/[0.06] pt-3 text-center">
                    <div>
                      <p className="text-[10px] uppercase text-white/30">Previous</p>
                      <p className="tabular mt-0.5 text-[13px] text-white/80">
                        {formatCurrency(s.previousBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-white/30">Current</p>
                      <p className="tabular mt-0.5 text-[13px] text-white/80">
                        {formatCurrency(s.currentBalance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-white/30">Paid</p>
                      <p className="tabular mt-0.5 text-[13px] text-bank-green">
                        {formatCurrency(s.paymentAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-white/30">Util.</p>
                      <p
                        className={`tabular mt-0.5 text-[13px] font-semibold ${
                          TIER_TEXT[getUtilizationTier(
                            s.creditLimit > 0 ? (s.currentBalance / s.creditLimit) * 100 : 0
                          )]
                        }`}
                      >
                        {formatPercent(
                          s.creditLimit > 0 ? (s.currentBalance / s.creditLimit) * 100 : 0
                        )}
                      </p>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-ink-muted">
                  <th className="pb-3 pr-3 font-medium">Statement</th>
                  <th className="pb-3 pr-3 font-medium">Due</th>
                  <th className="pb-3 pr-3 font-medium">Previous</th>
                  <th className="pb-3 pr-3 font-medium">Current</th>
                  <th className="pb-3 pr-3 font-medium">Min pay</th>
                  <th className="pb-3 pr-3 font-medium">APR</th>
                  <th className="pb-3 pr-3 font-medium">Limit</th>
                  <th className="pb-3 pr-3 font-medium">Util.</th>
                  <th className="pb-3 pr-3 font-medium text-bank-green">Paid</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {statements.map((s) => (
                    <motion.tr
                      key={s.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-t border-white/[0.06] text-white/80 hover:bg-white/[0.03]"
                    >
                      <td className="py-3 pr-3 font-medium text-white/90">
                        {formatDateLong(s.statementDate)}
                      </td>
                      <td className="py-3 pr-3">{formatDateLong(s.dueDate)}</td>
                      <td className="tabular py-3 pr-3">{formatCurrency(s.previousBalance)}</td>
                      <td className="tabular py-3 pr-3">{formatCurrency(s.currentBalance)}</td>
                      <td className="tabular py-3 pr-3">{formatCurrency(s.minimumPayment)}</td>
                      <td className="tabular py-3 pr-3">{formatPercent(s.interestRate)}</td>
                      <td className="tabular py-3 pr-3">{formatCurrency(s.creditLimit)}</td>
                      <td
                        className={`tabular py-3 pr-3 font-semibold ${
                          TIER_TEXT[getUtilizationTier(
                            s.creditLimit > 0 ? (s.currentBalance / s.creditLimit) * 100 : 0
                          )]
                        }`}
                      >
                        {formatPercent(
                          s.creditLimit > 0 ? (s.currentBalance / s.creditLimit) * 100 : 0
                        )}
                      </td>
                      <td className="tabular py-3 pr-3 text-bank-green">
                        {formatCurrency(s.paymentAmount)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDelete(s.id)}
                          className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-white/30 hover:bg-bank-red/10 hover:text-bank-red"
                          aria-label="Delete statement"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
