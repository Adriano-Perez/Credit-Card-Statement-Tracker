"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  ShieldCheck,
  CalendarClock,
  Percent,
  Plus,
  ArrowDownCircle,
  ShoppingBag,
  TrendingUp as RateIcon,
  Wallet,
  Gauge,
} from "lucide-react";
import { useLedger } from "@/hooks/useLedger";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import AlertBanner from "@/components/AlertBanner";
import BalanceDoughnut, { SliceKey } from "@/components/BalanceDoughnut";
import SliceDetailSheet from "@/components/SliceDetailSheet";
import RateBreakdown from "@/components/RateBreakdown";
import TransactionLog from "@/components/TransactionLog";
import RateHistoryTimeline from "@/components/RateHistoryTimeline";
import HistoryTable from "@/components/HistoryTable";
import AddStatementModal from "@/components/modals/AddStatementModal";
import MakePaymentModal from "@/components/modals/MakePaymentModal";
import AddPurchaseModal from "@/components/modals/AddPurchaseModal";
import AddRateChangeModal from "@/components/modals/AddRateChangeModal";
import MissedRecoveryModal from "@/components/modals/MissedRecoveryModal";
import { formatCurrency, formatPercent, getUtilizationTier } from "@/lib/calculations";
import { formatDateLong } from "@/lib/dates";

type OpenModal =
  | "addStatement"
  | "makePayment"
  | "addPurchase"
  | "addRateChange"
  | "recovery"
  | null;

const UTILIZATION_ACCENT = {
  excellent: "green",
  good: "green",
  fair: "gold",
  poor: "red",
} as const;

