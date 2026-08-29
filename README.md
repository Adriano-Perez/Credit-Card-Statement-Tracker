# 💳 Credit Card Statement Tracker

A modern, interactive web application for tracking credit card statements, payments, purchases, interest, APR changes, and overall balance history.

Built with **Next.js, React, TypeScript, and Tailwind CSS**, the application provides a simple dashboard for understanding how credit card balances change over time.

## 🚀 Features

### 📄 Statement Management

* Create and manage credit card statements
* Track statement dates and payment due dates
* Record statement balances
* Edit or delete existing statements

### 💰 Payment Tracking

* Record credit card payments
* Track minimum payments
* Apply payments toward outstanding balances
* View payment history

### 🛍️ Purchase Tracking

* Record individual purchases
* Add optional purchase categories
* Track purchases against the current balance
* View purchases in the transaction history

### 📈 Interest Calculations

* Calculate accrued credit card interest
* Track interest based on APR
* Monitor how interest affects the outstanding balance
* View interest as part of the overall balance breakdown

### 📊 Balance Visualization

* Interactive doughnut chart
* Visual breakdown of balance components
* Detailed information for individual balance categories
* Easy-to-understand financial overview

### 📉 APR & Rate History

* Record APR changes
* Set effective dates for new rates
* Maintain a historical record of rate changes
* Track how changing interest rates affect calculations

### 🧾 Transaction History

* Complete transaction log
* Payments
* Purchases
* Interest
* Statement activity
* Edit transaction records when needed

### ⚠️ Missed Payment Recovery

* Handle missed payments
* Track recovery options
* Account for late-payment situations
* Keep recovery activity within the transaction history

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

Make sure you have:

* [Node.js](https://nodejs.org/) 18 or higher
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

Then open:

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
3. Provide the statement date and payment due date.
4. Enter the applicable balances.
5. Submit the statement.

The application will begin tracking activity associated with the statement.

### Making a Payment

1. Select **Make Payment**.
2. Enter the payment amount.
3. Confirm the payment.
4. The payment is added to the transaction history and applied to the tracked balance.

### Recording a Purchase

1. Select **Add Purchase**.
2. Enter the purchase amount.
3. Optionally select or enter a category.
4. Submit the purchase.

The purchase will be reflected in the current balance and transaction history.

### Managing APR Changes

1. Select **Rate Change**.
2. Enter the new APR.
3. Enter the effective date.
4. Save the change.

The application maintains the rate history so previous APRs can be reviewed.

## 💾 Data Persistence

This application uses the browser's **localStorage** to persist data.

That means:

* No external database is required.
* Data remains available between browser sessions.
* Your financial data stays stored locally in your browser.
* The application can run without a backend database.

> **Important:** Clearing your browser's site data/localStorage can remove your saved application data. Export/backup functionality should be used if implemented in the application.

## 🧮 Financial Calculations

The application is designed to help visualize and track credit card activity, including:

* Outstanding balances
* Payments
* Purchases
* APR changes
* Accrued interest
* Transaction history

Interest calculations are implemented in:

```text
lib/calculations.ts
```

Date-related calculations are handled in:

```text
lib/dates.ts
```

## 🧪 Development

### Run the Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Start the Production Build

```bash
npm start
```

### Run Linting

```bash
npm run lint
```

## 🔐 Privacy

The application is designed around local data storage and does not require users to connect a bank or credit card account.

No external financial account connection is required to use the tracker.

## 🗺️ Future Improvements

Potential future features include:

* 📤 Export statements and transactions
* 📥 Import transaction data
* 📊 Additional financial charts
* 🔔 Payment due-date reminders
* 💵 Multiple credit card support
* 📱 Improved mobile experience
* 🌙 Dark mode
* ☁️ Optional cloud synchronization
* 📈 More detailed interest projections
* 📋 CSV/PDF statement exports

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

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
