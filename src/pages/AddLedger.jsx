import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { IoCloseOutline, IoChevronDown } from 'react-icons/io5';

export const AddLedger = () => {
  const navigate = useNavigate();
  const { ledger, addLedgerTxn } = useAppContext();

  const [type, setType] = useState('lent'); // 'lent' or 'borrowed'
  const [amount, setAmount] = useState('');
  const [person, setPerson] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const uniquePeople = useMemo(() => {
    const people = new Set();
    ledger.forEach(txn => {
      if (txn.person) people.add(txn.person);
    });
    return Array.from(people).sort();
  }, [ledger]);

  const filteredPeople = uniquePeople.filter(p => 
    p.toLowerCase().includes(person.toLowerCase())
  );

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setAmount(val);
    }
  };

  const handlePersonChange = (e) => {
    const val = e.target.value;
    // Only allow alphabets and spaces
    if (/^[a-zA-Z\s]*$/.test(val)) {
      setPerson(val);
      setShowDropdown(true);
    }
  };

  const handleSelectPerson = (selectedPerson) => {
    setPerson(selectedPerson);
    setShowDropdown(false);
  };

  const handleSave = () => {
    if (!amount || isNaN(parseFloat(amount)) || !person.trim()) return;

    addLedgerTxn({
      type,
      amount: parseFloat(amount),
      person: person.trim(),
      date,
      note: note.trim()
    });

    navigate(-1);
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
            onClick={() => setType('lent')}
            style={{ flex: 1, padding: '12px', borderRadius: '16px', border: 'none', background: type === 'lent' ? 'var(--bg-main)' : 'transparent', color: type === 'lent' ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: type === 'lent' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}
          >
            I Gave
          </button>
          <button
            onClick={() => setType('borrowed')}
            style={{ flex: 1, padding: '12px', borderRadius: '16px', border: 'none', background: type === 'borrowed' ? 'var(--bg-main)' : 'transparent', color: type === 'borrowed' ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: '600', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: type === 'borrowed' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}
          >
            I Got
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
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              style={{
                fontSize: '56px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                background: 'transparent',
                border: 'none',
                width: `${Math.max(1, amount.length)}ch`,
                minWidth: '1ch',
                maxWidth: '100%',
                outline: 'none',
                textAlign: 'center',
                padding: 0
              }}
            />
          </div>
        </div>

        {/* Other Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Person Name (e.g. Virat)"
              value={person}
              onChange={handlePersonChange}
              onFocus={() => setShowDropdown(true)}
              style={{ ...inputStyle, paddingRight: '40px' }}
            />
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
              <IoChevronDown size={20} />
            </div>
            
            {showDropdown && filteredPeople.length > 0 && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }} 
                  onClick={() => setShowDropdown(false)} 
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
                {filteredPeople.map(p => (
                  <div
                    key={p}
                    onClick={() => handleSelectPerson(p)}
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={!amount || isNaN(parseFloat(amount)) || !person.trim()}
          style={{
            width: '100%', padding: '18px', borderRadius: '20px', border: 'none',
            background: (!amount || !person.trim()) ? 'var(--border-color)' : 'var(--text-primary)',
            color: (!amount || !person.trim()) ? 'var(--text-tertiary)' : 'var(--bg-main)',
            fontSize: '18px', fontWeight: '600', cursor: (!amount || !person.trim()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', marginTop: '20px'
          }}
        >
          Save Transfer
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
