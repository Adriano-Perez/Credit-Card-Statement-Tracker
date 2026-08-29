"use client";

import BottomSheet from "./BottomSheet";
import { SliceKey } from "./BalanceDoughnut";
import { DerivedStatement, StatementRecord } from "@/types";
import { formatCurrency, formatPercent, RateBreakdownEntry } from "@/lib/calculations";
import { formatDateLong } from "@/lib/dates";

interface SliceDetailSheetProps {
  sliceKey: SliceKey | null;
  onClose: () => void;
  statement: StatementRecord;
  derived: DerivedStatement;
  rateBreakdown: RateBreakdownEntry[];
  onPayThisOff: () => void;
}

export default function SliceDetailSheet({
  sliceKey,
  onClose,
  statement,
  derived,
  rateBreakdown,
  onPayThisOff,
}: SliceDetailSheetProps) {
  if (!sliceKey) return null;

  const newSpendingRates = rateBreakdown
    .filter((r) => r.label === "New spending")
    .map((r) => r.rate);
  const lowRate = newSpendingRates.length ? Math.min(...newSpendingRates) : statement.interestRate;
  const highRate = newSpendingRates.length ? Math.max(...newSpendingRates) : statement.interestRate;

  const content: Record<SliceKey, { title: string; body: string; accent: string }> = {
    safe: {
      title: "Safe balance",
      body: `Pay ${formatCurrency(derived.slices.safe)} by ${formatDateLong(
        statement.dueDate
      )} to avoid interest entirely. Rate locked at ${formatPercent(statement.interestRate)}.`,
      accent: "text-bank-green",
    },
    newSpending: {
      title: "New spending",
      body:
        lowRate === highRate
          ? `You've spent ${formatCurrency(
              derived.slices.newSpending
            )} since your last statement at ${formatPercent(
              lowRate
            )}. This will appear on your next bill.`
          : `You've spent ${formatCurrency(
              derived.slices.newSpending
            )} since your last statement, at rates from ${formatPercent(
              lowRate
            )} to ${formatPercent(highRate)}. This will appear on your next bill.`,
      accent: "text-bank-gold",
    },
    accruing: {
      title: "Accruing interest",
      body: `This ${formatCurrency(
        derived.slices.accruing
      )} is accruing ${formatCurrency(derived.dailyInterest)}/day at ${formatPercent(
        derived.applicableRate
      )}. Pay this down to stop the daily charge.`,
      accent: "text-bank-red",
    },
    pastDue: {
      title: "⚠️ Past due",
      body: `This ${formatCurrency(
        derived.slices.pastDue
      )} is past due and accruing at the penalty rate of ${formatPercent(
        derived.applicableRate
      )}. Pay immediately to stop further penalties.`,
      accent: "text-bank-warn",
    },
  };

  const c = content[sliceKey];

  return (
    <BottomSheet open={!!sliceKey} onClose={onClose} title={c.title}>
      <p className={`text-sm leading-relaxed text-white/80`}>{c.body}</p>
      {sliceKey !== "newSpending" && (
        <button type="button" onClick={onPayThisOff} className="btn-primary mt-5 w-full">
          Pay this off
        </button>
      )}
    </BottomSheet>
  );
}
