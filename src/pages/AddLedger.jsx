import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { IoCloseOutline, IoChevronDown } from 'react-icons/io5';

export const AddLedger = () => {
  const navigate = useNavigate();
  const { ledger, addLedgerTxn } = useAppContext();

  const queryParams = new URLSearchParams(window.location.search);
  const friendParam = queryParams.get('friend');
  const defaultFriend = friendParam ? decodeURIComponent(friendParam) : '';

  const [type, setType] = useState('lent'); // 'lent' or 'borrowed'
  const [amount, setAmount] = useState('');
  const [person, setPerson] = useState(defaultFriend);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)', animation: 'fadeIn 0.6s ease' }}>
      {/* Header */}
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
            width: '44px', height: '44px', borderRadius: '14px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: 'var(--text-primary)', cursor: 'pointer' 
          }}
        >
          <IoCloseOutline size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>Add Transfer</h2>
        <div style={{ width: '44px' }} />
      </div>

      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Toggle Type */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '6px', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setType('lent')}
            style={{ 
              flex: 1, padding: '14px', borderRadius: '16px', border: 'none', 
              background: type === 'lent' ? '#ffffff' : 'transparent', 
              color: type === 'lent' ? '#000000' : 'var(--text-tertiary)', 
              fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s',
              textTransform: 'uppercase', letterSpacing: '1px'
            }}
          >
            I Gave
          </button>
          <button
            onClick={() => setType('borrowed')}
            style={{ 
              flex: 1, padding: '14px', borderRadius: '16px', border: 'none', 
              background: type === 'borrowed' ? '#ffffff' : 'transparent', 
              color: type === 'borrowed' ? '#000000' : 'var(--text-tertiary)', 
              fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s',
              textTransform: 'uppercase', letterSpacing: '1px'
            }}
          >
            I Got
          </button>
        </div>

        {/* Amount Input */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '800', marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Amount
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '40px', fontWeight: '900', color: type === 'lent' ? 'var(--accent-success)' : 'var(--accent-danger)', opacity: 0.8 }}>₹</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              style={{
                fontSize: '64px',
                fontWeight: '900',
                color: 'var(--text-primary)',
                background: 'transparent',
                border: 'none',
                width: `${Math.max(1, amount.length)}ch`,
                minWidth: '1ch',
                maxWidth: '100%',
                outline: 'none',
                textAlign: 'center',
                padding: 0,
                letterSpacing: '-2px'
              }}
            />
          </div>
        </div>

        {/* Other Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recipient</label>
            <input
              type="text"
              placeholder="Who are you dealing with?"
              value={person}
              onChange={handlePersonChange}
              onFocus={() => setShowDropdown(true)}
              style={{ ...inputStyle, paddingRight: '44px' }}
            />
            <div style={{ position: 'absolute', right: '16px', top: '42px', pointerEvents: 'none', color: 'var(--text-tertiary)' }}>
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
                  borderRadius: '18px',
                  marginTop: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  zIndex: 10,
                  animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                {filteredPeople.map(p => (
                  <div
                    key={p}
                    onClick={() => handleSelectPerson(p)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      fontSize: '15px',
                      fontWeight: '600',
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
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Note</label>
            <textarea
              placeholder="What's this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              style={{ 
                ...inputStyle, 
                height: 'auto', 
                minHeight: '100px', 
                resize: 'none', 
                paddingTop: '16px',
                lineHeight: '1.5'
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!amount || isNaN(parseFloat(amount)) || !person.trim()}
          style={{
            width: '100%', padding: '20px', borderRadius: '20px', border: 'none',
            background: (!amount || !person.trim()) ? 'rgba(255,255,255,0.05)' : '#ffffff',
            color: (!amount || !person.trim()) ? 'var(--text-tertiary)' : '#000000',
            fontSize: '17px', fontWeight: '800', cursor: (!amount || !person.trim()) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s', marginTop: '20px', marginBottom: '20px',
            boxShadow: (!amount || !person.trim()) ? 'none' : '0 10px 20px rgba(255,255,255,0.05)'
          }}
        >
          Confirm Transfer
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
