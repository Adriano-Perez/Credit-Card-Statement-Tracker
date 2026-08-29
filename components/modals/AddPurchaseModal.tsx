"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { NewPurchaseInput } from "@/types";
import { calculateDailyInterest, formatCurrency, formatPercent } from "@/lib/calculations";
import { todayISO } from "@/lib/dates";

interface AddPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewPurchaseInput) => void;
  currentRate: number;
}

export default function AddPurchaseModal({
  open,
  onClose,
  onSubmit,
  currentRate,
}: AddPurchaseModalProps) {
  const today = todayISO();
  const [form, setForm] = useState<NewPurchaseInput>({
    amount: "",
    description: "",
    date: today,
    category: "",
  });
  const [error, setError] = useState<string | null>(null);

  const amount = Number(form.amount) || 0;
  const dailyCost = calculateDailyInterest(amount, currentRate);

  function handleSubmit() {
    if (form.amount.trim() === "" || Number.isNaN(amount) || amount <= 0) {
      setError("Enter an amount greater than 0");
      return;
    }
    onSubmit(form);
    onClose();
    setForm({ amount: "", description: "", date: today, category: "" });
    setError(null);
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add purchase"
      subtitle="Locks today's rate to this purchase, permanently."
    >
      <div className="flex flex-col gap-3.5">
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
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="field-inner"
            />
          </span>
          {error && <span className="mt-1 block text-[11px] text-bank-red">{error}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
            Description
          </span>
          <input
            type="text"
            placeholder="e.g. Groceries"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="field"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
              Date
            </span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="field"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
              Category (optional)
            </span>
            <input
              type="text"
              placeholder="Dining"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="field"
            />
          </label>
        </div>

        {amount > 0 && (
          <div className="rounded-control bg-white/[0.03] p-3.5 text-sm">
            <p className="text-white/80">
              Rate locked at{" "}
              <span className="font-semibold text-bank-gold">
                {formatPercent(currentRate)}
              </span>
            </p>
            <p className="mt-1 text-[12px] text-ink-muted">
              This will cost {formatCurrency(dailyCost)}/day in interest if it isn&apos;t
              paid off before the next due date.
            </p>
          </div>
        )}
      </div>

      <button type="button" onClick={handleSubmit} className="btn-primary mt-5 w-full">
        Add purchase
      </button>
    </BottomSheet>
  );
}
