import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';
import { normalizeName, normalizePeopleList } from '../utils/names';
import { auth, db, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    distanceUnit: 'km',
    fuelUnit: 'Litre',
    defaultFuelPrice: 104.5
  });
  const [isLoading, setIsLoading] = useState(true);

  // Firebase Auth & Firestore Sync
  useEffect(() => {
    console.log("AppContext: Initializing Auth listener...");
    
    // Safety timeout: If loading takes more than 5 seconds, force stop loading
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("AppContext: Loading timed out, forcing UI render.");
        setIsLoading(false);
      }
    }, 5000);

    let unsubscribeAuth;
    try {
      unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
        clearTimeout(loadingTimeout);
        console.log("AppContext: Auth state changed:", firebaseUser ? "User Logged In" : "No User");
        
        if (firebaseUser) {
          setUser(firebaseUser);
          
          // Setup Firestore listeners for the logged-in user
          const userRef = doc(db, 'users', firebaseUser.uid);
          
          // 1. Settings Listener
          const unsubSettings = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().settings) {
              setSettings(docSnap.data().settings);
            }
          }, (err) => console.error("Settings listener error:", err));

          // 2. Transactions Listener
          const txnsQuery = query(collection(db, 'users', firebaseUser.uid, 'transactions'), orderBy('date', 'desc'));
          const unsubTxns = onSnapshot(txnsQuery, (snapshot) => {
            const docs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
            setTransactions(docs);
          }, (err) => console.error("Transactions listener error:", err));

          // 3. Ledger Listener
          const ledgerQuery = query(collection(db, 'users', firebaseUser.uid, 'ledger'), orderBy('date', 'desc'));
          const unsubLedger = onSnapshot(ledgerQuery, (snapshot) => {
            const docs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
            setLedger(docs);
          }, (err) => console.error("Ledger listener error:", err));

          setIsLoading(false);

          return () => {
            unsubSettings();
            unsubTxns();
            unsubLedger();
          };
        } else {
          setUser(null);
          // Fallback to local data if not logged in (optional, or just clear)
          const loadLocalData = async () => {
            try {
              const stored = await localforage.getItem('trecker_transactions') || [];
              const storedLedger = await localforage.getItem('trecker_ledger') || [];
              const storedSettings = await localforage.getItem('trecker_settings') || {
                distanceUnit: 'km',
                fuelUnit: 'Litre',
                defaultFuelPrice: 104.5
              };
              setTransactions(stored);
              setLedger(storedLedger);
              setSettings(storedSettings);
            } catch (err) {
              console.error("Local load failed", err);
            } finally {
              setIsLoading(false);
            }
          };
          loadLocalData();
        }
      }, (err) => {
        console.error("onAuthStateChanged error:", err);
        setIsLoading(false);
      });
    } catch (err) {
      console.error("Firebase Auth listener setup failed:", err);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      clearTimeout(loadingTimeout);
    };
  }, []);

  // Save to localforage as secondary backup (optional)
  useEffect(() => {
    if (!isLoading && !user) {
      localforage.setItem('trecker_transactions', transactions);
      localforage.setItem('trecker_ledger', ledger);
      localforage.setItem('trecker_settings', settings);
    }
  }, [transactions, ledger, settings, isLoading, user]);

  const addTransaction = async (txn) => {
    let finalDate = new Date();
    if (txn.date) {
      const [year, month, day] = txn.date.split('-');
      finalDate.setFullYear(year, month - 1, day);
    }
    const { date, ...rest } = txn;
    const normalizedWithWhom = rest.withWhom ? normalizePeopleList(rest.withWhom) : '';
    const newTxn = { ...rest, withWhom: normalizedWithWhom, date: finalDate.toISOString() };

    // Save to Firestore ONLY if it's a real authenticated user
    if (user && !user.isGuest) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), newTxn);
      } catch (err) {
        console.error("AppContext: Failed to save transaction:", err);
      }
    } else {
      // Save to local state for Guests
      setTransactions(prev => [{ ...newTxn, id: Date.now().toString() }, ...prev]);
    }
  };

  const importTransactions = (newTxns) => {
    // newTxns should already have id and date in ISO format
    setTransactions(prev => [...newTxns, ...prev]);
  };

  const deleteTransaction = async (id) => {
    if (user && !user.isGuest) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      } catch (err) {
        console.error("Delete failed:", err);
      }
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateTransaction = async (id, updatedTxn) => {
    let finalDate = new Date();
    if (updatedTxn.date) {
      const [year, month, day] = updatedTxn.date.split('-');
      finalDate.setFullYear(year, month - 1, day);
    }
    const { date, ...rest } = updatedTxn;
    const normalizedWithWhom = rest.withWhom ? normalizePeopleList(rest.withWhom) : '';
    const finalTxn = { ...rest, withWhom: normalizedWithWhom, date: finalDate.toISOString() };
    
    if (user && !user.isGuest) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'transactions', id), finalTxn);
      } catch (err) {
        console.error("Update failed:", err);
      }
    } else {
      setTransactions(prev => prev.map(t => t.id === id ? { ...finalTxn, id } : t));
    }
  };

  const getBalance = () => {
    return transactions.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  };

  const addLedgerTxn = async (txn) => {
    let finalDate = new Date();
    if (txn.date) {
      const [year, month, day] = txn.date.split('-');
      finalDate.setFullYear(year, month - 1, day);
    }
    const { date, ...rest } = txn;
    const normalizedPerson = rest.person ? normalizeName(rest.person) : '';
    const newTxn = { ...rest, person: normalizedPerson, date: finalDate.toISOString() };

    if (user && !user.isGuest) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'ledger'), newTxn);
      } catch (err) {
        console.error("AppContext: Failed to save ledger entry:", err);
      }
    } else {
      setLedger(prev => [{ ...newTxn, id: Date.now().toString() }, ...prev]);
    }
  };

  const deleteLedgerTxn = async (id) => {
    if (user && !user.isGuest) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'ledger', id));
      } catch (err) {
        console.error("Delete ledger failed:", err);
      }
    } else {
      setLedger(prev => prev.filter(t => t.id !== id));
    }
  };

  const updateLedgerTxn = async (id, updatedTxn) => {
    let finalDate = new Date();
    if (updatedTxn.date) {
      const [year, month, day] = updatedTxn.date.split('-');
      finalDate.setFullYear(year, month - 1, day);
    }
    const { date, ...rest } = updatedTxn;
    const normalizedPerson = rest.person ? normalizeName(rest.person) : '';
    const finalTxn = { ...rest, person: normalizedPerson, date: finalDate.toISOString() };

    if (user && !user.isGuest) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'ledger', id), finalTxn);
      } catch (err) {
        console.error("Update ledger failed:", err);
      }
    } else {
      setLedger(prev => prev.map(t => t.id === id ? { ...finalTxn, id } : t));
    }
  };

  const renameFriend = async (oldName, newName) => {
    const normalizedOld = normalizeName(oldName);
    const normalizedNew = normalizeName(newName);
    if (!normalizedNew || normalizedOld === normalizedNew) return;

    const updatedLedger = ledger.map(item => {
      if (normalizeName(item.person) === normalizedOld) {
        return { ...item, person: normalizedNew };
      }
      return item;
    });

    const updatedTransactions = transactions.map(item => {
      if (item.withWhom) {
        const names = item.withWhom.split(',').map(n => n.trim());
        const hasOldName = names.some(n => normalizeName(n) === normalizedOld);
        if (hasOldName) {
          const newNames = names.map(n => normalizeName(n) === normalizedOld ? normalizedNew : n);
          return { ...item, withWhom: newNames.join(', ') };
        }
      }
      return item;
    });

    if (user && !user.isGuest) {
      try {
        const ledgerPromises = ledger
          .filter(item => normalizeName(item.person) === normalizedOld)
          .map(item => updateDoc(doc(db, 'users', user.uid, 'ledger', item.id), { person: normalizedNew }));

        const txnPromises = transactions
          .filter(item => item.withWhom && item.withWhom.split(',').map(n => n.trim().toLowerCase()).includes(normalizedOld.toLowerCase()))
          .map(item => {
            const names = item.withWhom.split(',').map(n => n.trim());
            const newNames = names.map(n => normalizeName(n) === normalizedOld ? normalizedNew : n);
            return updateDoc(doc(db, 'users', user.uid, 'transactions', item.id), { withWhom: newNames.join(', ') });
          });

        await Promise.all([...ledgerPromises, ...txnPromises]);
      } catch (err) {
        console.error("Rename friend failed:", err);
      }
    } else {
      setLedger(updatedLedger);
      setTransactions(updatedTransactions);
    }
  };

  const deleteFriend = async (friendName) => {
    const normalized = normalizeName(friendName);

    const updatedLedger = ledger.filter(item => normalizeName(item.person) !== normalized);
    const updatedTransactions = transactions.map(item => {
      if (item.withWhom) {
        const names = item.withWhom.split(',').map(n => n.trim()).filter(Boolean);
        const filteredNames = names.filter(n => normalizeName(n) !== normalized);
        if (filteredNames.length === 0) {
          return { ...item, withWhom: '', numberOfPeople: 1 };
        } else {
          const includeMe = item.includeMe !== false;
          return {
            ...item,
            withWhom: filteredNames.join(', '),
            numberOfPeople: filteredNames.length + (includeMe ? 1 : 0)
          };
        }
      }
      return item;
    });

    if (user && !user.isGuest) {
      try {
        const ledgerPromises = ledger
          .filter(item => normalizeName(item.person) === normalized)
          .map(item => deleteDoc(doc(db, 'users', user.uid, 'ledger', item.id)));

        const txnPromises = transactions
          .filter(item => item.withWhom && item.withWhom.split(',').map(n => n.trim().toLowerCase()).includes(normalized.toLowerCase()))
          .map(item => {
            const names = item.withWhom.split(',').map(n => n.trim()).filter(Boolean);
            const filteredNames = names.filter(n => normalizeName(n) !== normalized);
            if (filteredNames.length === 0) {
              return updateDoc(doc(db, 'users', user.uid, 'transactions', item.id), { withWhom: '', numberOfPeople: 1 });
            } else {
              const includeMe = item.includeMe !== false;
              return updateDoc(doc(db, 'users', user.uid, 'transactions', item.id), {
                withWhom: filteredNames.join(', '),
                numberOfPeople: filteredNames.length + (includeMe ? 1 : 0)
              });
            }
          });

        await Promise.all([...ledgerPromises, ...txnPromises]);
      } catch (err) {
        console.error("Delete friend failed:", err);
      }
    } else {
      setLedger(updatedLedger);
      setTransactions(updatedTransactions);
    }
  };


  const login = async (guestData = null) => {
    if (guestData) {
      // Manual guest login
      setUser({
        uid: 'guest_' + Date.now(),
        displayName: `${guestData.firstName || ''} ${guestData.lastName || ''}`.trim(),
        isGuest: true
      });
      setIsLoading(false);
    } else {
      // Google Login
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("Login failed", error);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateUser = async (updatedData) => {
    if (user && auth.currentUser) {
      // Update Firebase Profile
      try {
        await updateProfile(auth.currentUser, {
          displayName: `${updatedData.firstName || ''} ${updatedData.lastName || ''}`.trim(),
          photoURL: updatedData.photo || null
        });
        // State will be updated by auth listener or manually
        setUser({ ...auth.currentUser });
      } catch (error) {
        console.error("Failed to update Firebase profile", error);
      }
    } else {
      // Update local state for guest
      setUser(prev => ({ ...prev, ...updatedData }));
    }
  };

  const eraseAllData = async () => {
    if (user) {
      // In a real app, you'd delete Firestore docs. For now, just logout.
      await logout();
    }
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
      importTransactions,
      updateTransaction,
      deleteTransaction,
      addLedgerTxn,
      deleteLedgerTxn,
      updateLedgerTxn,
      renameFriend,
      deleteFriend,
      getBalance,
      isLoading,
      settings,
      updateSettings: async (newSettings) => {
        const merged = { ...settings, ...newSettings };
        if (user && !user.isGuest) {
          try {
            await setDoc(doc(db, 'users', user.uid), { settings: merged }, { merge: true });
          } catch (err) {
            console.error("Settings save failed:", err);
          }
        } else {
          setSettings(merged);
        }
      }
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
