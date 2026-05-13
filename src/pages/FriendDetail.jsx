import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { Card, ConfirmModal } from '../components/ui.jsx';
import { IoChevronBack, IoTrashOutline } from 'react-icons/io5';
import { format } from 'date-fns';

export const FriendDetail = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const navigate = useNavigate();
  const { ledger, deleteLedgerTxn } = useAppContext();
  const [itemToDelete, setItemToDelete] = useState(null);

  const history = ledger.filter(t => t.person === decodedName);
  
  const netBalance = history.reduce((acc, txn) => {
    return txn.type === 'lent' ? acc + txn.amount : acc - txn.amount;
  }, 0);

  let statusText = "Settled up";
  let statusColor = "var(--text-tertiary)";
  
  if (netBalance > 0) {
    statusText = `Owes you ₹${netBalance.toFixed(2)}`;
    statusColor = "var(--accent-success)";
  } else if (netBalance < 0) {
    statusText = `You owe ₹${Math.abs(netBalance).toFixed(2)}`;
    statusColor = "var(--accent-danger)";
  }

  return (
    <div style={{ padding: '24px 20px', animation: 'fadeIn 0.6s ease' }}>
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
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>{decodedName}</h2>
          <div style={{ fontSize: '13px', color: statusColor, fontWeight: '700', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{statusText}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '100px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
            No history found.
          </div>
        ) : (
          history.slice().reverse().map((txn, index) => (
            <div 
              key={txn.id} 
              className="animate-slide-up"
              style={{ 
                animationDelay: `${index * 0.05}s`,
                background: 'var(--bg-card)', 
                padding: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderRadius: '18px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '2px' }}>
                  {txn.type === 'lent' ? 'You gave' : 'They gave'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {format(new Date(txn.date), 'MMM dd, yyyy')}
                </div>
                {txn.note && <div style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>"{txn.note}"</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  fontWeight: '800', 
                  fontSize: '18px', 
                  color: txn.type === 'lent' ? 'var(--accent-success)' : 'var(--accent-danger)',
                  textAlign: 'right'
                }}>
                  {txn.type === 'lent' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                </div>
                <button 
                  onClick={() => setItemToDelete(txn)}
                  style={{ background: 'rgba(255, 75, 75, 0.05)', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <IoTrashOutline size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Delete Transfer?"
        message={`Are you sure you want to delete this transfer of ₹${itemToDelete?.amount}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (itemToDelete) deleteLedgerTxn(itemToDelete.id);
          setItemToDelete(null);
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
