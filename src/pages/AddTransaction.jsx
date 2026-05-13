import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline, IoChevronDown } from 'react-icons/io5';
import { X } from 'lucide-react';
import { useAppContext } from '../context/AppContext.jsx';

export const AddTransaction = () => {
  const navigate = useNavigate();
  const { transactions, addTransaction, settings } = useAppContext();
  
  const [newTxn, setNewTxn] = useState({ 
    type: 'expense', 
    amount: '', 
    category: '', 
    note: '', 
    withWhom: '',
    includeMe: true,
    date: format(new Date(), 'yyyy-MM-dd'), // Default to today
    isVehicle: false,
    odometer: '',
    litres: '',
    pricePerLitre: ''
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [withWhomInput, setWithWhomInput] = useState('');

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
  }, [transactions, newTxn.type]);
  
  const isVehicleCategory = (cat) => {
    if (!cat) return false;
    const c = cat.toLowerCase();
    return c.includes('fuel') || c.includes('service') || c.includes('bike') || c.includes('vehicle') || c.includes('petrol') || c.includes('diesel');
  };

  const showVehicleFields = newTxn.type === 'expense' && isVehicleCategory(newTxn.category);

  // Simple math parser
  const parsedAmount = useMemo(() => {
    try {
      if (!newTxn.amount) return null;
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
      includeMe: newTxn.includeMe,
      date: newTxn.date,
      isVehicle: newTxn.isVehicle,
      odometer: newTxn.odometer ? parseFloat(newTxn.odometer) : null,
      litres: newTxn.litres ? parseFloat(newTxn.litres) : null,
      pricePerLitre: newTxn.pricePerLitre ? parseFloat(newTxn.pricePerLitre) : settings.defaultFuelPrice
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

  // With Whom chip management
  const selectedPeople = newTxn.withWhom.split(',').map(n => n.trim()).filter(Boolean);

  const addPerson = (name) => {
    if (!name.trim()) return;
    const newPeople = [...selectedPeople, name.trim()];
    setNewTxn(prev => ({ ...prev, withWhom: newPeople.join(', ') }));
    setWithWhomInput('');
    setIsDropdownOpen(false);
  };

  const removePerson = (name) => {
    const newPeople = selectedPeople.filter(p => p !== name);
    setNewTxn(prev => ({ ...prev, withWhom: newPeople.join(', ') }));
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
          
          <div>
            <input
              type="text"
              placeholder="Category (e.g. Food, Rent)"
              value={newTxn.category}
              onChange={(e) => setNewTxn(prev => ({ ...prev, category: e.target.value }))}
              style={{ ...inputStyle, marginBottom: '8px' }}
            />
            {topCategories.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '0 4px' }}>
                {topCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNewTxn(prev => ({ ...prev, category: cat }))}
                    style={{
                      background: 'var(--bg-card-elevated)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                ...inputStyle,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                padding: selectedPeople.length > 0 ? '12px 40px 12px 12px' : '16px 40px 16px 16px',
                alignItems: 'center',
                minHeight: '54px'
              }}
              onClick={() => setIsDropdownOpen(true)}
            >
              {selectedPeople.map(person => (
                <div 
                  key={person}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--bg-card-elevated)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {person}
                  <button 
                    onClick={(e) => { e.stopPropagation(); removePerson(person); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder={selectedPeople.length === 0 ? "With Whom (Optional)" : ""}
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
                  fontSize: '16px', outline: 'none', flex: 1, minWidth: '100px'
                }}
              />
            </div>
            
            <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
              <IoChevronDown size={20} />
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
                  borderRadius: '16px',
                  marginTop: '8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  zIndex: 10
                }}>
                {withWhomInput.trim() && !uniquePeople.includes(withWhomInput.trim()) && (
                  <div
                    onClick={() => addPerson(withWhomInput.trim())}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: 'var(--accent-success)',
                      fontWeight: '500'
                    }}
                  >
                    Add "{withWhomInput.trim()}"
                  </div>
                )}
                {uniquePeople
                  .filter(p => !selectedPeople.includes(p)) // Exclude already selected
                  .filter(p => p.toLowerCase().includes(withWhomInput.toLowerCase()))
                  .map(p => (
                  <div
                    key={p}
                    onClick={() => addPerson(p)}
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

        {newTxn.withWhom && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>Include me in the split</span>
            <button 
              onClick={() => setNewTxn(prev => ({ ...prev, includeMe: !prev.includeMe }))}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                background: newTxn.includeMe ? 'var(--accent-success)' : 'var(--bg-card-elevated)',
                position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: '20px', height: '20px', borderRadius: '10px', background: '#fff',
                position: 'absolute', top: '2px', left: newTxn.includeMe ? '22px' : '2px',
                transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        )}
          
          <input
            type="date"
            value={newTxn.date}
            max={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => setNewTxn(prev => ({ ...prev, date: e.target.value }))}
            onClick={(e) => e.target.showPicker && e.target.showPicker()}
            style={inputStyle}
          />

          <textarea
            placeholder="Add a note (optional)"
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

          {/* Vehicle Specific Fields */}
          {showVehicleFields && (
            <div style={{ 
              marginTop: '8px', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', 
              border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '15px', fontWeight: '600' }}>For my Bike (Mileage Tracking)</span>
                <button 
                  onClick={() => setNewTxn(prev => ({ ...prev, isVehicle: !prev.isVehicle }))}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                    background: newTxn.isVehicle ? 'var(--accent-success)' : 'var(--bg-card-elevated)',
                    position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '10px', background: '#fff',
                    position: 'absolute', top: '2px', left: newTxn.isVehicle ? '22px' : '2px',
                    transition: 'all 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>

              {newTxn.isVehicle && newTxn.category.toLowerCase().includes('fuel') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Odometer ({settings.distanceUnit})</label>
                      <input
                        type="number"
                        placeholder={`e.g. 12400`}
                        value={newTxn.odometer}
                        onChange={(e) => setNewTxn(prev => ({ ...prev, odometer: e.target.value }))}
                        style={{ ...inputStyle, padding: '12px' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>{settings.fuelUnit}s</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 5.5"
                        value={newTxn.litres}
                        onChange={(e) => {
                          const l = e.target.value;
                          setNewTxn(prev => {
                            const newState = { ...prev, litres: l };
                            // If price is empty, suggest using default price for amount
                            if (!prev.amount && l && !prev.pricePerLitre) {
                              // We don't auto-set amount to avoid confusion, but we could
                            }
                            return newState;
                          });
                        }}
                        style={{ ...inputStyle, padding: '12px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Price per {settings.fuelUnit}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={`Default: ₹${settings.defaultFuelPrice}`}
                        value={newTxn.pricePerLitre}
                        onChange={(e) => setNewTxn(prev => ({ ...prev, pricePerLitre: e.target.value }))}
                        style={{ ...inputStyle, padding: '12px' }}
                      />
                      {!newTxn.pricePerLitre && (
                        <div style={{ fontSize: '10px', color: 'var(--accent-success)', marginTop: '4px', fontWeight: '600' }}>
                          Using default: ₹{settings.defaultFuelPrice}
                        </div>
                      )}
                    </div>
                    {newTxn.litres && !newTxn.amount && (
                      <button 
                        onClick={() => {
                          const price = newTxn.pricePerLitre ? parseFloat(newTxn.pricePerLitre) : settings.defaultFuelPrice;
                          const total = (parseFloat(newTxn.litres) * price).toFixed(2);
                          setNewTxn(prev => ({ ...prev, amount: total }));
                        }}
                        style={{ marginTop: '12px', background: 'rgba(52, 199, 89, 0.1)', color: 'var(--accent-success)', border: 'none', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', width: '100%' }}
                      >
                        Calculate Total: ₹{(parseFloat(newTxn.litres) * (newTxn.pricePerLitre ? parseFloat(newTxn.pricePerLitre) : settings.defaultFuelPrice)).toFixed(2)}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
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
