"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  EditTransactionInput,
  MissedPaymentRecord,
  NewPurchaseInput,
  NewRateChangeInput,
  NewStatementInput,
  RateHistoryEntry,
  StatementRecord,
  Transaction,
} from "@/types";
import {
  loadStatements,
  saveStatements,
  loadTransactions,
  saveTransactions,
  loadRateHistory,
  saveRateHistory,
  loadMissedPayments,
  saveMissedPayments,
  loadSettings,
  saveSettings,
  makeId,
} from "@/lib/storage";
import {
  allocatePayment,
  applyMissedPaymentIfNeeded,
  deriveStatement,
  getRateBreakdown,
  getRateForDate,
} from "@/lib/calculations";
import { todayISO } from "@/lib/dates";

function updateStatementForTransactionChange(
  statement: StatementRecord,
  transaction: Transaction,
  delta: number,
  today: string
): StatementRecord {
  if (delta === 0) return statement;

  if (transaction.type === "purchase") {
    return {
      ...statement,
      currentBalance: Math.max(0, statement.currentBalance + delta),
      updatedAt: today,
    };
  }

  if (transaction.type === "payment") {
    return {
      ...statement,
      paymentAmount: Math.max(0, statement.paymentAmount + delta),
      updatedAt: today,
    };
  }

  return {
    ...statement,
    lateFeeOwed: Math.max(0, statement.lateFeeOwed + delta),
    updatedAt: today,
  };
}

