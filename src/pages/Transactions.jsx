import React, { useState, useMemo } from 'react';
import { format, isValid } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { IoChevronDown, IoCloudDownloadOutline } from 'react-icons/io5';
import { useAppContext } from '../context/AppContext.jsx';
import { Card } from '../components/ui.jsx';
import { DateFilter } from '../components/DateFilter.jsx';

export const Transactions = () => {
  const { transactions } = useAppContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, income, expense
  const [dateFilter, setDateFilter] = useState({ type: 'all' });
  const [selectedPerson, setSelectedPerson] = useState('Everyone');
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false);

  // Compute unique people
  const uniquePeople = useMemo(() => {
    return Array.from(new Set(
      transactions.reduce((acc, txn) => {
        if (txn.withWhom) {
          txn.withWhom.split(',').forEach(n => acc.push(n.trim()));
        }
        return acc;
      }, [])
    )).sort();
  }, [transactions]);

  // 1. Filter by Date and Person
  const dateAndPersonFiltered = useMemo(() => {
    return transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      if (!isValid(txnDate)) return false;

      // Date filter
      let dateMatch = true;
      if (dateFilter && dateFilter.type !== 'all') {
        if (dateFilter.type === 'month') {
          dateMatch = format(txnDate, 'yyyy-MM') === dateFilter.value;
        } else if (dateFilter.type === 'year') {
          dateMatch = format(txnDate, 'yyyy') === dateFilter.value;
        } else if (dateFilter.type === 'range') {
          const start = new Date(dateFilter.start); start.setHours(0,0,0,0);
          const end = new Date(dateFilter.end); end.setHours(23,59,59,999);
          dateMatch = txnDate >= start && txnDate <= end;
        }
      }

      if (!dateMatch) return false;

      // Person filter
      if (selectedPerson !== 'Everyone') {
        if (!txn.withWhom) return false;
        const names = txn.withWhom.split(',').map(n => n.trim());
        if (!names.includes(selectedPerson)) return false;
      }

      return true;
    });
  }, [transactions, dateFilter, selectedPerson]);

  // 2. Filter by Type (Income/Expense/All)
  const finalFilteredTransactions = useMemo(() => {
    if (filter === 'all') return dateAndPersonFiltered;
    return dateAndPersonFiltered.filter(txn => txn.type === filter);
  }, [dateAndPersonFiltered, filter]);

  // Aggregate totals for the dropdown
  const totalIncome = useMemo(() => dateAndPersonFiltered.reduce((acc, curr) => {
    if (curr.type !== 'income') return acc;
    if (selectedPerson !== 'Everyone') {
      if (curr.trackBalance === false) return acc; // Friend's share is 0
      const people = curr.withWhom?.split(',').map(n => n.trim()).filter(Boolean) || [];
      const numPeople = curr.numberOfPeople || (people.length + (curr.includeMe !== false ? 1 : 0)) || 1;
      return acc + (curr.amount / numPeople);
    } else {
      if (curr.withWhom) {
        const people = curr.withWhom.split(',').map(n => n.trim()).filter(Boolean);
        const numPeople = curr.numberOfPeople || (people.length + (curr.includeMe !== false ? 1 : 0)) || 1;
        return acc + (curr.trackBalance === false ? curr.amount : (curr.includeMe !== false ? curr.amount / numPeople : 0));
      }
      return acc + curr.amount;
    }
  }, 0), [dateAndPersonFiltered, selectedPerson]);
  
  const totalExpense = useMemo(() => dateAndPersonFiltered.reduce((acc, curr) => {
    if (curr.type !== 'expense') return acc;
    if (selectedPerson !== 'Everyone') {
      if (curr.trackBalance === false) return acc; // Friend's share is 0
      const people = curr.withWhom?.split(',').map(n => n.trim()).filter(Boolean) || [];
      const numPeople = curr.numberOfPeople || (people.length + (curr.includeMe !== false ? 1 : 0)) || 1;
      return acc + (curr.amount / numPeople);
    } else {
      if (curr.withWhom) {
        const people = curr.withWhom.split(',').map(n => n.trim()).filter(Boolean);
        const numPeople = curr.numberOfPeople || (people.length + (curr.includeMe !== false ? 1 : 0)) || 1;
        return acc + (curr.trackBalance === false ? curr.amount : (curr.includeMe !== false ? curr.amount / numPeople : 0));
      }
      return acc + curr.amount;
    }
  }, 0), [dateAndPersonFiltered, selectedPerson]);

  return (
    <div style={{ padding: '20px 20px 24px', animation: 'fadeIn 0.6s ease' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <Card style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Income</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-success)' }}>₹{totalIncome.toLocaleString()}</div>
        </Card>
        <Card style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Expense</div>
          <div style={{ fontSize: '22px', fontWeight: '800' }}>₹{totalExpense.toLocaleString()}</div>
        </Card>
      </div>

      {/* Filter Toolbar: Harden with flex-nowrap and overflow-hidden */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '8px', 
        marginBottom: '24px', 
        width: '100%',
        flexWrap: 'nowrap'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 1 }}>
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-card)', 
            padding: '4px', 
            borderRadius: '14px', 
            border: '1px solid var(--border-color)',
            flexShrink: 1,
            overflow: 'hidden'
          }}>
            {['all', 'exp', 'inc'].map((label, idx) => {
              const types = ['all', 'expense', 'income'];
              const type = types[idx];
              return (
                <button 
                  key={type}
                  onClick={() => setFilter(type)}
                  style={{ 
                    background: filter === type ? 'var(--text-primary)' : 'transparent',
                    color: filter === type ? 'var(--bg-main)' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button 
              onClick={() => setIsPersonDropdownOpen(!isPersonDropdownOpen)}
              style={{
                background: selectedPerson !== 'Everyone' ? 'var(--text-primary)' : 'var(--bg-card-elevated)',
                color: selectedPerson !== 'Everyone' ? 'var(--bg-main)' : 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '8px 10px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontWeight: '700',
                transition: 'all 0.2s ease',
                fontSize: '12px',
                maxWidth: '100px'
              }}
            >
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedPerson}</span>
              <IoChevronDown size={12} style={{ opacity: 0.7, flexShrink: 0 }} />
            </button>

            {isPersonDropdownOpen && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                  onClick={() => setIsPersonDropdownOpen(false)} 
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '8px',
                  minWidth: '200px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  zIndex: 999,
                  backdropFilter: 'blur(10px)',
                  animation: 'slideDown 0.2s ease',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  <div 
                    onClick={() => { setSelectedPerson('Everyone'); setIsPersonDropdownOpen(false); }}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      background: selectedPerson === 'Everyone' ? 'rgba(255,255,255,0.05)' : 'transparent',
                      color: selectedPerson === 'Everyone' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>Everyone</span>
                    <span style={{ fontSize: '11px', opacity: 0.7 }}>₹{(totalIncome - totalExpense).toLocaleString()}</span>
                  </div>
                  {uniquePeople.map(person => {
                    const personNet = transactions
                      .filter(t => {
                        let dateMatch = true;
                        if (dateFilter && dateFilter.type !== 'all') {
                          const txnDate = new Date(t.date);
                          if (!isValid(txnDate)) return false;
                          if (dateFilter.type === 'month') dateMatch = format(txnDate, 'yyyy-MM') === dateFilter.value;
                          else if (dateFilter.type === 'year') dateMatch = format(txnDate, 'yyyy') === dateFilter.value;
                          else if (dateFilter.type === 'range') {
                            const start = new Date(dateFilter.start); start.setHours(0,0,0,0);
                            const end = new Date(dateFilter.end); end.setHours(23,59,59,999);
                            dateMatch = txnDate >= start && txnDate <= end;
                          }
                        }
                        return dateMatch && (t.withWhom?.split(',') || []).map(n => n.trim()).includes(person);
                      })
                      .reduce((acc, curr) => {
                        const people = curr.withWhom?.split(',').map(n => n.trim()).filter(Boolean) || [];
                        const numPeople = curr.numberOfPeople || (people.length + (curr.includeMe !== false ? 1 : 0)) || 1;
                        const share = curr.amount / numPeople;
                        return curr.type === 'income' ? acc + share : acc - share;
                      }, 0);

                    return (
                      <div 
                        key={person}
                        onClick={() => { setSelectedPerson(person); setIsPersonDropdownOpen(false); }}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          background: selectedPerson === person ? 'rgba(255,255,255,0.05)' : 'transparent',
                          color: selectedPerson === person ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{person}</span>
                        <span style={{ fontSize: '11px', opacity: 0.7 }}>₹{personNet.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <DateFilter filter={dateFilter} setFilter={setDateFilter} />
      </div>

      {/* Transactions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '100px' }}>
        {finalFilteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
            No transactions found.
          </div>
        ) : (
          Object.entries(
            finalFilteredTransactions.reduce((groups, txn) => {
              const txnDate = new Date(txn.date);
              const date = format(txnDate, 'yyyy-MM-dd');
              if (!groups[date]) groups[date] = [];
              groups[date].push(txn);
              return groups;
            }, {})
          )
          .sort((a, b) => new Date(b[0]) - new Date(a[0]))
          .map(([date, txns]) => (
            <div key={date} className="animate-slide-up">
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', paddingLeft: '4px' }}>
                {format(new Date(date), 'EEEE, MMM dd')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {txns.map(txn => (
                  <div 
                    key={txn.id} 
                    onClick={() => navigate(`/transaction/${txn.id}`)}
                    style={{ 
                      background: 'var(--bg-card)', borderRadius: '18px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                        {txn.category?.toLowerCase().includes('fuel') ? '⛽' : txn.category?.toLowerCase().includes('food') ? '🍔' : '📄'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {txn.category}
                          {txn.isImported && (
                            <IoCloudDownloadOutline size={12} color="var(--text-tertiary)" title="Imported" />
                          )}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: 'var(--text-secondary)', 
                          marginTop: '2px',
                          maxWidth: '180px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {txn.note || (txn.type === 'income' ? 'Income' : 'Expense')}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {(() => {
                        const people = txn.withWhom ? txn.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
                        const numPeople = txn.numberOfPeople || (people.length + (txn.includeMe !== false ? 1 : 0)) || 1;
                        const isSplit = !!txn.withWhom;
                                  const displayShare = selectedPerson !== 'Everyone'
                          ? (txn.trackBalance === false ? 0 : txn.amount / numPeople)
                          : (txn.withWhom ? (txn.trackBalance === false ? txn.amount : (txn.includeMe !== false ? txn.amount / numPeople : 0)) : txn.amount);

                        return (
                          <>
                            <div style={{ fontWeight: '800', fontSize: '16px', color: txn.type === 'income' ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                              {txn.type === 'income' ? '+' : '-'}₹{displayShare.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                            {isSplit && (
                              <div style={{ 
                                fontSize: '10px', 
                                color: 'var(--text-secondary)', 
                                marginTop: '2px',
                                maxWidth: '160px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }} title={`Total: ₹${txn.amount} split with ${txn.withWhom}`}>
                                {selectedPerson !== 'Everyone' ? (
                                  txn.trackBalance === false ? 'No payback' : `${selectedPerson}'s share`
                                ) : (
                                  txn.trackBalance === false ? 'Personal (No payback)' : (txn.includeMe === false ? 'Lent all' : 'Your share')
                                )} · Total ₹{txn.amount.toLocaleString()}
                              </div>
                            )}
                            {txn.withWhom && selectedPerson === 'Everyone' && (
                              <div style={{ 
                                fontSize: '9px', 
                                color: 'var(--text-tertiary)', 
                                marginTop: '1px',
                                maxWidth: '160px',
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};
