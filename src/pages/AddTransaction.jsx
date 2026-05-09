import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline, IoChevronDown } from 'react-icons/io5';
import { useAppContext } from '../context/AppContext.jsx';

export const AddTransaction = () => {
  const navigate = useNavigate();
  const { transactions, addTransaction } = useAppContext();
  
  const [newTxn, setNewTxn] = useState({ 
    type: 'expense', 
    amount: '', 
    category: '', 
    note: '', 
    withWhom: '',
    date: format(new Date(), 'yyyy-MM-dd') // Default to today
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const uniquePeople = Array.from(new Set(
    transactions.reduce((acc, txn) => {
      if (txn.withWhom) {
        txn.withWhom.split(',').forEach(n => acc.push(n.trim()));
      }
      return acc;
    }, []).filter(Boolean)
  )).sort();

  // Simple math parser
  const parsedAmount = useMemo(() => {
    try {
      if (!newTxn.amount) return null;
      // Only allow numbers and basic operators to prevent eval issues
      const sanitized = newTxn.amount.replace(/[^0-9+\-*/.]/g, '');
      if (sanitized !== newTxn.amount) return null; // Invalid chars
      if (/[+\-*/]$/.test(sanitized)) return null; // Ends with operator
      
      const result = new Function('return ' + sanitized)();
      if (isNaN(result) || !isFinite(result)) return null;
      
      // Return if the calculated result is different from the raw string 
      if (sanitized !== result.toString()) {
        return { equation: sanitized, result };
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [newTxn.amount]);

  const handleAdd = () => {
    if (!newTxn.category) {
      alert('Please enter a Category.');
      return;
    }
    
    let finalAmount = parseFloat(newTxn.amount);
    if (parsedAmount) {
      finalAmount = parsedAmount.result;
    }

    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    addTransaction({
      type: newTxn.type,
      amount: finalAmount,
      category: newTxn.category,
      note: newTxn.note,
      withWhom: newTxn.withWhom,
      date: newTxn.date
    });
    
    navigate(-1);
  };

  const appendEquationToNote = () => {
    if (parsedAmount) {
      const addition = `(${parsedAmount.equation})`;
      setNewTxn(prev => ({
        ...prev,
        amount: parsedAmount.result.toString(),
        note: prev.note ? `${prev.note} ${addition}` : addition
      }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Header */}
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'var(--bg-card)', border: 'none', width: '40px', height: '40px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          <IoCloseOutline size={24} />
        </button>
      </div>

      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Toggle Type */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '20px', padding: '6px', marginBottom: '32px' }}>
          <button
            onClick={() => setNewTxn(prev => ({ ...prev, type: 'expense' }))}
            style={{ flex: 1, padding: '12px', borderRadius: '16px', border: 'none', background: newTxn.type === 'expense' ? 'var(--bg-main)' : 'transparent', color: newTxn.type === 'expense' ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: newTxn.type === 'expense' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}
          >
            Expense
          </button>
          <button
            onClick={() => setNewTxn(prev => ({ ...prev, type: 'income' }))}
            style={{ flex: 1, padding: '12px', borderRadius: '16px', border: 'none', background: newTxn.type === 'income' ? 'var(--bg-main)' : 'transparent', color: newTxn.type === 'income' ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: newTxn.type === 'income' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}
          >
            Income
          </button>
        </div>

        {/* Amount Input */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '8px', display: 'block' }}>
            Amount
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <span style={{ fontSize: '40px', fontWeight: '700', color: 'var(--text-primary)' }}>₹</span>
            <input
              type="text"
              inputMode="decimal"
              value={newTxn.amount}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9+\-*/. ]*$/.test(val)) {
                  setNewTxn(prev => ({ ...prev, amount: val }));
                }
              }}
              placeholder="0"
              style={{
                fontSize: '56px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                background: 'transparent',
                border: 'none',
                width: `${Math.max(1, newTxn.amount.length)}ch`,
                minWidth: '1ch',
                maxWidth: '100%',
                outline: 'none',
                textAlign: 'center',
                padding: 0
              }}
            />
          </div>
          {parsedAmount && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
              <span className="text-secondary" style={{ fontSize: '14px' }}>= <strong style={{ color: 'var(--text-primary)' }}>₹{parsedAmount.result}</strong></span>
              <button onClick={appendEquationToNote} style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', cursor: 'pointer' }}>
                Save math to note
              </button>
            </div>
          )}
        </div>

        {/* Other Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Category (e.g. Food, Rent)"
            value={newTxn.category}
            onChange={(e) => setNewTxn(prev => ({ ...prev, category: e.target.value }))}
            style={inputStyle}
          />

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="With Whom (Optional)"
              value={newTxn.withWhom}
              onChange={(e) => setNewTxn(prev => ({ ...prev, withWhom: e.target.value }))}
              onFocus={() => setIsDropdownOpen(true)}
              style={{ ...inputStyle, paddingRight: '40px' }}
            />
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
              <IoChevronDown size={20} />
            </div>
            
            {isDropdownOpen && uniquePeople.length > 0 && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  marginTop: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  zIndex: 10
                }}>
                {uniquePeople.filter(p => p.toLowerCase().includes(newTxn.withWhom.toLowerCase())).map(p => (
                  <div
                    key={p}
                    onClick={() => {
                      setNewTxn(prev => ({ ...prev, withWhom: p }));
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {p}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
          
          <input
            type="date"
            value={newTxn.date}
            onChange={(e) => setNewTxn(prev => ({ ...prev, date: e.target.value }))}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Add a note (optional)"
            value={newTxn.note}
            onChange={(e) => setNewTxn(prev => ({ ...prev, note: e.target.value }))}
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!newTxn.amount || !newTxn.category.trim()}
          style={{
            width: '100%', padding: '18px', borderRadius: '20px', border: 'none',
            background: (!newTxn.amount || !newTxn.category.trim()) ? 'var(--border-color)' : 'var(--text-primary)',
            color: (!newTxn.amount || !newTxn.category.trim()) ? 'var(--text-tertiary)' : 'var(--bg-main)',
            fontSize: '18px', fontWeight: '600', cursor: (!newTxn.amount || !newTxn.category.trim()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', marginTop: '20px'
          }}
        >
          Save Transaction
        </button>

      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '16px',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '16px',
  outline: 'none'
};
