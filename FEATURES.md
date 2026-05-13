# Trecker Application Features

This document outlines the current capabilities and feature set of the Trecker app, a premium, offline-first personal finance and peer-to-peer ledger application.

## 🎨 Design & Architecture
- **Offline-First Storage**: Built entirely on `localforage`, allowing the application to work completely offline with data saved securely on the user's local device.
- **Premium UI/UX**: Features a highly polished, minimalistic, dark-mode-first aesthetic inspired by modern fintech applications (e.g., CRED).
- **Glassmorphic Navigation**: A global, context-aware floating bottom navigation bar that intelligently routes the central `+` action button based on the current active screen.
- **Micro-interactions**: Enhanced UX details including tap-outside-to-close dropdowns, smooth bottom sheet animations, and dynamic native element color schemes.

## 💰 Core Expense Tracking
- **Dashboard (Home)**: High-level overview displaying Total Balance, Monthly Income, Monthly Expenses, and a quick glance at recent transactions.
- **Add Transactions (Income/Expense)**:
  - Beautiful, massive numeric keypad layout.
  - Built-in math parser in the amount field (e.g., typing `50+25` calculates the total automatically and can optionally save the equation to the note).
  - Categorization and optional "With Whom" tracking (featuring dropdown suggestions based on past entries).
- **Transaction History**:
  - Unified feed of all transactions.
  - Advanced filtering: By Type (All, Expense, Income), By Date (Specific Month, Year, or Custom Range via native Bottom Sheet), and By Person.
  - Contextual KPIs that recalculate dynamically based on active filters.

## 🤝 Friends Ledger (P2P Lending)
- **Friends Dashboard**: A dedicated ledger mirroring "Splitwise" functionality to track debts. Shows macro KPIs: "Total Gave" and "Total Got".
- **Net Balances**: Automatically calculates and displays the net settled/unsettled balance with individual friends.
- **Add Transfer**: Exact UI parity with the core Add Transaction screen for adding money "Lent" (I Gave) or "Borrowed" (I Got) to specific people.
- **Friend Details**: A drilled-down, person-specific transaction history to view exact chronological interactions with a specific individual.

## 📊 Analytics & Settings
- **Reports**: Visual breakdown of expenses vs. income over time.
- **Profile & Settings**:
  - **Profile Info**: Ability to set and manage personal user information (First Name, Last Name, Profile Photo).
  - **Data Export**: Allows users to export their transaction data to Excel (`.xlsx`) format, filtered by custom date ranges.
  - **Data Management**: "Erase My Data" functionality with safe, custom confirmation modals (replacing ugly native browser alerts).
  - **Authentication**: Login/Logout flow to protect sensitive financial data.
