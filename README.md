# Vault — Premium Credit Card Manager

A full interest-accrual engine for a credit card statement, not just a
calculator: it tracks the grace period, locks in rates per-transaction,
auto-applies late fees and penalty APR the moment a payment is missed,
and shows a recovery plan to get back to normal.

## The core rule this app is built around

**Interest does not start on the statement date — only after the due
date passes, and only on what's left unpaid.**

```
Statement Date  →  Grace Period (no interest)  →  Due Date
                                                      │
                              paid in full? ──yes──►  done, no interest
                                     │no
                                     ▼
                     paid ≥ minimum?  ──yes──► interest accrues on the
                                                leftover only, at your
                                                card's normal APR
                                     │no
                                     ▼
                     Late fee + penalty APR (29.99% default) applied
                     automatically. Interest now accrues on the full
                     previous balance until you pay enough to catch up.
```

## Stack

- Next.js 14 (App Router) + TypeScript — fully typed, no `any`
- Tailwind CSS — flat, glassmorphism dark theme, **no gradients anywhere**
  (every color is a solid fill; meaning lives in which color is used,
  not in blending between them)
- Chart.js + react-chartjs-2 (4-slice doughnut, click-to-inspect)
- Framer Motion (page/card/list/modal animations)
- lucide-react (icons)
- Browser `localStorage` — no backend, no server, no accounts

## Getting started

Requires Node.js 18.17+ (Node 20 LTS recommended).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). It's mobile-first —
try it in your browser's device toolbar or on your phone (same wifi:
`npm run dev -- -H 0.0.0.0`, then visit your computer's LAN IP from
your phone).

```bash
npm run build   # production build
npm run start   # serve the production build
```

## How the money math works

**The four balance buckets** (`lib/calculations.ts` → `deriveStatement`):

| Slice | Color | What it is | When it shows |
|---|---|---|---|
| Safe | Green | Previous statement balance | Still in the grace period |
| New spending | Gold | Current balance − previous balance | Always, if there's new spending |
| Accruing | Red | Previous balance − amount paid | Past due, minimum was paid |
| Past due | Dark red | Previous balance − amount paid | Past due, minimum was **not** paid |

**Rate locking**: every purchase and every statement stores the rate
that was active *on that date* (`getRateForDate`). Logging a new rate
change (Settings → or the "Rate change" action) only ever affects
things dated after it — nothing already on the books is touched.

**Missed payment flow**: `applyMissedPaymentIfNeeded` runs on every
load. The moment it sees a statement past its due date with less than
the minimum paid, it applies your settings' late fee and penalty APR
exactly once (idempotent — safe to check repeatedly) and logs a
missed-payment record. The penalty stays active — even if you later
pay more than the original minimum — until `allocatePayment` sees the
leftover and late fee both fully cleared. That's "recovery."

**Payment allocation**, in order: late fees first, then the previous
balance's leftover (whatever color it's currently drawn as), then new
spending. Implemented in `allocatePayment`.

**Credit utilization**: each statement locks in the credit limit that
was active when it was created (same pattern as rate locking), so a
later limit increase or decrease never rewrites a past period's
reported utilization. Two more stat cards cover it — Usable credit
(`limit − current balance`) and Utilization (`current balance ÷ limit
× 100`, color-coded green/gold/red at the usual 30%/50% bureau-style
bands) — and every statement in the history table logs its own
Limit and Util. columns, so you can see the trend period to period.

## Settings (the "edit your bank's numbers" page)

`/settings` lets you match the app to your actual card: bank name,
fixed or variable APR (prime + margin), penalty APR, late fee amount,
and default grace period length. Saved to `localStorage` and used for
every new statement/purchase/interest calculation from then on.

**Important limitation, stated plainly**: this is per-browser,
per-device storage — there's no account or server, so settings (and
all your statement data) won't sync between your phone and your
computer automatically. The layout itself is fully responsive (phone
→ tablet → desktop, same codebase, no separate "mobile app"), but the
*data* stays wherever you entered it unless you manually re-enter it
on the other device.

## Project structure

```
app/
  page.tsx              Main dashboard
  settings/page.tsx      Editable bank defaults (APR, fees, grace period)
  layout.tsx             Root layout, Inter font, flat dark background
  globals.css             Tailwind layers + flat glass utility classes
hooks/
  useLedger.ts            All state: statements, transactions, rate
                          history, missed payments, settings — load,
                          persist, derive, and every action (add
                          statement, make payment, add purchase, add
                          rate change, delete)
components/
  Header.tsx, AlertBanner.tsx, StatCard.tsx
  BalanceDoughnut.tsx     4-slice doughnut, clickable
  SliceDetailSheet.tsx    Bottom sheet explaining a clicked slice
  RateBreakdown.tsx, RateHistoryTimeline.tsx, TransactionLog.tsx
  HistoryTable.tsx        Past statements
  BottomSheet.tsx         Shared modal/sheet shell
  modals/                 Add Statement, Make Payment, Add Purchase,
                          Add Rate Change, Missed-Payment Recovery
lib/
  calculations.ts         Interest math, rate locking, payment
                          allocation, rate breakdown — all pure functions
  dates.ts                YYYY-MM-DD date-string helpers (no timezone bugs)
  storage.ts               localStorage read/write for every collection
types/
  index.ts                 Every shared type + DEFAULT_SETTINGS
```

## What's intentionally not included

The original spec's "additional features to consider" list — What-If
payment calculator, 30/60/90-day interest projection, push-style due
date reminders, CSV/JSON export, spending-by-category charts, a credit
score simulator, and live Prime-rate feed notifications — are out of
scope for this build. They're genuinely separate features (some need
a backend or a live data feed this client-only app doesn't have), not
oversights. Everything under "Core Business Logic" in the spec —
accrual timing, rate locking, the four-slice breakdown, payment status
logic, missed-payment handling, and payment allocation priority — is
implemented and covered above.
