import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import { Layout } from './components/Layout.jsx';

import { Home } from './pages/Home.jsx';
import { Transactions } from './pages/Transactions.jsx';
import { Reports } from './pages/Reports.jsx';
import { Profile } from './pages/Profile.jsx';
import { ProfileInfo } from './pages/ProfileInfo.jsx';
import { AddTransaction } from './pages/AddTransaction.jsx';
import { TransactionDetail } from './pages/TransactionDetail.jsx';
import { Friends } from './pages/Friends.jsx';
import { FriendDetail } from './pages/FriendDetail.jsx';
import { AddLedger } from './pages/AddLedger.jsx';
import { Login } from './pages/Login.jsx';
import { AppSettings } from './pages/AppSettings.jsx';
import { useAppContext } from './context/AppContext.jsx';

const AuthWrapper = () => {
  const { user, isLoading } = useAppContext();

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="friends" element={<Friends />} />
          <Route path="friends/:name" element={<FriendDetail />} />
          <Route path="settings" element={<Profile />} />
        </Route>
        <Route path="/add" element={<AddTransaction />} />
        <Route path="/transaction/:id" element={<TransactionDetail />} />
        <Route path="/add-ledger" element={<AddLedger />} />
        <Route path="/profile-info" element={<ProfileInfo />} />
        <Route path="/app-settings" element={<AppSettings />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AppProvider>
      <AuthWrapper />
    </AppProvider>
  );
}

export default App;
