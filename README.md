# Trecker. 💰

Trecker is a premium, offline-first personal finance and peer-to-peer (P2P) ledger application. Inspired by modern fintech aesthetics, it provides a highly polished, interactive experience to log expenses, split bills with friends, track bike mileage, and visualize financial trends.

---

## 🚀 Technology Stack

- **Frontend Core**: React 18 (Vite-powered)
- **Routing**: React Router DOM v6
- **Styling**: Modern Vanilla CSS (with HSL theme variables, glassmorphic effects, and fluid micro-animations)
- **Data Persistence**: 
  - **Local**: `localforage` (IndexedDB fallback) for offline-first capabilities.
  - **Cloud Sync**: Firebase Authentication & Cloud Firestore (supports anonymous guest sessions and full account sync).
- **Icons**: React Icons (Io5 / Lucide)
- **Date Management**: `date-fns`

---

## 🎨 Key Features & Functional Modules

### 1. Core Expense Tracking & Dashboard
- **Home Dashboard**: View net balance, monthly income, monthly expenses, and recent transaction feeds.
- **Add Transactions**:
  - Fully custom numeral keypad layout.
  - **Math Parser**: Enter equations directly in the amount input (e.g. `120 + 85 * 2`) to auto-calculate the total and optionally append the equation to the transaction note.
  - Categorization and with-whom suggestion tags based on previous entries.
- **Unified Transaction History**:
  - Search and filter records by Type (Income/Expense), Month, Year, Custom Date Range, or Friend Name.
  - KPI summary cards update instantly as filters are applied.

### 2. Friends Ledger (P2P lending & splits)
- **Name Normalization**: Automatically normalizes names case-insensitively (e.g. "Virat" and "virat" are recognized as the same person) to keep ledger data clean and unified.
- **P2P Ledger Dashboard**: Tracks overall lending balances ("You Gave" vs "They Gave").
- **Friend Detail Screen**:
  - Chronological transaction feed filtered down to a single person.
  - **Settle Up**: Enter a settlement amount and note to automatically decrease outstanding debt.
  - **Management Tools**: Rename or delete a friend (deletes their ledger history and safely updates active splits) with elegant confirm modals.
- **Context-Aware Floating Action Button (FAB)**:
  - Clicking the bottom white FAB while viewing a friend's details automatically routes to `/add?friend=NAME` and pre-populates the split group list with that friend's name.
  - **Default Transaction Split States**:
    - "Include me in the split" defaults to **OFF** (grey).
    - "Track split balance" defaults to **OFF** (grey).
    - "For my Bike (Mileage Tracking)" defaults to **ON** (green) when selecting vehicle/fuel categories.

### 3. Bike Mileage & Analytics
- **Fuel Categories**: Toggling fuel/service categories displays odometer (km) and fuel capacity (litres) tracking inputs.
- **Pricing Defaults**: Remembers your preferred default fuel pricing in settings.
- **Interactive Reports**: Aggregates income vs. expense graphs.

---

## 📂 Project Structure

```bash
├── public/                 # Static assets
├── src/
│   ├── components/         # Shared components (Layout, Cards, Sheets)
│   ├── context/            # AppContext.jsx for global state, Auth, and syncing
│   ├── pages/              # Screen components:
│   │   ├── Home.jsx             # Dashboards
│   │   ├── Friends.jsx          # Friends List
│   │   ├── FriendDetail.jsx     # Friend Transaction History & Settle Up
│   │   ├── AddTransaction.jsx   # Log Splits, Fuel, and expenses
│   │   ├── AddLedger.jsx        # Log Transfers
│   │   ├── Transactions.jsx     # Transactions List
│   │   ├── AppSettings.jsx      # Measurement Units & Pricing Settings
│   │   └── Login.jsx            # Account Login screen
│   ├── utils/              # Name normalization & sanitization utilities
│   ├── App.jsx             # React Routes config
│   ├── index.css           # CSS design tokens, resets, animations, & themes
│   └── main.jsx            # React entrypoint
├── package.json
└── vite.config.js
```

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd Trecker
   ```
2. Install the package dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your web browser.
