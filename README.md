# 💳 Credit Card Statement Tracker

A modern, interactive web application for tracking credit card statements, payments, purchases, interest, APR changes, credit utilization, and transaction history.

Built with **Next.js, React, TypeScript, and Tailwind CSS**, the application provides a centralized dashboard for understanding how credit card balances and activity change over time.

> 🚧 **This project is actively under development.** Features and calculations are still being refined, including transaction editing, real-time credit utilization, and several smaller application operations.

## 🚀 Features

### 📄 Statement Management

* Create and manage credit card statements
* Track statement dates and payment due dates
* Record statement balances
* Edit and delete statements
* Track statement history

### 💰 Payment Tracking

* Record credit card payments
* Track minimum payments
* Apply payments toward outstanding balances
* View payment history
* Update balances dynamically after payments

### 🛍️ Purchase Tracking

* Record individual purchases
* Add optional purchase categories
* Track purchases against the current balance
* View purchases in the transaction history

### 📈 Interest Calculations

* Calculate accrued credit card interest
* Track interest based on APR
* Monitor how interest affects outstanding balances
* Include interest activity in the transaction history

### 📊 Credit Utilization

* Track credit card utilization
* Display utilization based on the current balance and credit limit
* Update utilization as purchases and payments are recorded
* Provide a real-time view of current credit usage

### 📉 APR & Rate History

* Record APR changes
* Set effective dates for new rates
* Maintain historical APR records
* Track how rate changes affect interest calculations

### 🧾 Transaction History

* Maintain a complete transaction log
* Track purchases, payments, interest, and other activity
* Edit transaction records
* Delete or correct transactions
* Keep balances synchronized with transaction activity

### ⚠️ Missed Payment Recovery

* Handle missed payments
* Track recovery options
* Account for late-payment situations
* Record recovery activity in the transaction history

## 🚧 Current Development

The application is currently being refined and expanded.

### In Progress

* ✏️ Improved transaction/log editing
* 📊 Real-time credit utilization calculations
* 🔄 Better synchronization between transactions and balances
* 🧮 Refinements to interest calculations
* ⚙️ Minor operational improvements
* 🐛 Bug fixes and edge-case handling
* 🎨 UI/UX refinements

Features may change as development continues.

## 🛠️ Tech Stack

| Technology          | Purpose                        |
| ------------------- | ------------------------------ |
| **Next.js 14**      | Application framework          |
| **React 18**        | UI development                 |
| **TypeScript**      | Type-safe development          |
| **Tailwind CSS**    | Styling                        |
| **Framer Motion**   | Animations and transitions     |
| **Chart.js**        | Data visualization             |
| **react-chartjs-2** | React integration for Chart.js |
| **Lucide React**    | Icons                          |
| **React Hooks**     | State management               |
| **Local Storage**   | Data persistence               |

## 📦 Installation

### Prerequisites

* Node.js 18 or higher
* npm or yarn
* Git

### Clone the Repository

```bash
git clone https://github.com/Adriano-Perez/Credit-Card-Statement-Tracker.git
cd Credit-Card-Statement-Tracker
```

### Install Dependencies

```bash
npm install
```

### Start the Development Server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

## 📁 Project Structure

```text
Credit-Card-Statement-Tracker/
│
├── app/
│   ├── page.tsx
│   └── layout.tsx
│
├── components/
│   ├── modals/
│   │   ├── AddStatementModal.tsx
│   │   ├── EditStatementModal.tsx
│   │   ├── MakePaymentModal.tsx
│   │   ├── AddPurchaseModal.tsx
│   │   ├── AddRateChangeModal.tsx
│   │   ├── EditTransactionModal.tsx
│   │   └── MissedRecoveryModal.tsx
│   │
│   ├── Header.tsx
│   ├── StatCard.tsx
│   ├── AlertBanner.tsx
│   ├── BalanceDoughnut.tsx
│   ├── SliceDetailSheet.tsx
│   ├── RateBreakdown.tsx
│   ├── TransactionLog.tsx
│   ├── RateHistoryTimeline.tsx
│   └── HistoryTable.tsx
│
├── hooks/
│   └── useLedger.ts
│
├── lib/
│   ├── calculations.ts
│   ├── dates.ts
│   ├── storage.ts
│   └── format.ts
│
├── types/
│   └── index.ts
│
├── public/
│
├── package.json
└── README.md
```

## 🎯 How to Use

### Adding a Statement

1. Select **Add Statement**.
2. Enter the statement information.
3. Enter the statement and due dates.
4. Enter the applicable balances.
5. Save the statement.

### Making a Payment

1. Select **Make Payment**.
2. Enter the payment amount.
3. Confirm the payment.
4. The payment is added to the transaction history.
5. The tracked balance and utilization update accordingly.

### Recording a Purchase

1. Select **Add Purchase**.
2. Enter the purchase amount.
3. Optionally add a category.
4. Save the purchase.

The purchase is added to the transaction history and reflected in the current balance.

### Managing APR Changes

1. Select **Rate Change**.
2. Enter the new APR.
3. Enter the effective date.
4. Save the change.

The application maintains the rate history for future calculations and reference.

### Editing Transactions

Transactions can be reviewed through the transaction log. Editing functionality is currently being refined to ensure that changes correctly update related balances and calculations.

## 💾 Data Persistence

The application currently uses the browser's **localStorage** for data persistence.

This means:

* No external database is required.
* Data is stored locally in the browser.
* Data persists between browser sessions.
* No bank or credit card account connection is required.

> **Important:** Clearing browser site data or localStorage may remove saved application data.

## 🧮 Calculations

The application includes calculations for:

* Current balance
* Credit utilization
* Payments
* Purchases
* APR changes
* Accrued interest
* Transaction activity

Core financial calculations are located in:

```text
lib/calculations.ts
```

Date-related calculations are handled in:

```text
lib/dates.ts
```

## 🧪 Development

### Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint

```bash
npm run lint
```

## 🗺️ Planned Improvements

Future improvements may include:

* 📤 Statement and transaction exports
* 📥 Importing transaction data
* 📊 Additional financial visualizations
* 🔔 Payment due-date reminders
* 💳 Multiple credit card support
* 📱 Improved mobile experience
* 🌙 Dark mode
* ☁️ Optional cloud synchronization
* 📈 Advanced interest projections
* 📋 CSV/PDF exports
* 🔐 Optional account-based data synchronization

## 🔐 Privacy

The application does not require users to connect a bank or credit card account.

Financial information entered into the application is currently stored locally using browser localStorage.

## 🤝 Contributing

Contributions, bug reports, issues, and feature requests are welcome.

If you'd like to contribute:

```bash
git checkout -b feature/your-feature
```

Make your changes, commit them, and open a pull request.

## 📝 License

This project is licensed under the **MIT License**.

## 👤 Author

**Adriano Perez**

GitHub: [@Adriano-Perez](https://github.com/Adriano-Perez)
