"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { DerivedStatement, StatementRecord } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/calculations";

interface MissedRecoveryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  statement: StatementRecord;
  derived: DerivedStatement;
}

export default function MissedRecoveryModal({
  open,
  onClose,
  onSubmit,
  statement,
  derived,
}: MissedRecoveryModalProps) {
  const [amount, setAmount] = useState(derived.totalToCatchUp.toFixed(2));
  const parsed = Number(amount) || 0;
  const willFullyRecover = parsed >= derived.totalToCatchUp - 0.005;

  function handleSubmit() {
    if (parsed <= 0) return;
    onSubmit(parsed);
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="⚠️ Missed payment recovery"
      subtitle={`${derived.daysPastDue} day${derived.daysPastDue === 1 ? "" : "s"} past due since ${statement.dueDate}`}
    >
      <div className="flex flex-col gap-2 rounded-control bg-white/[0.03] p-3.5">
        <Row label="Minimum due" value={statement.minimumPayment} />
        <Row label="Late fee" value={derived.lateFeeOwed} color="text-bank-warn" />
        <Row
          label={`Penalty interest (${formatPercent(derived.applicableRate)})`}
          value={derived.accruedInterest}
          color="text-bank-warn"
        />
        <div className="mt-1 border-t border-white/[0.08] pt-2">
          <Row label="Total to catch up" value={derived.totalToCatchUp} bold color="text-white" />
        </div>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
          Amount to pay
        </span>
        <span className="field flex items-center gap-2">
          <span className="text-sm text-white/35">$</span>
          <input
            inputMode="decimal"
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field-inner"
          />
        </span>
      </label>

      {!willFullyRecover && parsed > 0 && (
        <p className="mt-2 text-[12px] text-bank-warn">
          You&apos;ll still owe {formatCurrency(derived.totalToCatchUp - parsed)} to fully
          catch up — penalty APR stays active until it&apos;s cleared.
        </p>
      )}
      {willFullyRecover && (
        <p className="mt-2 text-[12px] text-bank-green">
          This clears the missed payment — penalty APR is removed and your rate
          reverts to {formatPercent(statement.interestRate)}.
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setAmount(statement.minimumPayment.toFixed(2))}
          className="btn-secondary"
        >
          Pay minimum
        </button>
        <button type="button" onClick={handleSubmit} className="btn-danger">
          Pay {formatCurrency(parsed)}
        </button>
      </div>
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
  color?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/70">{label}</span>
      <span
        className={`tabular ${bold ? "font-semibold" : "font-medium"} ${
          color ?? "text-white"
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}
