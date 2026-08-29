import {
  AppSettings,
  DEFAULT_SETTINGS,
  MissedPaymentRecord,
  RateHistoryEntry,
  StatementRecord,
  Transaction,
} from "@/types";

const KEYS = {
  statements: "vault.statements.v1",
  transactions: "vault.transactions.v1",
  rateHistory: "vault.rateHistory.v1",
  missedPayments: "vault.missedPayments.v1",
  settings: "vault.settings.v1",
} as const;

function safeLoad<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSave<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — the current session still works in
    // memory, it just won't persist across reloads.
  }
}

export const loadStatements = () => safeLoad<StatementRecord[]>(KEYS.statements, []);
export const saveStatements = (v: StatementRecord[]) => safeSave(KEYS.statements, v);

export const loadTransactions = () => safeLoad<Transaction[]>(KEYS.transactions, []);
export const saveTransactions = (v: Transaction[]) => safeSave(KEYS.transactions, v);

export const loadRateHistory = () => safeLoad<RateHistoryEntry[]>(KEYS.rateHistory, []);
export const saveRateHistory = (v: RateHistoryEntry[]) => safeSave(KEYS.rateHistory, v);

export const loadMissedPayments = () =>
  safeLoad<MissedPaymentRecord[]>(KEYS.missedPayments, []);
export const saveMissedPayments = (v: MissedPaymentRecord[]) =>
  safeSave(KEYS.missedPayments, v);

export const loadSettings = () => safeLoad<AppSettings>(KEYS.settings, DEFAULT_SETTINGS);
export const saveSettings = (v: AppSettings) => safeSave(KEYS.settings, v);

export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
