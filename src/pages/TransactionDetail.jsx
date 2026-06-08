import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { IoCloseOutline, IoChevronDown } from 'react-icons/io5';
import { X, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext.jsx';
import { ConfirmModal } from '../components/ui.jsx';

export const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, updateTransaction, deleteTransaction, settings } = useAppContext();
  
  const [newTxn, setNewTxn] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [withWhomInput, setWithWhomInput] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    const existingTxn = transactions.find(t => t.id === id);
    if (existingTxn) {
      setNewTxn({
        ...existingTxn,
        amount: existingTxn.amount.toString(),
        date: format(new Date(existingTxn.date), 'yyyy-MM-dd'),
        includeMe: existingTxn.includeMe !== false,
        withWhom: existingTxn.withWhom || '',
        numberOfPeople: existingTxn.numberOfPeople || (existingTxn.withWhom ? existingTxn.withWhom.split(',').filter(Boolean).length + (existingTxn.includeMe !== false ? 1 : 0) : 1),
        trackBalance: existingTxn.trackBalance !== false,
        isVehicle: !!existingTxn.isVehicle,
        odometer: existingTxn.odometer?.toString() || '',
        litres: existingTxn.litres?.toString() || '',
        pricePerLitre: existingTxn.pricePerLitre?.toString() || ''
      });
    }
  }, [id, transactions]);

  // Get unique people
  const uniquePeople = Array.from(new Set(
    transactions.reduce((acc, txn) => {
      if (txn.withWhom) {
        txn.withWhom.split(',').forEach(n => acc.push(n.trim()));
      }
      return acc;
    }, []).filter(Boolean)
  )).sort();

  // Get top 5 categories based on frequency
  const topCategories = useMemo(() => {
    if (!newTxn) return [];
    const counts = {};
    transactions.forEach(t => {
      if (t.type === newTxn.type && t.category) {
        counts[t.category] = (counts[t.category] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
  }, [transactions, newTxn?.type]);

  const isVehicleCategory = (cat) => {
    if (!cat) return false;
    const c = cat.toLowerCase();
    return c.includes('fuel') || c.includes('service') || c.includes('bike') || c.includes('vehicle') || c.includes('petrol') || c.includes('diesel');
  };

  const showVehicleFields = newTxn?.type === 'expense' && isVehicleCategory(newTxn?.category);

  // Simple math parser
  const parsedAmount = useMemo(() => {
    try {
      if (!newTxn || !newTxn.amount) return null;
      const sanitized = newTxn.amount.replace(/[^0-9+\-*/.]/g, '');
      if (sanitized !== newTxn.amount) return null; 
      if (/[+\-*/]$/.test(sanitized)) return null; 
      
      const result = new Function('return ' + sanitized)();
      if (isNaN(result) || !isFinite(result)) return null;
      
      if (sanitized !== result.toString()) {
        return { equation: sanitized, result };
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [newTxn?.amount]);

  const handleSave = () => {
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

    updateTransaction(id, {
      type: newTxn.type,
      amount: finalAmount,
      category: newTxn.category,
      note: newTxn.note,
      withWhom: newTxn.withWhom,
      includeMe: newTxn.includeMe,
      numberOfPeople: newTxn.numberOfPeople,
      trackBalance: newTxn.trackBalance !== false,
      date: newTxn.date,
      isVehicle: newTxn.isVehicle,
      odometer: newTxn.odometer ? parseFloat(newTxn.odometer) : null,
      litres: newTxn.litres ? parseFloat(newTxn.litres) : null,
      pricePerLitre: newTxn.pricePerLitre ? parseFloat(newTxn.pricePerLitre) : settings.defaultFuelPrice
    });
    
    setIsEditing(false); // Switch back to view mode
  };

  const handleDelete = () => {
    deleteTransaction(id);
    setIsDeleteModalOpen(false);
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

  // With Whom chip management
  const selectedPeople = newTxn ? newTxn.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];

  const addPerson = (name) => {
    if (!name.trim()) return;
    const newPeople = [...selectedPeople, name.trim()];
    setNewTxn(prev => {
      const includeMe = prev.includeMe !== false;
      return {
        ...prev,
        withWhom: newPeople.join(', '),
        numberOfPeople: newPeople.length + (includeMe ? 1 : 0)
      };
    });
    setWithWhomInput('');
    setIsDropdownOpen(false);
  };

  const removePerson = (name) => {
    const newPeople = selectedPeople.filter(p => p !== name);
    setNewTxn(prev => {
      const includeMe = prev.includeMe !== false;
      return {
        ...prev,
        withWhom: newPeople.join(', '),
        numberOfPeople: newPeople.length + (includeMe ? 1 : 0)
      };
    });
  };

  if (!newTxn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
        Transaction not found.
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
          <IoCloseOutline size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
          {isEditing ? 'Edit Transaction' : 'Transaction Detail'}
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
                background: newTxn.type === 'expense' ? 'rgba(255,255,255,0.03)' : 'rgba(76, 175, 80, 0.1)', 
                color: newTxn.type === 'expense' ? 'var(--text-tertiary)' : 'var(--accent-success)', 
                fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', 
                letterSpacing: '1px', border: '1px solid var(--border-color)' 
              }}>
                {newTxn.type}
              </div>
              {newTxn.isImported && (
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-tertiary)', opacity: 0.6 }} title="Imported from Application" />
              )}
            </div>

            <div style={{ 
              fontSize: '64px', fontWeight: '900', letterSpacing: '-3px',
              color: newTxn.type === 'expense' ? 'var(--text-primary)' : 'var(--accent-success)', 
              marginBottom: '48px', textShadow: '0 10px 20px rgba(0,0,0,0.2)'
            }}>
              ₹{parseFloat(newTxn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>

            <div className="animate-slide-up" style={{ width: '100%', background: 'var(--bg-card)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Category</span>
                <span style={{ fontSize: '20px', fontWeight: '700' }}>{newTxn.category}</span>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Date</span>
                <span style={{ fontSize: '20px', fontWeight: '700' }}>{format(new Date(newTxn.date), 'MMMM dd, yyyy')}</span>
              </div>

              {selectedPeople.length > 0 && (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>Spent With</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                    {selectedPeople.map(p => (
                      <span key={p} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '14px', fontSize: '15px', fontWeight: '600', border: '1px solid rgba(255,255,255,0.05)' }}>{p}</span>
                    ))}
                  </div>
                  {newTxn.type === 'expense' && (() => {
                    const amountVal = parseFloat(newTxn.amount) || 0;
                    const numPeople = newTxn.numberOfPeople || (selectedPeople.length + (newTxn.includeMe ? 1 : 0)) || 1;
                    const share = amountVal / numPeople;
                    const userShare = newTxn.includeMe ? share : 0;
                    const friendsCount = selectedPeople.length;
                    
                    return (
                      <div style={{
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Split Mode</span>
                          <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                            {newTxn.trackBalance === false ? 'Personal Expense / No Payback' : (newTxn.includeMe ? `Split equally among ${numPeople} people` : `Paid full for ${numPeople} friend(s)`)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Share per person</span>
                          <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{share.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        {newTxn.includeMe && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Your share</span>
                            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{(newTxn.trackBalance === false ? amountVal : userShare).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                            {friendsCount === 1 ? `${selectedPeople[0]} owes you` : 'Friends owe you (total)'}
                          </span>
                          <span style={{ fontWeight: '700', color: newTxn.trackBalance !== false ? 'var(--accent-success)' : 'var(--text-secondary)' }}>
                            ₹{newTxn.trackBalance !== false ? (share * friendsCount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {newTxn.note && (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>Note</span>
                  <span style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: '1.5', fontWeight: '500' }}>{newTxn.note}</span>
                </div>
              )}

              {newTxn.isVehicle && (
                <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-color)' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', marginBottom: '20px' }}>Vehicle Insights</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {newTxn.odometer && (
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', marginBottom: '4px' }}>Odometer ({settings.distanceUnit})</div>
                        <div style={{ fontSize: '20px', fontWeight: '800' }}>{newTxn.odometer}</div>
                      </div>
                    )}
                    {newTxn.litres && (
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '700', marginBottom: '4px' }}>{settings.fuelUnit}s</div>
                        <div style={{ fontSize: '20px', fontWeight: '800' }}>{newTxn.litres}</div>
                      </div>
                    )}
                  </div>
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
                Delete Record
              </button>
            </div>
          </div>
        ) : (
          /* ================= EDIT MODE ================= */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '6px', marginBottom: '40px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setNewTxn(prev => ({ ...prev, type: 'expense' }))}
                style={{ 
                  flex: 1, padding: '14px', borderRadius: '16px', border: 'none', 
                  background: newTxn.type === 'expense' ? '#ffffff' : 'transparent', 
                  color: newTxn.type === 'expense' ? '#000000' : 'var(--text-tertiary)', 
                  fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s',
                  textTransform: 'uppercase', letterSpacing: '1px'
                }}
              >
                Expense
              </button>
              <button
                onClick={() => setNewTxn(prev => ({
                  ...prev,
                  type: 'income',
                  withWhom: '',
                  numberOfPeople: 1,
                  includeMe: true
                }))}
                style={{ 
                  flex: 1, padding: '14px', borderRadius: '16px', border: 'none', 
                  background: newTxn.type === 'income' ? '#ffffff' : 'transparent', 
                  color: newTxn.type === 'income' ? '#000000' : 'var(--text-tertiary)', 
                  fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s',
                  textTransform: 'uppercase', letterSpacing: '1px'
                }}
              >
                Income
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '800', marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Amount
              </span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '40px', fontWeight: '900', color: 'var(--text-primary)', opacity: 0.8 }}>₹</span>
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
              {parsedAmount && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700' }}>= ₹{parsedAmount.result}</span>
                  <button onClick={appendEquationToNote} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase' }}>
                    Save math
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, position: 'relative' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</label>
                <input
                  type="text"
                  placeholder="Category (e.g. Food, Rent)"
                  value={newTxn.category}
                  onChange={(e) => setNewTxn(prev => ({ ...prev, category: e.target.value }))}
                  style={{ ...inputStyle, marginBottom: '12px' }}
                />
                {topCategories.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {topCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setNewTxn(prev => ({ ...prev, category: cat }))}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          padding: '8px 14px',
                          borderRadius: '14px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {newTxn.type === 'expense' && (
                <>
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Split With</label>
                    <div
                      style={{
                        ...inputStyle,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px',
                        padding: '12px 16px',
                        alignItems: 'center',
                        minHeight: '56px'
                      }}
                      onClick={() => setIsDropdownOpen(true)}
                    >
                      {selectedPeople.map(person => (
                        <div 
                          key={person}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#ffffff',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '800',
                            color: '#000000'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {person}
                          <button 
                            onClick={(e) => { e.stopPropagation(); removePerson(person); }}
                            style={{ background: 'transparent', border: 'none', color: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        placeholder={selectedPeople.length === 0 ? "Who's involved?" : ""}
                        value={withWhomInput}
                        onChange={(e) => {
                          setWithWhomInput(e.target.value);
                          setIsDropdownOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            addPerson(withWhomInput);
                          } else if (e.key === 'Backspace' && withWhomInput === '' && selectedPeople.length > 0) {
                            removePerson(selectedPeople[selectedPeople.length - 1]);
                          }
                        }}
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--text-primary)', 
                          fontSize: '16px', fontWeight: '600', outline: 'none', flex: 1, minWidth: '100px'
                        }}
                      />
                    </div>
                    
                    {isDropdownOpen && (uniquePeople.length > 0 || withWhomInput.trim().length > 0) && (
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
                          borderRadius: '18px',
                          marginTop: '8px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                          zIndex: 10,
                          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}>
                        {withWhomInput.trim() && !uniquePeople.includes(withWhomInput.trim()) && (
                          <div
                            onClick={() => addPerson(withWhomInput.trim())}
                            style={{
                              padding: '16px 20px',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              cursor: 'pointer',
                              fontSize: '15px',
                              color: 'var(--accent-success)',
                              fontWeight: '800'
                            }}
                          >
                            Add "{withWhomInput.trim()}"
                          </div>
                        )}
                        {uniquePeople
                          .filter(p => !selectedPeople.includes(p)) 
                          .filter(p => p.toLowerCase().includes(withWhomInput.toLowerCase()))
                          .map(p => (
                          <div
                            key={p}
                            onClick={() => addPerson(p)}
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

                {selectedPeople.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>Include me in split</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setNewTxn(prev => {
                            const newIncludeMe = !prev.includeMe;
                            const defaultNum = selectedPeople.length + (newIncludeMe ? 1 : 0);
                            return {
                              ...prev,
                              includeMe: newIncludeMe,
                              numberOfPeople: defaultNum
                            };
                          });
                        }}
                        style={{
                          width: '48px', height: '26px', borderRadius: '13px', border: 'none',
                          background: newTxn.includeMe ? 'var(--accent-success)' : 'rgba(255,255,255,0.1)',
                          position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                        }}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '10px', background: '#fff',
                          position: 'absolute', top: '3px', left: newTxn.includeMe ? '25px' : '3px',
                          transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>Track split balance</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setNewTxn(prev => ({
                            ...prev,
                            trackBalance: prev.trackBalance !== false ? false : true
                          }));
                        }}
                        style={{
                          width: '48px', height: '26px', borderRadius: '13px', border: 'none',
                          background: newTxn.trackBalance !== false ? 'var(--accent-success)' : 'rgba(255,255,255,0.1)',
                          position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                        }}
                      >
                        <div style={{
                          width: '20px', height: '20px', borderRadius: '10px', background: '#fff',
                          position: 'absolute', top: '3px', left: newTxn.trackBalance !== false ? '25px' : '3px',
                          transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>Split between</span>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {newTxn.numberOfPeople || 1} {newTxn.numberOfPeople === 1 ? 'person' : 'people'}
                      </span>
                    </div>

                    {(() => {
                      const amountVal = parsedAmount ? parsedAmount.result : (parseFloat(newTxn.amount) || 0);
                      if (amountVal > 0) {
                        const numPeople = newTxn.numberOfPeople || 1;
                        const share = amountVal / numPeople;
                        const userShare = newTxn.includeMe ? share : 0;
                        const friendsCount = selectedPeople.length;
                        
                        return (
                          <div style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderRadius: '16px',
                            padding: '12px 16px',
                            marginTop: '8px',
                            border: '1px solid rgba(255,255,255,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>Share per person</span>
                              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{share.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                            {newTxn.includeMe && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Your share</span>
                                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>₹{userShare.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                              </div>
                            )}
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                  {friendsCount === 1 ? `${selectedPeople[0]} owes you` : 'Friends owe you (total)'}
                                </span>
                                <span style={{ fontWeight: '700', color: newTxn.trackBalance !== false ? 'var(--accent-success)' : 'var(--text-secondary)' }}>
                                  ₹{newTxn.trackBalance !== false ? (share * friendsCount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}
                                </span>
                              </div>
                            </div>
                          );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </>
            )}
              
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
                  value={newTxn.note || ''}
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

              {/* Vehicle Fields (Edit Mode) */}
              {showVehicleFields && (
                <div style={{ 
                  marginTop: '12px', padding: '24px', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', 
                  border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '20px' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '-0.2px' }}>Track Vehicle Efficiency</span>
                    <button 
                      onClick={() => setNewTxn(prev => ({ ...prev, isVehicle: !prev.isVehicle }))}
                      style={{
                        width: '48px', height: '26px', borderRadius: '13px', border: 'none',
                        background: newTxn.isVehicle ? 'var(--accent-success)' : 'rgba(255,255,255,0.1)',
                        position: 'relative', cursor: 'pointer', transition: 'all 0.3s'
                      }}
                    >
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '10px', background: '#fff',
                        position: 'absolute', top: '3px', left: newTxn.isVehicle ? '25px' : '3px',
                        transition: 'all 0.3s'
                      }} />
                    </button>
                  </div>

                  {newTxn.isVehicle && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Odometer ({settings.distanceUnit})</label>
                          <input
                            type="number"
                            value={newTxn.odometer}
                            onChange={(e) => setNewTxn(prev => ({ ...prev, odometer: e.target.value }))}
                            style={inputStyle}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>{settings.fuelUnit}s</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newTxn.litres}
                            onChange={(e) => setNewTxn(prev => ({ ...prev, litres: e.target.value }))}
                            style={inputStyle}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Price per {settings.fuelUnit}</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder={`Default: ${settings.defaultFuelPrice}`}
                          value={newTxn.pricePerLitre}
                          onChange={(e) => setNewTxn(prev => ({ ...prev, pricePerLitre: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                disabled={!newTxn.amount || !newTxn.category.trim()}
                style={{
                  flex: 2, padding: '20px', borderRadius: '20px', border: 'none',
                  background: (!newTxn.amount || !newTxn.category.trim()) ? 'rgba(255,255,255,0.05)' : '#ffffff',
                  color: (!newTxn.amount || !newTxn.category.trim()) ? 'var(--text-tertiary)' : '#000000',
                  fontSize: '16px', fontWeight: '800', cursor: (!newTxn.amount || !newTxn.category.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s', boxShadow: (!newTxn.amount || !newTxn.category.trim()) ? 'none' : '0 10px 20px rgba(255,255,255,0.05)'
                }}
              >
                Save
              </button>
            </div>
            
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              style={{
                width: '100%', padding: '20px', borderRadius: '20px', border: 'none',
                background: 'rgba(239, 68, 68, 0.05)', color: 'var(--accent-danger)',
                fontSize: '16px', fontWeight: '800', cursor: 'pointer',
                transition: 'all 0.3s', textTransform: 'uppercase', letterSpacing: '1px',
                marginTop: '12px', marginBottom: '24px'
              }}
            >
              Delete Record
            </button>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        title="Delete Record?"
        message={`This will permanently remove the ₹${newTxn.amount} ${newTxn.type}. This action cannot be reversed.`}
        confirmText="Delete"
        cancelText="Keep"
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
