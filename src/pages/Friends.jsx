import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { Card } from '../components/ui.jsx';
import { IoArrowForward, IoAdd } from 'react-icons/io5';

import { normalizeName } from '../utils/names';

export const Friends = () => {
  const { ledger, transactions } = useAppContext();
  const navigate = useNavigate();

  const balances = useMemo(() => {
    const acc = {};
    
    // Initialize all names from ledger and transactions to ensure they show up in friends list
    ledger.forEach(txn => {
      if (txn.person) {
        acc[normalizeName(txn.person)] = 0;
      }
    });
    transactions.forEach(txn => {
      if (txn.withWhom) {
        txn.withWhom.split(',').forEach(n => {
          const name = normalizeName(n);
          if (name) acc[name] = 0;
        });
      }
    });

    // Process manual ledger entries
    ledger.forEach(txn => {
      const name = txn.person ? normalizeName(txn.person) : '';
      if (!name) return;
      if (txn.type === 'lent') {
        acc[name] += txn.amount;
      } else {
        acc[name] -= txn.amount;
      }
    });

    // Process split transactions
    transactions.forEach(txn => {
      if (!txn.withWhom) return;
      if (txn.trackBalance === false) return; // Skip updating balances if balance tracking is disabled
      const people = txn.withWhom.split(',').map(n => normalizeName(n)).filter(Boolean);
      const numPeople = txn.numberOfPeople || (people.length + (txn.includeMe !== false ? 1 : 0)) || 1;
      const share = txn.amount / numPeople;
      
      people.forEach(name => {
        if (txn.type === 'expense') {
          acc[name] += share;
        } else if (txn.type === 'income') {
          acc[name] -= share;
        }
      });
    });

    return acc;
  }, [ledger, transactions]);

  const uniquePeople = Object.keys(balances).sort();

  const { totalGave, totalGot } = useMemo(() => {
    let gave = 0;
    let got = 0;

    // Process manual ledger entries
    ledger.forEach(txn => {
      if (txn.type === 'lent') {
        gave += txn.amount;
      } else {
        got += txn.amount;
      }
    });

    // Process split transactions
    transactions.forEach(txn => {
      if (!txn.withWhom) return;
      if (txn.trackBalance === false) return; // Skip if balance tracking is disabled
      const people = txn.withWhom.split(',').map(n => n.trim()).filter(Boolean);
      const numPeople = txn.numberOfPeople || (people.length + (txn.includeMe !== false ? 1 : 0)) || 1;
      const share = txn.amount / numPeople;
      
      people.forEach(() => {
        if (txn.type === 'expense') {
          gave += share;
        } else if (txn.type === 'income') {
          got += share;
        }
      });
    });

    return { totalGave: gave, totalGot: got };
  }, [ledger, transactions]);

  return (
    <div style={{ padding: '20px 20px 24px', animation: 'fadeIn 0.6s ease' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '16px', borderRadius: '18px', border: '1px solid var(--border-color)', position: 'relative' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>You Gave</span>
          <div style={{ color: 'var(--accent-success)', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>₹{totalGave.toLocaleString()}</div>
        </div>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)', padding: '16px', borderRadius: '18px', border: '1px solid var(--border-color)', position: 'relative' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>You Got</span>
          <div style={{ color: 'var(--accent-danger)', fontSize: '18px', fontWeight: '800', marginTop: '4px' }}>₹{totalGot.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '100px' }}>
        {uniquePeople.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
            No friends tracked yet.
          </div>
        ) : (
          uniquePeople.map((person, index) => {
            const net = balances[person];
            let statusText = "Settled up";
            let statusColor = "var(--text-tertiary)";
            
            if (net > 0) {
              statusText = `Owes you ₹${net.toLocaleString()}`;
              statusColor = "var(--accent-success)";
            } else if (net < 0) {
              statusText = `You owe ₹${Math.abs(net).toLocaleString()}`;
              statusColor = "var(--accent-danger)";
            }

            return (
              <div 
                key={person} 
                onClick={() => navigate(`/friends/${encodeURIComponent(person)}`)}
                className="animate-slide-up"
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  background: 'var(--bg-card)',
                  padding: '16px',
                  borderRadius: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'var(--text-primary)',
                    fontSize: '18px', border: '1px solid var(--border-color)'
                  }}>
                    {person.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px' }}>{person}</div>
                    <div style={{ fontSize: '12px', color: statusColor, fontWeight: '600', marginTop: '2px' }}>{statusText}</div>
                  </div>
                </div>
                <IoArrowForward size={18} color="var(--text-tertiary)" />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
