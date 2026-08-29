"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Landmark, Percent, CalendarDays, ShieldAlert } from "lucide-react";
import { useLedger } from "@/hooks/useLedger";
import { AppSettings, RateType } from "@/types";

/** Raw string mirror of AppSettings, so number fields can be edited freely
 *  (including empty/partial) before being parsed back on save. */
interface SettingsForm {
  bankName: string;
  rateType: RateType;
  defaultAPR: string;
  primeRate: string;
  margin: string;
  penaltyAPR: string;
  lateFeeAmount: string;
  gracePeriodDays: string;
  creditLimit: string;
}

function toForm(s: AppSettings): SettingsForm {
  return {
    bankName: s.bankName,
    rateType: s.rateType,
    defaultAPR: String(s.defaultAPR),
    primeRate: String(s.primeRate),
    margin: String(s.margin),
    penaltyAPR: String(s.penaltyAPR),
    lateFeeAmount: String(s.lateFeeAmount),
    gracePeriodDays: String(s.gracePeriodDays),
    creditLimit: String(s.creditLimit),
  };
}

export default function SettingsPage() {
  const ledger = useLedger();
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [saved, setSaved] = useState(false);

  // Seed the form once settings load from localStorage.
  useEffect(() => {
    if (ledger.hydrated && !form) {
      setForm(toForm(ledger.settings));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledger.hydrated]);

  if (!ledger.hydrated || !form) return null;

  function set<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  function handleSave() {
    if (!form) return;
    const next: AppSettings = {
      bankName: form.bankName.trim() || "My Card",
      rateType: form.rateType,
      defaultAPR: Math.max(0, Number(form.defaultAPR) || 0),
      primeRate: Math.max(0, Number(form.primeRate) || 0),
      margin: Math.max(0, Number(form.margin) || 0),
      penaltyAPR: Math.max(0, Number(form.penaltyAPR) || 0),
      lateFeeAmount: Math.max(0, Number(form.lateFeeAmount) || 0),
      gracePeriodDays: Math.max(0, Math.round(Number(form.gracePeriodDays) || 0)),
      creditLimit: Math.max(0, Number(form.creditLimit) || 0),
    };
    ledger.updateSettings(next);
    setSaved(true);
  }

  const computedVariableRate =
    (Number(form.primeRate) || 0) + (Number(form.margin) || 0);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex items-center gap-3"
      >
        <Link
          href="/"
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">Settings</h1>
          <p className="text-xs text-ink-secondary sm:text-sm">
            Match these to what your bank actually charges — saved on this
            device and used for every new statement, purchase, and rate
            calculation.
          </p>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex flex-col gap-5"
      >
        {/* Card / bank identity */}
        <section className="glass p-5 sm:p-6">
          <SectionHeading icon={Landmark} title="Card" />
          <label className="mb-3.5 block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
              Bank / card name
            </span>
            <span className="field flex items-center">
              <input
                value={form.bankName}
                onChange={(e) => set("bankName", e.target.value)}
                placeholder="e.g. Chase Sapphire"
                className="field-inner"
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
              Credit limit
            </span>
            <span className="field flex items-center gap-2">
              <span className="text-sm text-white/35">$</span>
              <input
                inputMode="decimal"
                type="number"
                step="any"
                value={form.creditLimit}
                onChange={(e) => set("creditLimit", e.target.value)}
                className="field-inner"
              />
            </span>
            <span className="mt-1 block text-[11px] text-white/30">
              Prefills new statements — usable credit and utilization are
              calculated against whatever limit each statement locks in, so a
              later increase won&rsquo;t rewrite past utilization history.
            </span>
          </label>
        </section>

        {/* Interest rate */}
        <section className="glass p-5 sm:p-6">
          <SectionHeading icon={Percent} title="Interest rate" />

          <div className="mb-4 flex gap-2">
            <RateTypeButton
              label="Fixed"
              active={form.rateType === "fixed"}
              onClick={() => set("rateType", "fixed")}
            />
            <RateTypeButton
              label="Variable"
              active={form.rateType === "variable"}
              onClick={() => set("rateType", "variable")}
            />
          </div>

          {form.rateType === "fixed" ? (
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
                APR
              </span>
              <span className="field flex items-center gap-2">
                <input
                  inputMode="decimal"
                  type="number"
                  step="any"
                  value={form.defaultAPR}
                  onChange={(e) => set("defaultAPR", e.target.value)}
                  className="field-inner"
                />
                <span className="text-sm text-white/35">%</span>
              </span>
              <span className="mt-1 block text-[11px] text-white/30">
                Used for new statements and purchases until you log a rate
                change.
              </span>
            </label>
          ) : (
            <div className="grid grid-cols-2 gap-3.5">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
                  Prime rate
                </span>
                <span className="field flex items-center gap-2">
                  <input
                    inputMode="decimal"
                    type="number"
                    step="any"
                    value={form.primeRate}
                    onChange={(e) => set("primeRate", e.target.value)}
                    className="field-inner"
                  />
                  <span className="text-sm text-white/35">%</span>
                </span>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
                  Margin
                </span>
                <span className="field flex items-center gap-2">
                  <input
                    inputMode="decimal"
                    type="number"
                    step="any"
                    value={form.margin}
                    onChange={(e) => set("margin", e.target.value)}
                    className="field-inner"
                  />
                  <span className="text-sm text-white/35">%</span>
                </span>
              </label>
              <p className="col-span-2 text-[11px] text-white/30">
                Prime + margin = {computedVariableRate.toFixed(2)}% — update
                the prime rate here whenever your bank notifies you of a
                change, then log it as a rate change to keep past balances
                locked at their old rate.
              </p>
            </div>
          )}
        </section>

        {/* Due dates */}
        <section className="glass p-5 sm:p-6">
          <SectionHeading icon={CalendarDays} title="Billing cycle" />
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
              Grace period (days)
            </span>
            <span className="field flex items-center gap-2">
              <input
                inputMode="numeric"
                type="number"
                step="1"
                value={form.gracePeriodDays}
                onChange={(e) => set("gracePeriodDays", e.target.value)}
                className="field-inner"
              />
              <span className="text-sm text-white/35">days</span>
            </span>
            <span className="mt-1 block text-[11px] text-white/30">
              Default gap between statement date and due date when adding a
              new statement — matches most banks&rsquo; 21&ndash;25 day grace period.
            </span>
          </label>
        </section>

        {/* Penalties */}
        <section className="glass p-5 sm:p-6">
          <SectionHeading icon={ShieldAlert} title="Missed payment penalties" />
          <div className="grid grid-cols-2 gap-3.5">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
                Penalty APR
              </span>
              <span className="field flex items-center gap-2">
                <input
                  inputMode="decimal"
                  type="number"
                  step="any"
                  value={form.penaltyAPR}
                  onChange={(e) => set("penaltyAPR", e.target.value)}
                  className="field-inner"
                />
                <span className="text-sm text-white/35">%</span>
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-ink-secondary">
                Late fee
              </span>
              <span className="field flex items-center gap-2">
                <span className="text-sm text-white/35">$</span>
                <input
                  inputMode="decimal"
                  type="number"
                  step="any"
                  value={form.lateFeeAmount}
                  onChange={(e) => set("lateFeeAmount", e.target.value)}
                  className="field-inner"
                />
              </span>
            </label>
          </div>
          <p className="mt-2 text-[11px] text-white/30">
            Applied automatically the moment a due date passes without at
            least the minimum payment made — check your card&rsquo;s terms for
            the exact numbers.
          </p>
        </section>

        <div className="flex items-center gap-3">
          <button type="button" onClick={handleSave} className="btn-primary flex-1">
            Save settings
          </button>
          {saved && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-bank-green"
            >
              Saved
            </motion.span>
          )}
        </div>

        <p className="px-1 text-[11px] text-white/25">
          Settings are stored only in this browser, on this device — there&rsquo;s
          no account or server, so they won&rsquo;t carry over to a different
          phone or computer automatically.
        </p>
      </motion.div>
    </main>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="glass-inner flex h-8 w-8 items-center justify-center">
        <Icon className="h-4 w-4 text-bank-red" strokeWidth={2} />
      </div>
      <h2 className="font-semibold text-white">{title}</h2>
    </div>
  );
}

function RateTypeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-control px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-bank-red text-white"
          : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1]"
      }`}
    >
      {label}
    </button>
  );
}
