import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { BottomSheet, Button } from './ui.jsx';
import { format, parseISO } from 'date-fns';

export const DateFilter = ({ filter, setFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('month'); // 'month', 'year', 'range'
  
  // Local state for the modal form
  const [localMonth, setLocalMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [localYear, setLocalYear] = useState(() => format(new Date(), 'yyyy'));
  const [localStart, setLocalStart] = useState('');
  const [localEnd, setLocalEnd] = useState('');

  const getDisplayText = () => {
    if (!filter || filter.type === 'all') return null;
    if (filter.type === 'month') return format(parseISO(filter.value + '-01'), 'MMMM yyyy');
    if (filter.type === 'year') return filter.value;
    if (filter.type === 'range') {
      const start = format(parseISO(filter.start), 'MMM dd, yyyy');
      const end = format(parseISO(filter.end), 'MMM dd, yyyy');
      return `${start} - ${end}`;
    }
    return null;
  };

  const handleApply = () => {
    if (activeTab === 'month') {
      if (localMonth) setFilter({ type: 'month', value: localMonth });
    } else if (activeTab === 'year') {
      if (localYear) setFilter({ type: 'year', value: localYear });
    } else if (activeTab === 'range') {
      if (localStart && localEnd) setFilter({ type: 'range', start: localStart, end: localEnd });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilter({ type: 'all' });
    setIsOpen(false);
  };

  const displayText = getDisplayText();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          background: displayText ? 'var(--text-primary)' : 'var(--bg-card-elevated)',
          color: displayText ? 'var(--bg-main)' : 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          padding: '8px 12px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          outline: 'none',
          fontWeight: displayText ? '600' : '500',
          transition: 'all 0.2s ease'
        }}
      >
        <Calendar size={18} strokeWidth={displayText ? 2.5 : 2} />
        {displayText && <span>{displayText}</span>}
      </button>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Select Date Range">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'var(--bg-main)', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('month')}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: activeTab === 'month' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'month' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'month' ? '600' : '400', cursor: 'pointer' }}
          >
            Month
          </button>
          <button 
            onClick={() => setActiveTab('year')}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: activeTab === 'year' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'year' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'year' ? '600' : '400', cursor: 'pointer' }}
          >
            Year
          </button>
          <button 
            onClick={() => setActiveTab('range')}
            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: activeTab === 'range' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'range' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'range' ? '600' : '400', cursor: 'pointer' }}
          >
            Custom
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ marginBottom: '32px', minHeight: '100px' }}>
          {activeTab === 'month' && (
            <div>
              <label className="text-secondary" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Select Month</label>
              <input 
                type="month" 
                value={localMonth}
                onChange={e => setLocalMonth(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          )}

          {activeTab === 'year' && (
            <div>
              <label className="text-secondary" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Select Year</label>
              <input 
                type="number" 
                min="2000"
                max="2100"
                value={localYear}
                onChange={e => setLocalYear(e.target.value)}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          )}

          {activeTab === 'range' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="text-secondary" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>Start Date</label>
                <input 
                  type="date" 
                  value={localStart}
                  onChange={e => setLocalStart(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
              <div>
                <label className="text-secondary" style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>End Date</label>
                <input 
                  type="date" 
                  value={localEnd}
                  min={localStart} // Prevent selecting an end date before start date
                  onChange={e => setLocalEnd(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={handleClear} style={{ flex: 1 }}>Clear</Button>
          <Button variant="primary" onClick={handleApply} style={{ flex: 2 }}>Apply Filter</Button>
        </div>
      </BottomSheet>
    </>
  );
};
