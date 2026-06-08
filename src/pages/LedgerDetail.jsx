import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { IoCloseOutline, IoChevronDown, IoChevronBack } from 'react-icons/io5';
import { X, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext.jsx';
import { ConfirmModal } from '../components/ui.jsx';

export const LedgerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ledger, updateLedgerTxn, deleteLedgerTxn } = useAppContext();
  
  const [newTxn, setNewTxn] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const existingTxn = ledger.find(t => t.id === id);
    if (existingTxn) {
      setNewTxn({
        ...existingTxn,
        amount: existingTxn.amount.toString(),
        date: format(new Date(existingTxn.date), 'yyyy-MM-dd'),
        person: existingTxn.person || '',
        note: existingTxn.note || ''
      });
    }
  }, [id, ledger]);

  // Get unique people from the entire ledger
  const uniquePeople = useMemo(() => {
    const people = new Set();
    ledger.forEach(txn => {
      if (txn.person) people.add(txn.person);
    });
    return Array.from(people).sort();
  }, [ledger]);

  const filteredPeople = useMemo(() => {
    if (!newTxn || !newTxn.person) return uniquePeople;
    return uniquePeople.filter(p => 
      p.toLowerCase().includes(newTxn.person.toLowerCase())
    );
  }, [newTxn?.person, uniquePeople]);

  const handleSave = () => {
    if (!newTxn.person.trim()) {
      alert('Please enter a recipient name.');
      return;
    }
    
    const finalAmount = parseFloat(newTxn.amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    updateLedgerTxn(id, {
      type: newTxn.type,
      amount: finalAmount,
      person: newTxn.person.trim(),
      note: newTxn.note.trim(),
      date: newTxn.date
    });
    
    setIsEditing(false); // Switch back to view mode
  };

  const handleDelete = () => {
    deleteLedgerTxn(id);
    setIsDeleteModalOpen(false);
    navigate(-1);
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setNewTxn(prev => ({ ...prev, amount: val }));
    }
  };

  const handlePersonChange = (e) => {
    const val = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(val)) {
      setNewTxn(prev => ({ ...prev, person: val }));
      setShowDropdown(true);
    }
  };

  if (!newTxn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
        Transfer not found.
      </div>
    );
  }

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
          <IoChevronBack size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          {isEditing ? 'Edit Transfer' : 'Transfer Detail'}
        </h2>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)} 
            style={{ 
              background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
              width: '44px', height: '44px', borderRadius: '14px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'var(--text-primary)', cursor: 'pointer' 
            }}
          >
            <Edit2 size={18} />
          </button>
        ) : (
          <div style={{ width: '44px' }} />
        )}
      </div>

      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
        
        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ 
                padding: '8px 16px', borderRadius: '14px', 
                background: newTxn.type === 'lent' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', 
                color: newTxn.type === 'lent' ? 'var(--accent-success)' : 'var(--accent-danger)', 
                fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', 
                letterSpacing: '1px', border: '1px solid var(--border-color)' 
              }}>
                {newTxn.type === 'lent' ? 'You Gave' : 'You Got'}
              </div>
            </div>

            <div style={{ 
              fontSize: '64px', fontWeight: '900', letterSpacing: '-3px',
              color: newTxn.type === 'lent' ? 'var(--accent-success)' : 'var(--accent-danger)', 
              marginBottom: '48px', textShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}>
              ₹{parseFloat(newTxn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>

            <div className="animate-slide-up" style={{ width: '100%', background: 'var(--bg-card)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Friend</span>
                <span style={{ fontSize: '20px', fontWeight: '700' }}>{newTxn.person}</span>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Date</span>
                <span style={{ fontSize: '20px', fontWeight: '700' }}>{format(new Date(newTxn.date), 'MMMM dd, yyyy')}</span>
              </div>

              {newTxn.note && (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Note</span>
                  <span style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: '1.5', fontWeight: '500' }}>{newTxn.note}</span>
                </div>
              )}
            </div>

            <div style={{ height: '40px' }} />

            <div className="animate-slide-up" style={{ marginTop: 'auto', width: '100%', paddingBottom: '20px', animationDelay: '0.2s' }}>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                style={{
                  width: '100%', padding: '20px', borderRadius: '20px', border: 'none',
                  background: 'rgba(239, 68, 68, 0.05)', color: 'var(--accent-danger)',
                  fontSize: '16px', fontWeight: '800', cursor: 'pointer',
                  transition: 'all 0.3s', textTransform: 'uppercase', letterSpacing: '1px'
                }}
              >
                Delete Transfer
              </button>
            </div>
          </div>
        ) : (
          /* ================= EDIT MODE ================= */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Toggle Type */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '6px', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setNewTxn(prev => ({ ...prev, type: 'lent' }))}
                style={{ 
                  flex: 1, padding: '14px', borderRadius: '16px', border: 'none', 
                  background: newTxn.type === 'lent' ? '#ffffff' : 'transparent', 
                  color: newTxn.type === 'lent' ? '#000000' : 'var(--text-tertiary)', 
                  fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s',
                  textTransform: 'uppercase', letterSpacing: '1px'
                }}
              >
                I Gave
              </button>
              <button
                onClick={() => setNewTxn(prev => ({ ...prev, type: 'borrowed' }))}
                style={{ 
                  flex: 1, padding: '14px', borderRadius: '16px', border: 'none', 
                  background: newTxn.type === 'borrowed' ? '#ffffff' : 'transparent', 
                  color: newTxn.type === 'borrowed' ? '#000000' : 'var(--text-tertiary)', 
                  fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s',
                  textTransform: 'uppercase', letterSpacing: '1px'
                }}
              >
                I Got
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '800', marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Amount
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '40px', fontWeight: '900', color: newTxn.type === 'lent' ? 'var(--accent-success)' : 'var(--accent-danger)', opacity: 0.8 }}>₹</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newTxn.amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  style={{
                    fontSize: '64px',
                    fontWeight: '900',
                    color: 'var(--text-primary)',
                    background: 'transparent',
                    border: 'none',
                    width: `${Math.max(1, newTxn.amount.length)}ch`,
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, position: 'relative' }}>
              
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recipient</label>
                <input
                  type="text"
                  placeholder="Who are you dealing with?"
                  value={newTxn.person}
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
                        onClick={() => {
                          setNewTxn(prev => ({ ...prev, person: p }));
                          setShowDropdown(false);
                        }}
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
                value={newTxn.date}
                max={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setNewTxn(prev => ({ ...prev, date: e.target.value }))}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Note</label>
              <textarea
                placeholder="What was this for?"
                value={newTxn.note}
                onChange={(e) => setNewTxn(prev => ({ ...prev, note: e.target.value }))}
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '40px', paddingBottom: '24px' }}>
            <button
              onClick={() => setIsEditing(false)}
              style={{
                flex: 1, padding: '20px', borderRadius: '20px', border: '1px solid var(--border-color)',
                background: 'transparent', color: 'var(--text-primary)',
                fontSize: '16px', fontWeight: '800', cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!newTxn.amount || !newTxn.person.trim()}
              style={{
                flex: 2, padding: '20px', borderRadius: '20px', border: 'none',
                background: (!newTxn.amount || !newTxn.person.trim()) ? 'rgba(255,255,255,0.05)' : '#ffffff',
                color: (!newTxn.amount || !newTxn.person.trim()) ? 'var(--text-tertiary)' : '#000000',
                fontSize: '16px', fontWeight: '800', cursor: (!newTxn.amount || !newTxn.person.trim()) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s', boxShadow: (!newTxn.amount || !newTxn.person.trim()) ? 'none' : '0 10px 20px rgba(255,255,255,0.05)'
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>

    <ConfirmModal 
      isOpen={isDeleteModalOpen}
      title="Delete Transfer?"
      message={`Are you sure you want to delete this transfer of ₹${parseFloat(newTxn.amount).toFixed(2)}?`}
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={handleDelete}
      onCancel={() => setIsDeleteModalOpen(false)}
    />
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
