import React, { useMemo } from 'react';
import { format, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { IoCloudDownloadOutline } from 'react-icons/io5';
import { useAppContext } from '../context/AppContext.jsx';
import { Card } from '../components/ui.jsx';

export const Home = () => {
  const { transactions } = useAppContext();
  const navigate = useNavigate();
  
  // Home screen now shows all-time summary (No filters as requested)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return isValid(txnDate);
    });
  }, [transactions]);

  const balance = useMemo(() => filteredTransactions.reduce((acc, curr) => {
    const people = curr.withWhom ? curr.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
    const numPeople = curr.numberOfPeople || (people.length + (curr.includeMe !== false ? 1 : 0)) || 1;
    const userShare = curr.withWhom 
      ? (curr.trackBalance === false ? curr.amount : (curr.includeMe !== false ? curr.amount / numPeople : 0))
      : curr.amount;
    return curr.type === 'income' ? acc + userShare : acc - userShare;
  }, 0), [filteredTransactions]);
  
  const totalIncome = useMemo(() => filteredTransactions.reduce((acc, curr) => {
    if (curr.type !== 'income') return acc;
    const people = curr.withWhom ? curr.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
    const numPeople = curr.numberOfPeople || (people.length + (curr.includeMe !== false ? 1 : 0)) || 1;
    const userShare = curr.withWhom 
      ? (curr.trackBalance === false ? curr.amount : (curr.includeMe !== false ? curr.amount / numPeople : 0))
      : curr.amount;
    return acc + userShare;
  }, 0), [filteredTransactions]);
  
  const totalExpense = useMemo(() => filteredTransactions.reduce((acc, curr) => {
    if (curr.type !== 'expense') return acc;
    const people = curr.withWhom ? curr.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
    const numPeople = curr.numberOfPeople || (people.length + (curr.includeMe !== false ? 1 : 0)) || 1;
    const userShare = curr.withWhom 
      ? (curr.trackBalance === false ? curr.amount : (curr.includeMe !== false ? curr.amount / numPeople : 0))
      : curr.amount;
    return acc + userShare;
  }, 0), [filteredTransactions]);

  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <div style={{ padding: '20px 20px 24px', animation: 'fadeIn 0.6s ease' }}>
      <Card style={{ 
        marginBottom: '32px', 
        padding: '28px 24px', 
        background: 'linear-gradient(145deg, #1e1e1e 0%, #111 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        borderRadius: '28px'
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', fontWeight: '700' }}>
          Total Balance
        </div>
        <h2 style={{ 
          fontSize: '42px', 
          fontWeight: '800', 
          color: balance >= 0 ? 'var(--text-primary)' : 'var(--accent-danger)',
          letterSpacing: '-1px',
          marginBottom: '28px'
        }}>
          ₹{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h2>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ 
            flex: 1, 
            background: 'rgba(255,255,255,0.03)', 
            padding: '16px', 
            borderRadius: '18px', 
            border: '1px solid rgba(255,255,255,0.03)' 
          }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Income</span>
            <div style={{ color: 'var(--accent-success)', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>₹{totalIncome.toLocaleString()}</div>
          </div>
          <div style={{ 
            flex: 1, 
            background: 'rgba(255,255,255,0.03)', 
            padding: '16px', 
            borderRadius: '18px', 
            border: '1px solid rgba(255,255,255,0.03)' 
          }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Expense</span>
            <div style={{ color: 'var(--accent-danger)', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>₹{totalExpense.toLocaleString()}</div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 4px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Recent Activity</h3>
        <button 
          onClick={() => navigate('/transactions')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            fontSize: '13px', 
            color: 'var(--text-secondary)', 
            fontWeight: '600', 
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          View All
        </button>
      </div>

      {recentTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', opacity: 0.6 }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>☕</div>
          <p style={{ fontSize: '15px', fontWeight: '600' }}>No activity found</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Time to log some entries!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
          {recentTransactions.map((txn, index) => (
            <div 
              key={txn.id} 
              onClick={() => navigate(`/transaction/${txn.id}`)}
              className="animate-slide-up"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                background: 'var(--bg-card)',
                borderRadius: '20px',
                padding: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                transition: 'transform 0.2s ease, background 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ 
                  width: '44px', height: '44px', borderRadius: '14px', 
                  background: 'rgba(255,255,255,0.03)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px' 
                }}>
                  {txn.category?.toLowerCase().includes('fuel') ? '⛽' : 
                   txn.category?.toLowerCase().includes('food') ? '🍔' : 
                   txn.category?.toLowerCase().includes('salary') ? '💰' : '📄'}
                </div>
                <div>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '15px', 
                    marginBottom: '2px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    maxWidth: '180px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {txn.category}
                    {txn.isImported && (
                      <IoCloudDownloadOutline size={12} color="var(--text-tertiary)" title="Imported" />
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {format(new Date(txn.date), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {(() => {
                  const people = txn.withWhom ? txn.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
                  const numPeople = txn.numberOfPeople || (people.length + (txn.includeMe !== false ? 1 : 0)) || 1;
                  const isSplit = !!txn.withWhom;
                  
                  const displayShare = txn.withWhom ? (txn.includeMe !== false ? txn.amount / numPeople : 0) : txn.amount;

                  return (
                    <>
                      <div style={{ 
                        fontWeight: '800', 
                        fontSize: '17px', 
                        color: txn.type === 'income' ? 'var(--accent-success)' : 'var(--text-primary)' 
                      }}>
                        {txn.type === 'income' ? '+' : '-'}₹{displayShare.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                      {isSplit && (
                        <div style={{ 
                          fontSize: '10px', 
                          color: 'var(--text-secondary)', 
                          marginTop: '2px',
                          maxWidth: '140px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} title={`Total: ₹${txn.amount} split with ${txn.withWhom}`}>
                          {txn.includeMe === false ? 'Lent all' : 'Your share'} · Total ₹{txn.amount.toLocaleString()}
                        </div>
                      )}
                      {txn.withWhom && (
                        <div style={{ 
                          fontSize: '9px', 
                          color: 'var(--text-tertiary)', 
                          marginTop: '1px',
                          maxWidth: '140px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          with {txn.withWhom}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
