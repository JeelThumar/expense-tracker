import React, { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { Card, Button, ConfirmModal } from '../components/ui.jsx';
import { Trash2 } from 'lucide-react';
import { DateFilter } from '../components/DateFilter.jsx';

export const Transactions = () => {
  const { transactions, deleteTransaction } = useAppContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [withWhomFilter, setWithWhomFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ type: 'all' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Compute unique people and their aggregated spend
  const peopleStats = transactions.reduce((acc, txn) => {
    if (!txn.withWhom) return acc;
    // Split by comma and trim whitespace
    const names = txn.withWhom.split(',').map(n => n.trim()).filter(Boolean);
    if (names.length === 0) return acc;
    
    // Split the amount among the people (only for expenses for this specific logic, or all?)
    // User requested: "how many rupees spend with that person" -> Usually applies to expenses.
    // If it's an income, maybe it's positive? Let's just track absolute amount or only expenses.
    // Let's track expenses.
    const splitAmount = txn.type === 'expense' ? txn.amount / names.length : 0;
    
    names.forEach(name => {
      if (!acc[name]) acc[name] = 0;
      acc[name] += splitAmount;
    });
    return acc;
  }, {});

  const uniquePeople = Object.keys(peopleStats).sort();

  // 1. First, get transactions filtered ONLY by date
  const dateFilteredTransactions = transactions.filter(txn => {
    if (dateFilter && dateFilter.type !== 'all') {
      const txnDate = new Date(txn.date);
      if (dateFilter.type === 'month') {
        if (format(txnDate, 'yyyy-MM') !== dateFilter.value) return false;
      } else if (dateFilter.type === 'year') {
        if (format(txnDate, 'yyyy') !== dateFilter.value) return false;
      } else if (dateFilter.type === 'range') {
        const start = new Date(dateFilter.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateFilter.end);
        end.setHours(23, 59, 59, 999);
        if (txnDate < start || txnDate > end) return false;
      }
    }
    return true;
  });

  // 2. Then, filter further for the list view (Type & Person)
  const filteredTransactions = dateFilteredTransactions.filter(txn => {
    if (filter !== 'all' && txn.type !== filter) return false;
    
    if (withWhomFilter) {
      if (!txn.withWhom) return false;
      const names = txn.withWhom.split(',').map(n => n.trim());
      if (!names.includes(withWhomFilter)) return false;
    }
    return true;
  });

  // Calculate KPIs purely from dateFilteredTransactions so they don't change when clicking "Expenses" chip
  const totalIncome = dateFilteredTransactions.reduce((acc, curr) => 
    curr.type === 'income' ? acc + curr.amount : acc, 0
  );
  
  const totalExpense = dateFilteredTransactions.reduce((acc, curr) => 
    curr.type === 'expense' ? acc + curr.amount : acc, 0
  );

  const getFilterLabel = () => {
    if (!dateFilter || dateFilter.type === 'all') return 'All Time';
    if (dateFilter.type === 'month') {
      const [year, month] = dateFilter.value.split('-');
      return format(new Date(year, month - 1), 'MMM yyyy');
    }
    if (dateFilter.type === 'year') {
      return dateFilter.value;
    }
    if (dateFilter.type === 'range') {
      return `${format(new Date(dateFilter.start), 'MMM dd')} - ${format(new Date(dateFilter.end), 'MMM dd')}`;
    }
    return '';
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, background: 'var(--bg-card)', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
          <span className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Income</span>
          <span style={{ color: 'var(--accent-success)', fontSize: '16px', fontWeight: '600' }}>₹{totalIncome.toFixed(0)}</span>
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
            {getFilterLabel()}
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-card)', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
          <span className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Expense</span>
          <span style={{ color: 'var(--accent-danger)', fontSize: '16px', fontWeight: '600' }}>₹{totalExpense.toFixed(0)}</span>
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
            {getFilterLabel()}
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <Button 
          variant={filter === 'all' ? 'primary' : 'secondary'} 
          style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '20px', whiteSpace: 'nowrap', opacity: filter === 'all' ? 1 : 0.5, border: filter === 'all' ? '1px solid var(--text-primary)' : '1px solid transparent' }}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={filter === 'expense' ? 'primary' : 'secondary'} 
          style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '20px', whiteSpace: 'nowrap', opacity: filter === 'expense' ? 1 : 0.5, border: filter === 'expense' ? '1px solid var(--text-primary)' : '1px solid transparent' }}
          onClick={() => setFilter('expense')}
        >
          Expenses
        </Button>
        <Button 
          variant={filter === 'income' ? 'primary' : 'secondary'} 
          style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '20px', whiteSpace: 'nowrap', opacity: filter === 'income' ? 1 : 0.5, border: filter === 'income' ? '1px solid var(--text-primary)' : '1px solid transparent' }}
          onClick={() => setFilter('income')}
        >
          Income
        </Button>
        {/* Custom With Whom Chip Dropdown - Now integrated in the flex-wrap row */}
        {uniquePeople.length > 0 && (
          <div style={{ position: 'relative' }}>
            <Button 
              variant={withWhomFilter ? 'primary' : 'secondary'} 
              style={{ padding: '8px 16px', fontSize: '14px', borderRadius: '20px', whiteSpace: 'nowrap', opacity: withWhomFilter ? 1 : 0.5, border: withWhomFilter ? '1px solid var(--text-primary)' : '1px solid transparent', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {withWhomFilter ? `With: ${withWhomFilter}` : 'Everyone ▾'}
            </Button>
            
            {isDropdownOpen && (
              <div style={{ 
                position: 'absolute', top: '100%', left: 0, zIndex: 10,
                background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px',
                marginTop: '8px', minWidth: '200px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}>
                <div 
                  onClick={() => { setWithWhomFilter(''); setIsDropdownOpen(false); }}
                  style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: !withWhomFilter ? '600' : '400' }}
                >
                  Everyone
                </div>
                {uniquePeople.map(person => (
                  <div 
                    key={person} 
                    onClick={() => { setWithWhomFilter(person); setIsDropdownOpen(false); }}
                    style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', fontWeight: withWhomFilter === person ? '600' : '400', display: 'flex', justifyContent: 'space-between' }}
                  >
                    <span>{person}</span>
                    {peopleStats[person] > 0 && (
                      <span className="text-secondary" style={{ fontSize: '12px' }}>₹{peopleStats[person].toFixed(0)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div style={{ marginLeft: 'auto' }}>
          <DateFilter filter={dateFilter} setFilter={setDateFilter} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p className="text-secondary" style={{ fontSize: '16px' }}>No transactions found matching your filters.</p>
            <p className="text-tertiary" style={{ fontSize: '14px', marginTop: '8px' }}>Enjoy the quiet!</p>
          </div>
        ) : (
          filteredTransactions.map(txn => (
            <Card key={txn.id} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{txn.category}</div>
                <div className="text-secondary" style={{ fontSize: '12px' }}>{format(new Date(txn.date), 'MMM dd, yyyy • hh:mm a')}</div>
                {txn.withWhom && <div className="text-secondary" style={{ fontSize: '12px', marginTop: '2px', fontWeight: '500' }}>With: {txn.withWhom}</div>}
                {txn.note && <div className="text-tertiary" style={{ fontSize: '12px', marginTop: '4px' }}>{txn.note}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: '18px', 
                  color: txn.type === 'income' ? 'var(--accent-success)' : 'var(--text-primary)',
                  textAlign: 'right'
                }}>
                  {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                </div>
                <button 
                  onClick={() => setItemToDelete(txn)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Delete Transaction?"
        message={`Are you sure you want to delete this ${itemToDelete?.type === 'expense' ? 'expense' : 'income'} of ₹${itemToDelete?.amount}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (itemToDelete) deleteTransaction(itemToDelete.id);
          setItemToDelete(null);
        }}
        onCancel={() => setItemToDelete(null)}
      />

    </div>
  );
};