export function useLedger() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [statements, setStatements] = useState<StatementRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rateHistory, setRateHistory] = useState<RateHistoryEntry[]>([]);
  const [missedPayments, setMissedPayments] = useState<MissedPaymentRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const today = todayISO();

  // Initial load
  useEffect(() => {
    setSettings(loadSettings());
    setStatements(loadStatements());
    setTransactions(loadTransactions());
    setRateHistory(loadRateHistory() || []);
    setMissedPayments(loadMissedPayments());
    setHydrated(true);
  }, []);

  // Persist each collection after the initial load
  useEffect(() => {
    if (hydrated) saveSettings(settings);
  }, [settings, hydrated]);
  useEffect(() => {
    if (hydrated) saveStatements(statements);
  }, [statements, hydrated]);
  useEffect(() => {
    if (hydrated) saveTransactions(transactions);
  }, [transactions, hydrated]);
  useEffect(() => {
    if (hydrated) saveRateHistory(rateHistory);
  }, [rateHistory, hydrated]);
  useEffect(() => {
    if (hydrated) saveMissedPayments(missedPayments);
  }, [missedPayments, hydrated]);

  const activeStatement = useMemo<StatementRecord | null>(() => {
    if (statements.length === 0) return null;
    return [...statements].sort((a, b) =>
      a.statementDate < b.statementDate ? 1 : -1
    )[0];
  }, [statements]);

  const pastStatements = useMemo<StatementRecord[]>(() => {
    return [...statements].sort((a, b) =>
      a.statementDate < b.statementDate ? 1 : -1
    );
  }, [statements]);

  // Auto-detect: has the active statement just crossed into "missed"?
  useEffect(() => {
    if (!hydrated || !activeStatement) return;
    const { statement: updated, justMissed } = applyMissedPaymentIfNeeded(
      activeStatement,
      settings,
      today
    );
    if (justMissed) {
      setStatements((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setMissedPayments((prev) => [
        {
          id: makeId(),
          statementId: updated.id,
          dueDate: updated.dueDate,
          minimumDue: updated.minimumPayment,
          lateFee: settings.lateFeeAmount,
          penaltyAPR: settings.penaltyAPR,
          isResolved: false,
          resolvedDate: null,
          createdAt: today,
        },
        ...prev,
      ]);
      setTransactions((prev) => [
        {
          id: makeId(),
          type: "late_fee",
          amount: settings.lateFeeAmount,
          description: "Late fee — missed minimum payment",
          date: today,
          statementId: updated.id,
          interestRateAtTime: settings.penaltyAPR,
          createdAt: today,
        },
        ...prev,
      ]);
    }
  }, [hydrated, activeStatement, settings, today]);

  const derived = useMemo(() => {
    if (!activeStatement) return null;
    return deriveStatement(activeStatement, settings, today);
  }, [activeStatement, settings, today]);

  const rateBreakdown = useMemo(() => {
    if (!activeStatement || !derived) return [];
    return getRateBreakdown(activeStatement, derived, transactions);
  }, [activeStatement, derived, transactions]);

  const currentRate = useMemo(
    () => getRateForDate(rateHistory || [], today, settings),
    [rateHistory, today, settings]
  );

  const activeMissedPayment = useMemo(() => {
    if (!activeStatement) return null;
    return (
      missedPayments.find(
        (m) => m.statementId === activeStatement.id && !m.isResolved
      ) ?? null
    );
  }, [missedPayments, activeStatement]);

  const addStatement = useCallback(
    (input: NewStatementInput) => {
      const rate =
        input.interestRate.trim() !== ""
          ? Number(input.interestRate)
          : getRateForDate(rateHistory, input.statementDate, settings);

      const newStatement: StatementRecord = {
        id: makeId(),
        statementDate: input.statementDate,
        dueDate: input.dueDate,
        previousBalance: Number(input.previousBalance),
        currentBalance: Number(input.currentBalance),
        minimumPayment: Number(input.minimumPayment),
        interestRate: rate,
        paymentAmount: Number(input.paymentAmount || "0"),
        lateFeeOwed: 0,
        penaltyAPRActive: false,
        createdAt: today,
        updatedAt: today,
      };

      setStatements((prev) => [newStatement, ...prev]);

      setTransactions((prev) =>
        prev.map((t) =>
          t.type === "purchase" && t.statementId === null
            ? { ...t, statementId: newStatement.id }
            : t
        )
      );

      if (newStatement.paymentAmount > 0) {
        setTransactions((prev) => [
          {
            id: makeId(),
            type: "payment",
            amount: newStatement.paymentAmount,
            description: "Payment applied at statement creation",
            date: input.statementDate,
            statementId: newStatement.id,
            interestRateAtTime: rate,
            createdAt: today,
          },
          ...prev,
        ]);
      }
    },
    [rateHistory, settings, today]
  );

  const makePayment = useCallback(
    (amount: number) => {
      if (!activeStatement || amount <= 0) return;
      const { statement: updated, resolved } = allocatePayment(
        activeStatement,
        amount,
        today
      );
      setStatements((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setTransactions((prev) => [
        {
          id: makeId(),
          type: "payment",
          amount,
          description: "Payment",
          date: today,
          statementId: updated.id,
          interestRateAtTime: derived?.applicableRate ?? updated.interestRate,
          createdAt: today,
        },
        ...prev,
      ]);
      if (resolved) {
        setMissedPayments((prev) =>
          prev.map((m) =>
            m.statementId === updated.id && !m.isResolved
              ? { ...m, isResolved: true, resolvedDate: today }
              : m
          )
        );
      }
    },
    [activeStatement, derived, today]
  );

  const addPurchase = useCallback(
    (input: NewPurchaseInput) => {
      const rate = getRateForDate(rateHistory, input.date, settings);
      const amount = Number(input.amount);

      setTransactions((prev) => [
        {
          id: makeId(),
          type: "purchase",
          amount,
          description: input.description || "Purchase",
          date: input.date,
          statementId: null,
          interestRateAtTime: rate,
          category: input.category || undefined,
          createdAt: today,
        },
        ...prev,
      ]);

      if (activeStatement) {
        setStatements((prev) =>
          prev.map((s) =>
            s.id === activeStatement.id
              ? { ...s, currentBalance: s.currentBalance + amount, updatedAt: today }
              : s
          )
        );
      }
    },
    [activeStatement, rateHistory, settings, today]
  );

  const addRateChange = useCallback(
    (input: NewRateChangeInput) => {
      const entry: RateHistoryEntry = {
        id: makeId(),
        rate: Number(input.rate),
        effectiveDate: input.effectiveDate,
        type: input.type,
        reason: input.reason || "Rate updated",
        notes: input.notes || undefined,
        createdAt: today,
      };
      setRateHistory((prev) => [entry, ...prev]);
      if (input.type === "variable") {
        setSettings((prev) => ({ ...prev, rateType: "variable" }));
      }
    },
    [today]
  );

  const updateSettings = useCallback((next: AppSettings) => {
    setSettings(next);
  }, []);

  const deleteStatement = useCallback((id: string) => {
    setStatements((prev) => prev.filter((s) => s.id !== id));
    setMissedPayments((prev) => prev.filter((m) => m.statementId !== id));
  }, []);

  const editStatement = useCallback(
    (id: string, input: NewStatementInput) => {
      const rate =
        input.interestRate.trim() !== ""
          ? Number(input.interestRate)
          : getRateForDate(rateHistory, input.statementDate, settings);

      setStatements((prev) =>
        prev.map((statement) =>
          statement.id === id
            ? {
                ...statement,
                statementDate: input.statementDate,
                dueDate: input.dueDate,
                previousBalance: Number(input.previousBalance),
                currentBalance: Number(input.currentBalance),
                minimumPayment: Number(input.minimumPayment),
                interestRate: rate,
                paymentAmount: Number(input.paymentAmount || "0"),
                updatedAt: today,
              }
            : statement
        )
      );
    },
    [rateHistory, settings, today]
  );

  const updateTransaction = useCallback(
    (id: string, input: EditTransactionInput) => {
      setTransactions((prev) => {
        const target = prev.find((transaction) => transaction.id === id);
        if (!target) return prev;

        const nextAmount = Number(input.amount);
        const nextTransaction: Transaction = {
          ...target,
          amount: nextAmount,
          description: input.description || target.description,
          date: input.date,
          category:
            target.type === "purchase"
              ? input.category.trim() || undefined
              : target.category,
        };

        if (target.statementId !== null) {
          const delta = nextAmount - target.amount;
          setStatements((statementPrev) =>
            statementPrev.map((statement) =>
              statement.id === target.statementId
                ? updateStatementForTransactionChange(statement, target, delta, today)
                : statement
            )
          );
        }

        return prev.map((transaction) =>
          transaction.id === id ? nextTransaction : transaction
        );
      });
    },
    [today]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => {
        const target = prev.find((transaction) => transaction.id === id);
        if (!target) return prev;

        if (target.statementId !== null) {
          setStatements((statementPrev) =>
            statementPrev.map((statement) =>
              statement.id === target.statementId
                ? updateStatementForTransactionChange(statement, target, -target.amount, today)
                : statement
            )
          );
        }

        return prev.filter((transaction) => transaction.id !== id);
      });
    },
    [today]
  );

  const deleteRateHistoryEntry = useCallback((id: string) => {
    setRateHistory((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return {
    hydrated,
    today,
    settings,
    statements: pastStatements,
    activeStatement,
    derived,
    rateBreakdown,
    rateHistory,
    transactions,
    missedPayments,
    activeMissedPayment,
    currentRate,
    addStatement,
    makePayment,
    addPurchase,
    addRateChange,
    updateSettings,
    deleteStatement,
    editStatement,
    updateTransaction,
    deleteTransaction,
    deleteRateHistoryEntry,
  };
}
