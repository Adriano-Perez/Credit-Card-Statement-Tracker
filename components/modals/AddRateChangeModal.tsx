"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { NewRateChangeInput, RateType } from "@/types";
import { formatPercent } from "@/lib/calculations";
import { todayISO } from "@/lib/dates";

interface AddRateChangeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewRateChangeInput) => void;
  currentRate: number;
}

const REASONS = [
  "Promotional rate ended",
  "Bank notified",
  "Customer requested",
  "Prime rate changed",
  "Other",
];

export default function AddRateChangeModal({
  open,
  onClose,
  onSubmit,
  currentRate,
}: AddRateChangeModalProps) {
  const today = todayISO();
  const [form, setForm] = useState<NewRateChangeInput>({
    rate: "",
    effectiveDate: today,
    type: "fixed",
    reason: REASONS[0],
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  const newRate = Number(form.rate);

  function handleSubmit() {
    if (form.rate.trim() === "" || Number.isNaN(newRate) || newRate < 0 || newRate > 100) {
      setError("Enter a rate between 0 and 100");
      return;
    }
    onSubmit(form);
    onClose();
    setForm({ rate: "", effectiveDate: today, type: "fixed", reason: REASONS[0], notes: "" });
    setError(null);
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add rate change"
      subtitle="Existing balances keep their original locked rate — this only applies forward."
    >
      <div className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
              New rate
            </span>
            <span className="field flex items-center gap-2">
              <input
                inputMode="decimal"
                type="number"
                step="any"
                autoFocus
                placeholder="22.00"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                className="field-inner"
              />
              <span className="text-sm text-white/35">%</span>
            </span>
            {error && <span className="mt-1 block text-[11px] text-bank-red">{error}</span>}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
              Effective date
            </span>
            <input
              type="date"
              value={form.effectiveDate}
              onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
              className="field"
            />
          </label>
        </div>

        <div>
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
            Rate type
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["fixed", "variable"] as RateType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t })}
                className={`rounded-control px-3 py-2.5 text-sm font-medium capitalize transition ${
                  form.type === t
                    ? "bg-bank-red text-white"
                    : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
            Reason
          </span>
          <select
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="field"
          >
            {REASONS.map((r) => (
              <option key={r} value={r} className="bg-base-900">
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
            Notes (optional)
          </span>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="field"
          />
        </label>

        {!Number.isNaN(newRate) && form.rate.trim() !== "" && (
          <div className="rounded-control bg-white/[0.03] p-3.5 text-sm text-white/80">
            {formatPercent(currentRate)} → {formatPercent(newRate)}, effective{" "}
            {form.effectiveDate}. Balances already on the books stay at their locked
            rate.
          </div>
        )}
      </div>

      <button type="button" onClick={handleSubmit} className="btn-primary mt-5 w-full">
        Save rate change
      </button>
    </BottomSheet>
  );
}
