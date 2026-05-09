import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { Card } from '../components/ui.jsx';
import { IoArrowForward, IoAdd } from 'react-icons/io5';

export const Friends = () => {
  const { ledger } = useAppContext();
  const navigate = useNavigate();

  const balances = useMemo(() => {
    const acc = {};
    ledger.forEach(txn => {
      const name = txn.person;
      if (!name) return;
      if (!acc[name]) acc[name] = 0;
      // 'lent' means they owe you (+), 'borrowed' means you owe them (-)
      if (txn.type === 'lent') {
        acc[name] += txn.amount;
      } else {
        acc[name] -= txn.amount;
      }
    });
    return acc;
  }, [ledger]);

  const uniquePeople = Object.keys(balances).sort();

  const totalGave = ledger.reduce((acc, curr) => curr.type === 'lent' ? acc + curr.amount : acc, 0);
  const totalGot = ledger.reduce((acc, curr) => curr.type === 'borrowed' ? acc + curr.amount : acc, 0);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ flex: 1, background: 'var(--bg-card)', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total You Gave</span>
          <span style={{ color: 'var(--accent-success)', fontSize: '16px', fontWeight: '600' }}>₹{totalGave.toFixed(0)}</span>
        </div>
        <div style={{ flex: 1, background: 'var(--bg-card)', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span className="text-secondary" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total You Got</span>
          <span style={{ color: 'var(--accent-danger)', fontSize: '16px', fontWeight: '600' }}>₹{totalGot.toFixed(0)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {uniquePeople.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p className="text-secondary" style={{ fontSize: '16px' }}>No friends tracked yet.</p>
            <p className="text-tertiary" style={{ fontSize: '14px', marginTop: '8px' }}>Add a transfer to get started.</p>
          </div>
        ) : (
          uniquePeople.map(person => {
            const net = balances[person];
            let statusText = "Settled up";
            let statusColor = "var(--text-tertiary)";
            
            if (net > 0) {
              statusText = `Owes you ₹${net.toFixed(2)}`;
              statusColor = "var(--accent-success)";
            } else if (net < 0) {
              statusText = `You owe ₹${Math.abs(net).toFixed(2)}`;
              statusColor = "var(--accent-danger)";
            }

            return (
              <Card 
                key={person} 
                style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => navigate(`/friends/${encodeURIComponent(person)}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: 'var(--text-primary)'
                  }}>
                    {person.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{person}</div>
                    <div style={{ fontSize: '14px', color: statusColor, fontWeight: '500' }}>{statusText}</div>
                  </div>
                </div>
                <IoArrowForward size={20} color="var(--text-tertiary)" />
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
