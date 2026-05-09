import React, { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { Card, Button } from '../components/ui.jsx';
import { DateFilter } from '../components/DateFilter.jsx';

export const Home = () => {
  const { transactions } = useAppContext();
  const navigate = useNavigate();
  
  const [dateFilter, setDateFilter] = useState({ type: 'all' });

  // Filter transactions based on selected date
  const filteredTransactions = transactions.filter(txn => {
    if (!dateFilter || dateFilter.type === 'all') return true;
    
    // IMPORTANT: Parse txn.date (ISO string) instead of txn.id (timestamp string)
    const txnDate = new Date(txn.date);
    
    if (dateFilter.type === 'month') {
      return format(txnDate, 'yyyy-MM') === dateFilter.value;
    } else if (dateFilter.type === 'year') {
      return format(txnDate, 'yyyy') === dateFilter.value;
    } else if (dateFilter.type === 'range') {
      const start = new Date(dateFilter.start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateFilter.end);
      end.setHours(23, 59, 59, 999);
      return txnDate >= start && txnDate <= end;
    }
    
    return true;
  });

  const balance = filteredTransactions.reduce((acc, curr) => 
    curr.type === 'income' ? acc + curr.amount : acc - curr.amount, 0
  );
  
  const totalIncome = filteredTransactions.reduce((acc, curr) => 
    curr.type === 'income' ? acc + curr.amount : acc, 0
  );
  
  const totalExpense = filteredTransactions.reduce((acc, curr) => 
    curr.type === 'expense' ? acc + curr.amount : acc, 0
  );

  const recentTransactions = filteredTransactions.slice(0, 5);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Dashboard</h1>
        <DateFilter filter={dateFilter} setFilter={setDateFilter} />
      </div>

      <Card style={{ marginBottom: '32px' }}>
        <p className="text-secondary" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          {dateFilter.type !== 'all' ? 'Filtered Balance' : 'Total Balance'}
        </p>
        <h2 style={{ fontSize: '36px', fontWeight: '700', color: balance >= 0 ? 'var(--text-primary)' : 'var(--accent-danger)' }}>
          ₹{balance.toFixed(2)}
        </h2>
        
        {/* KPI Widgets */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <div style={{ flex: 1, background: 'var(--bg-main)', padding: '12px 16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Income</span>
            <span style={{ color: 'var(--accent-success)', fontSize: '16px', fontWeight: '600' }}>₹{totalIncome.toFixed(0)}</span>
          </div>
          <div style={{ flex: 1, background: 'var(--bg-main)', padding: '12px 16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expense</span>
            <span style={{ color: 'var(--accent-danger)', fontSize: '16px', fontWeight: '600' }}>₹{totalExpense.toFixed(0)}</span>
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px' }}>Recent Transactions</h3>
      </div>

      {recentTransactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p className="text-secondary" style={{ fontSize: '16px' }}>No transactions found for this period.</p>
          <p className="text-tertiary" style={{ fontSize: '14px', marginTop: '8px' }}>Enjoy the quiet!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          {recentTransactions.map(txn => (
            <Card key={txn.id} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{txn.category}</div>
                <div className="text-secondary" style={{ fontSize: '12px' }}>{format(new Date(txn.date), 'MMM dd, hh:mm a')}</div>
                {txn.withWhom && <div className="text-secondary" style={{ fontSize: '12px', marginTop: '2px', fontWeight: '500' }}>With: {txn.withWhom}</div>}
                {txn.note && <div className="text-tertiary" style={{ fontSize: '12px', marginTop: '2px' }}>{txn.note}</div>}
              </div>
              <div style={{ 
                fontWeight: '700', 
                fontSize: '18px', 
                color: txn.type === 'income' ? 'var(--accent-success)' : 'var(--text-primary)' 
              }}>
                {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};
