import {
  AppSettings,
  DerivedStatement,
  PaymentStatus,
  RateHistoryEntry,
  StatementRecord,
  Transaction,
} from "@/types";
import { daysBetween, isAfter } from "./dates";

// ── Formatting ───────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  const isNegative = value < 0;
  const formatted = Math.abs(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-${formatted}` : formatted;
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

// ── Rate locking ─────────────────────────────────────────────────────

/**
 * Finds the interest rate that was actually in effect on a given date.
 * Rate changes only ever apply forward — this is what makes locking
 * possible: a transaction dated before a rate change simply never sees
 * entries with a later effectiveDate.
 */
export function getRateForDate(
  rateHistory: RateHistoryEntry[],
  date: string,
  settings: AppSettings
): number {
  const eligible = rateHistory.filter((r) => !isAfter(r.effectiveDate, date));
  if (eligible.length === 0) {
    return settings.rateType === "variable"
      ? settings.primeRate + settings.margin
      : settings.defaultAPR;
  }
  const mostRecent = eligible.reduce((latest, entry) =>
    isAfter(entry.effectiveDate, latest.effectiveDate) ? entry : latest
  );
  return mostRecent.rate;
}

export function getCurrentRate(
  rateHistory: RateHistoryEntry[],
  settings: AppSettings,
  today: string
): number {
  return getRateForDate(rateHistory, today, settings);
}

// ── Interest math ────────────────────────────────────────────────────
// Simple daily accrual, not compounding — matches "Daily Interest =
// Leftover × (APR / 365)" and totals as balance × dailyRate × days.

export function calculateDailyInterest(balance: number, apr: number): number {
  if (balance <= 0) return 0;
  return balance * (apr / 100 / 365);
}

export function calculateInterest(
  balance: number,
  apr: number,
  daysPastDue: number
): number {
  if (daysPastDue <= 0 || balance <= 0) return 0;
  return balance * (apr / 100 / 365) * daysPastDue;
}

// ── Statement derivation ─────────────────────────────────────────────

const EPSILON = 0.005;

/**
 * Computes everything the dashboard displays for the active statement,
 * purely from today's date — nothing here is stored. The one exception
 * is `penaltyAPRActive` / `lateFeeOwed`, which DO need to be persisted
 * once triggered (see applyMissedPaymentIfNeeded), because "penalty
 * stays active until fully caught up" even if the person later pays
 * more than the minimum.
 */
export function deriveStatement(
  statement: StatementRecord,
  settings: AppSettings,
  today: string
): DerivedStatement {
  const leftover = Math.max(0, statement.previousBalance - statement.paymentAmount);
  const newSpending = Math.max(0, statement.currentBalance - statement.previousBalance);
  const pastDue = isAfter(today, statement.dueDate);
  const daysPastDue = pastDue ? Math.max(0, daysBetween(today, statement.dueDate)) : 0;

  let status: PaymentStatus;
  if (leftover <= EPSILON && statement.lateFeeOwed <= EPSILON) {
    status = "paid_full";
  } else if (statement.penaltyAPRActive) {
    status = "missed"; // stays missed until fully caught up, per spec
  } else if (!pastDue) {
    status = "in_grace";
  } else if (statement.paymentAmount >= statement.minimumPayment) {
    status = "paid_minimum";
  } else {
    status = "missed";
  }

  const applicableRate =
    status === "missed" ? settings.penaltyAPR : statement.interestRate;

  const interestApplies = status === "paid_minimum" || status === "missed";
  const accruedInterest = interestApplies
    ? calculateInterest(leftover, applicableRate, daysPastDue)
    : 0;
  const dailyInterest = interestApplies
    ? calculateDailyInterest(leftover, applicableRate)
    : 0;

  const totalToCatchUp =
    status === "paid_minimum" || status === "missed"
      ? leftover + accruedInterest + statement.lateFeeOwed
      : 0;

  // Credit utilization is a period snapshot — current balance against
  // *this statement's* locked limit, so a later limit increase/decrease
  // never rewrites how a past period's utilization is reported.
  const usableCredit = Math.max(0, statement.creditLimit - statement.currentBalance);
  const utilization =
    statement.creditLimit > 0
      ? (statement.currentBalance / statement.creditLimit) * 100
      : 0;

  return {
    status,
    daysPastDue,
    leftover,
    newSpending,
    applicableRate,
    accruedInterest,
    dailyInterest,
    lateFeeOwed: statement.lateFeeOwed,
    totalToCatchUp,
    usableCredit,
    utilization,
    slices: {
      safe: status === "in_grace" ? leftover : 0,
      newSpending,
      accruing: status === "paid_minimum" ? leftover : 0,
      pastDue: status === "missed" ? leftover : 0,
    },
  };
}

/**
 * Checks whether a statement has just crossed into "missed" territory
 * and, if so, applies the one-time late fee + penalty APR. Idempotent:
 * once penaltyAPRActive is true, calling this again does nothing, so
 * it's safe to run on every load/render tick.
 */
export function applyMissedPaymentIfNeeded(
  statement: StatementRecord,
  settings: AppSettings,
  today: string
): { statement: StatementRecord; justMissed: boolean } {
  const pastDue = isAfter(today, statement.dueDate);
  const alreadyHandled = statement.penaltyAPRActive || statement.lateFeeOwed > 0;
  const paidEnough = statement.paymentAmount >= statement.minimumPayment;
  const leftover = Math.max(0, statement.previousBalance - statement.paymentAmount);

  if (pastDue && !paidEnough && !alreadyHandled && leftover > EPSILON) {
    return {
      statement: {
        ...statement,
        lateFeeOwed: settings.lateFeeAmount,
        penaltyAPRActive: true,
        updatedAt: today,
      },
      justMissed: true,
    };
  }
  return { statement, justMissed: false };
}

// ── Payment allocation (FIFO cascade) ────────────────────────────────
// Priority: 1) late fee  2) leftover of previous balance (covers both
// the "red" accruing bucket and the "green" safe bucket — paying down
// previousBalance is the same action regardless of which color it's
// currently drawn as)  3) new spending (yellow).

export interface AllocationResult {
  statement: StatementRecord;
  resolved: boolean; // true if this payment fully cleared the missed/penalty state
  unallocated: number; // overpayment beyond everything owed, not applied anywhere
}

export function allocatePayment(
  statement: StatementRecord,
  amount: number,
  today: string
): AllocationResult {
  let remaining = amount;

  let lateFeeOwed = statement.lateFeeOwed;
  const feePay = Math.min(remaining, lateFeeOwed);
  lateFeeOwed -= feePay;
  remaining -= feePay;

  let paymentAmount = statement.paymentAmount;
  const leftoverBefore = Math.max(0, statement.previousBalance - paymentAmount);
  const leftoverPay = Math.min(remaining, leftoverBefore);
  paymentAmount += leftoverPay;
  remaining -= leftoverPay;

  let currentBalance = statement.currentBalance;
  const newSpendingBefore = Math.max(0, currentBalance - statement.previousBalance);
  const newSpendingPay = Math.min(remaining, newSpendingBefore);
  currentBalance -= newSpendingPay;
  remaining -= newSpendingPay;

  const leftoverAfter = Math.max(0, statement.previousBalance - paymentAmount);
  const resolved = leftoverAfter <= EPSILON && lateFeeOwed <= EPSILON;

  const updated: StatementRecord = {
    ...statement,
    paymentAmount,
    currentBalance,
    lateFeeOwed,
    penaltyAPRActive: resolved ? false : statement.penaltyAPRActive,
    updatedAt: today,
  };

  return { statement: updated, resolved, unallocated: remaining };
}

// ── Credit utilization ────────────────────────────────────────────────
// Common bureau-style bands: under 10% reads as excellent, under 30% as
// the generally-recommended ceiling, 30–50% fair, above that poor.

export type UtilizationTier = "excellent" | "good" | "fair" | "poor";

export function getUtilizationTier(utilization: number): UtilizationTier {
  if (utilization < 10) return "excellent";
  if (utilization < 30) return "good";
  if (utilization < 50) return "fair";
  return "poor";
}

// ── Rate breakdown (balance composition by locked rate) ──────────────

export interface RateBreakdownEntry {
  rate: number;
  amount: number;
  label: string;
}

export function getRateBreakdown(
  statement: StatementRecord,
  derived: DerivedStatement,
  transactions: Transaction[]
): RateBreakdownEntry[] {
  const entries: RateBreakdownEntry[] = [];

  if (derived.leftover > EPSILON) {
    entries.push({
      rate: derived.applicableRate,
      amount: derived.leftover,
      label: derived.status === "missed" ? "Past due (penalty)" : "Previous balance",
    });
  }

  const unbilled = transactions.filter(
    (t) => t.type === "purchase" && t.statementId === null
  );
  const byRate = new Map<number, number>();
  for (const t of unbilled) {
    byRate.set(t.interestRateAtTime, (byRate.get(t.interestRateAtTime) ?? 0) + t.amount);
  }
  for (const [rate, amount] of byRate.entries()) {
    entries.push({ rate, amount, label: "New spending" });
  }

  return entries.sort((a, b) => b.amount - a.amount);
}
