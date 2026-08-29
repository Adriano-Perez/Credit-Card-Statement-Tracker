"use client";

import { useMemo, useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { StatementRecord } from "@/types";
import { allocatePayment, formatCurrency } from "@/lib/calculations";
import { todayISO } from "@/lib/dates";

interface MakePaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  statement: StatementRecord;
  suggestedAmount?: number;
}

export default function MakePaymentModal({
  open,
  onClose,
  onSubmit,
  statement,
  suggestedAmount,
}: MakePaymentModalProps) {
  const [amount, setAmount] = useState(suggestedAmount ? suggestedAmount.toFixed(2) : "");
  const today = todayISO();

  const parsed = Number(amount) || 0;
  const preview = useMemo(() => {
    if (parsed <= 0) return null;
    const before = statement;
    const { statement: after } = allocatePayment(before, parsed, today);
    const toFees = Math.min(parsed, before.lateFeeOwed);
    const remainingAfterFees = parsed - toFees;
    const leftoverBefore = Math.max(0, before.previousBalance - before.paymentAmount);
    const toLeftover = Math.min(remainingAfterFees, leftoverBefore);
    const remainingAfterLeftover = remainingAfterFees - toLeftover;
    const newSpendingBefore = Math.max(0, before.currentBalance - before.previousBalance);
    const toNewSpending = Math.min(remainingAfterLeftover, newSpendingBefore);
    return { after, toFees, toLeftover, toNewSpending };
  }, [parsed, statement, today]);

  function handleSubmit() {
    if (parsed <= 0) return;
    onSubmit(parsed);
    onClose();
    setAmount("");
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Make a payment"
      subtitle="Applied in order: late fees, then leftover balance, then new spending."
    >
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
          Amount
        </span>
        <span className="field flex items-center gap-2">
          <span className="text-sm text-white/35">$</span>
          <input
            inputMode="decimal"
            type="number"
            step="any"
            autoFocus
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field-inner"
          />
        </span>
      </label>

      {preview && (
        <div className="mt-4 flex flex-col gap-2 rounded-control bg-white/[0.03] p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
            This payment goes to
          </p>
          {preview.toFees > 0 && (
            <Row label="Late fee" value={preview.toFees} color="text-bank-warn" />
          )}
          {preview.toLeftover > 0 && (
            <Row label="Previous balance" value={preview.toLeftover} color="text-bank-red" />
          )}
          {preview.toNewSpending > 0 && (
            <Row label="New spending" value={preview.toNewSpending} color="text-bank-gold" />
          )}
          <div className="mt-1 border-t border-white/[0.06] pt-2">
            <Row
              label="Balance remaining after"
              value={Math.max(
                0,
                preview.after.currentBalance - preview.after.paymentAmount
              )}
              color="text-white"
              bold
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={parsed <= 0}
        className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40"
      >
        Make payment
      </button>
    </BottomSheet>
  );
}

function Row({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: number;
  color: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/70">{label}</span>
      <span className={`tabular ${bold ? "font-semibold" : "font-medium"} ${color}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}
