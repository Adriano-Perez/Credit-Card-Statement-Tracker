// ── Rate history ────────────────────────────────────────────────────

export type RateType = "fixed" | "variable";

export interface RateHistoryEntry {
  id: string;
  rate: number; // APR percentage, e.g. 22.0
  effectiveDate: string; // YYYY-MM-DD — applies to this date and after
  type: RateType;
  reason: string;
  notes?: string;
  createdAt: string; // ISO timestamp
}

// ── Transactions ─────────────────────────────────────────────────────

export type TransactionType = "purchase" | "payment" | "late_fee";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // always positive; `type` implies direction
  description: string;
  date: string; // YYYY-MM-DD
  statementId: string | null;
  interestRateAtTime: number; // rate LOCKED at this transaction's date — never changes
  category?: string;
  createdAt: string;
}

// ── Missed payments ──────────────────────────────────────────────────

export interface MissedPaymentRecord {
  id: string;
  statementId: string;
  dueDate: string;
  minimumDue: number;
  lateFee: number;
  penaltyAPR: number;
  isResolved: boolean;
  resolvedDate: string | null;
  createdAt: string;
}

// ── Statements ───────────────────────────────────────────────────────

/**
 * A derived, per-render classification of where a statement currently
 * stands. Not stored — recomputed from today's date every time.
 *
 *  in_grace    — before/on the due date, previous balance not yet fully paid
 *  paid_full   — previous balance has been paid off (any time)
 *  paid_minimum — due date has passed, at least the minimum was paid,
 *                 but not the full previous balance — interest is accruing
 *  missed      — due date has passed and less than the minimum was paid —
 *                 late fee + penalty APR apply
 */
export type PaymentStatus = "in_grace" | "paid_full" | "paid_minimum" | "missed";

export interface StatementRecord {
  id: string;
  statementDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  previousBalance: number;
  currentBalance: number; // previousBalance + new spending, as of statement creation
  minimumPayment: number;
  interestRate: number; // rate locked at statementDate
  creditLimit: number; // locked at statementDate — matches whatever the limit was that period
  paymentAmount: number; // cumulative amount applied toward previousBalance
  lateFeeOwed: number; // 0 until a missed payment applies one; reduced as paid
  penaltyAPRActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Everything computed live for the active statement — the numbers that
 * actually drive the stat cards, the doughnut, and the alert banner.
 */
export interface DerivedStatement {
  status: PaymentStatus;
  daysPastDue: number; // 0 if not past due
  leftover: number; // previousBalance - paymentAmount, floored at 0
  newSpending: number; // currentBalance - previousBalance, floored at 0
  applicableRate: number; // interestRate, or penaltyAPR if penalty is active
  accruedInterest: number; // simple daily interest × daysPastDue
  dailyInterest: number;
  lateFeeOwed: number;
  totalToCatchUp: number; // lateFeeOwed + accruedInterest + leftover, when missed/paid_minimum
  usableCredit: number; // creditLimit - currentBalance, floored at 0
  utilization: number; // currentBalance / creditLimit × 100, for this statement period
  slices: {
    safe: number; // green — pay this by the due date to avoid all interest
    newSpending: number; // yellow — will appear on the next statement
    accruing: number; // red — leftover accruing interest (paid_minimum only)
    pastDue: number; // dark red — leftover accruing at penalty rate (missed only)
  };
}

// ── Settings ─────────────────────────────────────────────────────────

export interface AppSettings {
  bankName: string;
  rateType: RateType;
  defaultAPR: number; // used when rateType is 'fixed' and no history exists yet
  primeRate: number; // used when rateType is 'variable'
  margin: number; // used when rateType is 'variable'
  penaltyAPR: number;
  lateFeeAmount: number;
  gracePeriodDays: number; // default days between statementDate and dueDate
  creditLimit: number; // default limit prefilled for new statements
}

export const DEFAULT_SETTINGS: AppSettings = {
  bankName: "My Card",
  rateType: "fixed",
  defaultAPR: 22.0,
  primeRate: 17.5,
  margin: 4.5,
  penaltyAPR: 29.99,
  lateFeeAmount: 30,
  gracePeriodDays: 21,
  creditLimit: 5000,
};

// ── Form input shapes (raw strings, before parsing) ─────────────────

export interface NewStatementInput {
  statementDate: string;
  dueDate: string;
  previousBalance: string;
  currentBalance: string;
  minimumPayment: string;
  interestRate: string;
  creditLimit: string;
  paymentAmount: string;
}

export interface NewPurchaseInput {
  amount: string;
  description: string;
  date: string;
  category: string;
}

export interface NewRateChangeInput {
  rate: string;
  effectiveDate: string;
  type: RateType;
  reason: string;
  notes: string;
}
