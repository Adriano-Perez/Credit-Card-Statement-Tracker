"use client";

import { useState } from "react";
import BottomSheet from "@/components/BottomSheet";
import { NewStatementInput } from "@/types";
import { todayISO, addDays } from "@/lib/dates";
import { formatPercent } from "@/lib/calculations";

interface AddStatementModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewStatementInput) => void;
  defaultRate: number;
  defaultGraceDays: number;
  defaultCreditLimit: number;
  suggestedPreviousBalance: number | null;
}

type Errors = Partial<Record<keyof NewStatementInput, string>>;

export default function AddStatementModal({
  open,
  onClose,
  onSubmit,
  defaultRate = 18.99,
  defaultGraceDays = 25,
  defaultCreditLimit = 1000,
  suggestedPreviousBalance = null,
}: AddStatementModalProps) {
  const today = todayISO();

  const [form, setForm] = useState<NewStatementInput>({
    statementDate: today,
    dueDate: addDays(today, defaultGraceDays),
    previousBalance: suggestedPreviousBalance?.toString() ?? "",
    currentBalance: "",
    minimumPayment: "",
    interestRate: defaultRate?.toString() ?? "0",
    creditLimit: defaultCreditLimit?.toString() ?? "0",
    paymentAmount: "0",
  });
  const [dueDateTouched, setDueDateTouched] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function update<K extends keyof NewStatementInput>(key: K, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "statementDate" && !dueDateTouched) {
        next.dueDate = addDays(value, defaultGraceDays);
      }
      return next;
    });
  }

  function validate(): Errors {
    const e: Errors = {};
    const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

    if (!form.statementDate) e.statementDate = "Required";
    if (!form.dueDate) e.dueDate = "Required";
    if (form.statementDate && form.dueDate && form.dueDate <= form.statementDate) {
      e.dueDate = "Must be after statement date";
    }
    if (Number.isNaN(num(form.previousBalance)) || num(form.previousBalance) < 0) {
      e.previousBalance = "Enter a valid non-negative number";
    }
    if (Number.isNaN(num(form.currentBalance)) || num(form.currentBalance) < 0) {
      e.currentBalance = "Enter a valid non-negative number";
    }
    if (Number.isNaN(num(form.minimumPayment)) || num(form.minimumPayment) <= 0) {
      e.minimumPayment = "Must be greater than 0";
    }
    if (Number.isNaN(num(form.interestRate)) || num(form.interestRate) < 0) {
      e.interestRate = "Enter a valid rate";
    }
    if (Number.isNaN(num(form.creditLimit)) || num(form.creditLimit) <= 0) {
      e.creditLimit = "Must be greater than 0";
    }
    if (
      form.paymentAmount.trim() !== "" &&
      (Number.isNaN(num(form.paymentAmount)) || num(form.paymentAmount) < 0)
    ) {
      e.paymentAmount = "Enter a valid non-negative number";
    }
    return e;
  }

  function handleSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    onSubmit(form);
    onClose();
    setForm({
      statementDate: today,
      dueDate: addDays(today, defaultGraceDays),
      previousBalance: "",
      currentBalance: "",
      minimumPayment: "",
      interestRate: defaultRate?.toString() ?? "0",
      creditLimit: defaultCreditLimit?.toString() ?? "0",
      paymentAmount: "0",
    });
    setDueDateTouched(false);
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add statement"
      subtitle="Enter the numbers exactly as printed on the bill."
    >
      <div className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Statement date" error={errors.statementDate}>
            <input
              type="date"
              value={form.statementDate}
              onChange={(e) => update("statementDate", e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Due date" error={errors.dueDate}>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => {
                setDueDateTouched(true);
                update("dueDate", e.target.value);
              }}
              className="field"
            />
          </Field>
        </div>

        <Field label="Previous balance" error={errors.previousBalance} prefix="$">
          <input
            inputMode="decimal"
            type="number"
            step="any"
            placeholder="0.00"
            value={form.previousBalance}
            onChange={(e) => update("previousBalance", e.target.value)}
            className="field-inner"
          />
        </Field>

        <Field label="Current balance" error={errors.currentBalance} prefix="$">
          <input
            inputMode="decimal"
            type="number"
            step="any"
            placeholder="0.00"
            value={form.currentBalance}
            onChange={(e) => update("currentBalance", e.target.value)}
            className="field-inner"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Minimum payment" error={errors.minimumPayment} prefix="$">
            <input
              inputMode="decimal"
              type="number"
              step="any"
              placeholder="0.00"
              value={form.minimumPayment}
              onChange={(e) => update("minimumPayment", e.target.value)}
              className="field-inner"
            />
          </Field>
          <Field label="Interest rate (APR)" error={errors.interestRate} prefix="%">
            <input
              inputMode="decimal"
              type="number"
              step="any"
              value={form.interestRate}
              onChange={(e) => update("interestRate", e.target.value)}
              className="field-inner"
            />
          </Field>
        </div>

        <Field
          label="Credit limit"
          error={errors.creditLimit}
          prefix="$"
          hint="Locked to this statement, so utilization history stays accurate even if your limit changes later."
        >
          <input
            inputMode="decimal"
            type="number"
            step="any"
            placeholder="0.00"
            value={form.creditLimit}
            onChange={(e) => update("creditLimit", e.target.value)}
            className="field-inner"
          />
        </Field>

        <Field
          label="Payment made so far"
          error={errors.paymentAmount}
          prefix="$"
          hint="Leave 0 if you haven't paid yet — you can log a payment later."
        >
          <input
            inputMode="decimal"
            type="number"
            step="any"
            placeholder="0.00"
            value={form.paymentAmount}
            onChange={(e) => update("paymentAmount", e.target.value)}
            className="field-inner"
          />
        </Field>

        <p className="text-[11px] text-ink-muted">
          Rate will be locked at {formatPercent(Number(form.interestRate) || 0)} for
          this statement&apos;s balance.
        </p>
      </div>

      <button type="button" onClick={handleSubmit} className="btn-primary mt-5 w-full">
        Add statement
      </button>
    </BottomSheet>
  );
}

function Field({
  label,
  error,
  prefix,
  hint,
  children,
}: {
  label: string;
  error?: string;
  prefix?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
        {label}
      </span>
      {prefix ? (
        <span className="field flex items-center gap-2">
          <span className="text-sm text-white/35">{prefix}</span>
          {children}
        </span>
      ) : (
        children
      )}
      {error ? (
        <span className="mt-1 block text-[11px] text-bank-red">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-[11px] text-ink-muted">{hint}</span>
      ) : null}
    </label>
  );
}
