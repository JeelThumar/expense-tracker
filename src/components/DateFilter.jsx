import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { BottomSheet, Button } from './ui.jsx';
import { format, parseISO, isValid } from 'date-fns';

export const DateFilter = ({ filter, setFilter, hideCustom = false, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('month'); // 'month', 'year', 'range'
  
  // Local state for the modal form
  const [localMonth, setLocalMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [localYear, setLocalYear] = useState(() => format(new Date(), 'yyyy'));
  const [localStart, setLocalStart] = useState('');
  const [localEnd, setLocalEnd] = useState('');

  const getDisplayText = () => {
    if (!filter || filter.type === 'all') return null;
    try {
      if (filter.type === 'month') {
        const date = parseISO(filter.value + '-01');
        return isValid(date) ? format(date, 'MMM yyyy') : null;
      }
      if (filter.type === 'year') return filter.value;
      if (filter.type === 'range') {
        const dStart = parseISO(filter.start);
        const dEnd = parseISO(filter.end);
        if (!isValid(dStart) || !isValid(dEnd)) return null;
        return `${format(dStart, 'dd/MM/yy')} - ${format(dEnd, 'dd/MM/yy')}`;
      }
    } catch (e) {
      return null;
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
      {children ? (
        <div onClick={() => setIsOpen(true)} style={{ cursor: 'pointer' }}>
          {children}
        </div>
      ) : (
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
            fontWeight: displayText ? '700' : '500',
            transition: 'all 0.2s ease',
            maxWidth: '160px', // Prevent button from growing too large
            flexShrink: 0
          }}
        >
          <Calendar size={16} strokeWidth={displayText ? 2.5 : 2} style={{ flexShrink: 0 }} />
          {displayText && (
            <span style={{ 
              fontSize: '13px', 
              whiteSpace: 'nowrap', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis' 
            }}>
              {displayText}
            </span>
          )}
          {!displayText && !hideCustom && <span style={{ fontSize: '13px' }}>All Time</span>}
          {!displayText && hideCustom && <span style={{ fontSize: '13px' }}>Select</span>}
        </button>
      )}

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Select Date Range">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--bg-main)', padding: '4px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('month')}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: activeTab === 'month' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'month' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'month' ? '700' : '400', cursor: 'pointer', fontSize: '13px' }}
          >
            Month
          </button>
          <button 
            onClick={() => setActiveTab('year')}
            style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: activeTab === 'year' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'year' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'year' ? '700' : '400', cursor: 'pointer', fontSize: '13px' }}
          >
            Year
          </button>
          {!hideCustom && (
            <button 
              onClick={() => setActiveTab('range')}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: activeTab === 'range' ? 'var(--bg-card)' : 'transparent', color: activeTab === 'range' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'range' ? '700' : '400', cursor: 'pointer', fontSize: '13px' }}
            >
              Custom
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div style={{ marginBottom: '32px', minHeight: '100px' }}>
          {activeTab === 'month' && (
            <div>
              <label className="text-secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block', fontWeight: '700' }}>Select Month</label>
                <input 
                  type="month" 
                  value={localMonth}
                  max={format(new Date(), 'yyyy-MM')}
                  onChange={e => setLocalMonth(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '16px' }}
                />
              </div>
            )}
  
            {activeTab === 'year' && (
              <div>
                <label className="text-secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block', fontWeight: '700' }}>Select Year</label>
                <input 
                  type="number" 
                  min="2000"
                  max={format(new Date(), 'yyyy')}
                  value={localYear}
                  onChange={e => setLocalYear(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '16px' }}
                />
              </div>
            )}
  
            {activeTab === 'range' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="text-secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block', fontWeight: '700' }}>Start Date</label>
                  <input 
                    type="date" 
                    value={localStart}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    onChange={e => setLocalStart(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '16px' }}
                  />
                </div>
                <div>
                  <label className="text-secondary" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'block', fontWeight: '700' }}>End Date</label>
                  <input 
                    type="date" 
                    value={localEnd}
                    min={localStart}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    onChange={e => setLocalEnd(e.target.value)}
                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                    style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '16px' }}
                  />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={handleClear} style={{ flex: 1, padding: '14px' }}>Clear</Button>
          <Button variant="primary" onClick={handleApply} style={{ flex: 2, padding: '14px' }}>Apply Filter</Button>
        </div>
      </BottomSheet>
    </>
  );
};
