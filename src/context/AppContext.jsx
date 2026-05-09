import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await localforage.getItem('trecker_transactions');
        const storedLedger = await localforage.getItem('trecker_ledger');
        const storedUser = await localforage.getItem('trecker_user');
        
        if (stored) {
          setTransactions(stored);
        }
        if (storedLedger) {
          setLedger(storedLedger);
        }
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save data on change
  useEffect(() => {
    if (!isLoading) {
      localforage.setItem('trecker_transactions', transactions);
      localforage.setItem('trecker_ledger', ledger);
      localforage.setItem('trecker_user', user);
    }
  }, [transactions, ledger, user, isLoading]);

  const addTransaction = (txn) => {
    let finalDate = new Date();
    if (txn.date) {
      // If a custom date string "YYYY-MM-DD" was provided
      const [year, month, day] = txn.date.split('-');
      // Keep current time, just change year/month/day
      finalDate.setFullYear(year, month - 1, day);
    }
    
    // Remove the passed string date and use the ISO format
    const { date, ...rest } = txn;
    setTransactions(prev => [{ ...rest, id: Date.now().toString(), date: finalDate.toISOString() }, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getBalance = () => {
    return transactions.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  };

  const addLedgerTxn = (txn) => {
    let finalDate = new Date();
    if (txn.date) {
      const [year, month, day] = txn.date.split('-');
      finalDate.setFullYear(year, month - 1, day);
    }
    const { date, ...rest } = txn;
    setLedger(prev => [{ ...rest, id: Date.now().toString(), date: finalDate.toISOString() }, ...prev]);
  };

  const deleteLedgerTxn = (id) => {
    setLedger(prev => prev.filter(t => t.id !== id));
  };

  const login = (userData) => {
    setUser(userData);
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const logout = () => {
    setUser(null);
  };

  const eraseAllData = async () => {
    setTransactions([]);
    setLedger([]);
    setUser(null);
    await localforage.clear();
  };

  return (
    <AppContext.Provider value={{
      user,
      login,
      updateUser,
      logout,
      eraseAllData,
      transactions,
      ledger,
      addTransaction,
      deleteTransaction,
      addLedgerTxn,
      deleteLedgerTxn,
      getBalance,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