export default function Home() {
  const ledger = useLedger();
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [activeSlice, setActiveSlice] = useState<SliceKey | null>(null);

  const rateDirection = useMemo(() => {
    const sorted = [...ledger.rateHistory].sort((a, b) =>
      a.effectiveDate < b.effectiveDate ? 1 : -1
    );
    if (sorted.length < 2) return null;
    return sorted[0].rate > sorted[1].rate ? "up" : sorted[0].rate < sorted[1].rate ? "down" : null;
  }, [ledger.rateHistory]);

  if (!ledger.hydrated) return null;

  const { activeStatement, derived } = ledger;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <Header
        bankName={ledger.settings.bankName}
        currentRate={ledger.currentRate}
        rateDirection={rateDirection}
      />

      {!activeStatement || !derived ? (
        <div className="glass flex flex-col items-center gap-4 p-10 text-center">
          <div className="glass-inner flex h-12 w-12 items-center justify-center">
            <CreditCard className="h-5 w-5 text-bank-red" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">No statement yet</h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Add your first statement to start tracking balances and interest.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpenModal("addStatement")}
            className="btn-primary"
          >
            Add first statement
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {derived.status === "missed" && (
            <AlertBanner
              daysPastDue={derived.daysPastDue}
              totalToCatchUp={derived.totalToCatchUp}
              onPayNow={() => setOpenModal("recovery")}
              onViewPlan={() => setOpenModal("recovery")}
            />
          )}

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              index={0}
              label="Current balance"
              value={activeStatement.currentBalance}
              icon={CreditCard}
              accent="red"
            />
            <StatCard
              index={1}
              label="Safe to pay"
              sublabel={`By ${formatDateLong(activeStatement.dueDate)}`}
              value={derived.slices.safe}
              icon={ShieldCheck}
              accent="green"
            />
            <StatCard
              index={2}
              label="Minimum due"
              sublabel={formatDateLong(activeStatement.dueDate)}
              value={activeStatement.minimumPayment}
              icon={CalendarClock}
              accent={derived.status === "missed" ? "darkred" : "gold"}
            />
            <StatCard
              index={3}
              label="Daily interest"
              sublabel={`${formatPercent(derived.applicableRate)} APR`}
              value={derived.dailyInterest}
              icon={Percent}
              accent={derived.dailyInterest > 0 ? "red" : "neutral"}
            />
            <StatCard
              index={4}
              label="Usable credit"
              sublabel={`Limit ${formatCurrency(activeStatement.creditLimit)}`}
              value={derived.usableCredit}
              icon={Wallet}
              accent="green"
            />
            <StatCard
              index={5}
              label="Utilization"
              sublabel="This statement period"
              value={derived.utilization}
              format="percent"
              icon={Gauge}
              accent={UTILIZATION_ACCENT[getUtilizationTier(derived.utilization)]}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="glass p-5 sm:p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-white">Breakdown</h2>
              <BalanceDoughnut derived={derived} onSliceClick={setActiveSlice} />
            </motion.div>

            <div className="flex flex-col gap-5">
              <RateBreakdown entries={ledger.rateBreakdown} />

              <div className="glass p-5 sm:p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Actions</h2>
                <div className="grid grid-cols-2 gap-2.5">
                  <ActionButton
                    icon={ArrowDownCircle}
                    label="Make payment"
                    onClick={() => setOpenModal("makePayment")}
                    primary
                  />
                  <ActionButton
                    icon={ShoppingBag}
                    label="Add purchase"
                    onClick={() => setOpenModal("addPurchase")}
                  />
                  <ActionButton
                    icon={RateIcon}
                    label="Rate change"
                    onClick={() => setOpenModal("addRateChange")}
                  />
                  <ActionButton
                    icon={Plus}
                    label="New statement"
                    onClick={() => setOpenModal("addStatement")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TransactionLog transactions={ledger.transactions} />
        <RateHistoryTimeline
          entries={ledger.rateHistory}
          currentRate={ledger.currentRate}
          onDelete={ledger.deleteRateHistoryEntry}
        />
      </div>

      <div className="mt-5">
        <HistoryTable statements={ledger.statements} onDelete={ledger.deleteStatement} />
      </div>

      {/* Modals */}
      <AddStatementModal
        open={openModal === "addStatement"}
        onClose={() => setOpenModal(null)}
        onSubmit={ledger.addStatement}
        defaultRate={ledger.currentRate}
        defaultGraceDays={ledger.settings.gracePeriodDays}
        defaultCreditLimit={activeStatement?.creditLimit ?? ledger.settings.creditLimit}
        suggestedPreviousBalance={activeStatement?.currentBalance ?? null}
      />

      {activeStatement && (
        <MakePaymentModal
          open={openModal === "makePayment"}
          onClose={() => setOpenModal(null)}
          onSubmit={ledger.makePayment}
          statement={activeStatement}
          suggestedAmount={activeStatement.minimumPayment}
        />
      )}

      <AddPurchaseModal
        open={openModal === "addPurchase"}
        onClose={() => setOpenModal(null)}
        onSubmit={ledger.addPurchase}
        currentRate={ledger.currentRate}
      />

      <AddRateChangeModal
        open={openModal === "addRateChange"}
        onClose={() => setOpenModal(null)}
        onSubmit={ledger.addRateChange}
        currentRate={ledger.currentRate}
      />

      {activeStatement && derived && (
        <>
          <MissedRecoveryModal
            open={openModal === "recovery"}
            onClose={() => setOpenModal(null)}
            onSubmit={ledger.makePayment}
            statement={activeStatement}
            derived={derived}
          />
          <SliceDetailSheet
            sliceKey={activeSlice}
            onClose={() => setActiveSlice(null)}
            statement={activeStatement}
            derived={derived}
            rateBreakdown={ledger.rateBreakdown}
            onPayThisOff={() => {
              setActiveSlice(null);
              setOpenModal(derived.status === "missed" ? "recovery" : "makePayment");
            }}
          />
        </>
      )}
    </main>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-control px-3 py-4 text-xs font-medium transition active:scale-[0.97] ${
        primary
          ? "bg-bank-red text-white hover:opacity-85"
          : "bg-white/[0.06] text-white/80 hover:bg-white/[0.1]"
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
      {label}
    </button>
  );
}
