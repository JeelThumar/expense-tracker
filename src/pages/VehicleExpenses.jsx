import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { IoChevronBack } from 'react-icons/io5';
import { format } from 'date-fns';

export const VehicleExpenses = () => {
  const { transactions, settings } = useAppContext();
  const navigate = useNavigate();

  const vehicleTxns = useMemo(() => {
    return transactions
      .filter(t => t.isVehicle && (t.category?.toLowerCase().includes('fuel') || t.litres > 0))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.6s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
            color: 'var(--text-primary)', cursor: 'pointer', width: '44px', height: '44px', 
            borderRadius: '14px', marginRight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}
        >
          <IoChevronBack size={20} />
        </button>
        <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>Vehicle Spends History</h2>
      </div>

      {/* Spends List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
        {vehicleTxns.map((txn, index) => {
          const people = txn.withWhom ? txn.withWhom.split(',').map(n => n.trim()).filter(Boolean) : [];
          const numPeople = txn.numberOfPeople || (people.length + (txn.includeMe !== false ? 1 : 0)) || 1;
          const displayShare = txn.withWhom ? (txn.includeMe !== false ? txn.amount / numPeople : 0) : txn.amount;

          return (
            <div 
              key={txn.id} 
              onClick={() => navigate(`/transaction/${txn.id}`)}
              className="animate-slide-up"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                background: 'var(--bg-card)',
                borderRadius: '20px',
                padding: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                transition: 'transform 0.2s ease, background 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ 
                  width: '44px', height: '44px', borderRadius: '14px', 
                  background: 'rgba(255,255,255,0.03)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px' 
                }}>
                  ⛽
                </div>
                <div>
                  <div style={{ 
                    fontWeight: '700', 
                    fontSize: '15px', 
                    marginBottom: '2px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px'
                  }}>
                    {txn.category}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {format(new Date(txn.date), 'MMM dd, yyyy')}
                    {txn.litres && ` · ${txn.litres} ${settings.fuelUnit}s`}
                    {txn.odometer && ` · Odo: ${txn.odometer} ${settings.distanceUnit}`}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ 
                  fontWeight: '800', 
                  fontSize: '17px', 
                  color: 'var(--text-primary)' 
                }}>
                  -₹{displayShare.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
                {txn.withWhom && (
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Split with {txn.withWhom}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
