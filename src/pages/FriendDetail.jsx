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
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px', marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <IoChevronBack size={24} />
        </button>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{decodedName}</h2>
          <div style={{ fontSize: '14px', color: statusColor, fontWeight: '500' }}>{statusText}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p className="text-secondary" style={{ fontSize: '14px' }}>No history found.</p>
          </div>
        ) : (
          history.map(txn => (
            <Card key={txn.id} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                  {txn.type === 'lent' ? 'You gave' : 'They gave'}
                </div>
                <div className="text-secondary" style={{ fontSize: '12px' }}>{format(new Date(txn.date), 'MMM dd, yyyy • hh:mm a')}</div>
                {txn.note && <div className="text-tertiary" style={{ fontSize: '12px', marginTop: '4px' }}>{txn.note}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: '18px', 
                  color: txn.type === 'lent' ? 'var(--accent-success)' : 'var(--accent-danger)',
                  textAlign: 'right'
                }}>
                  {txn.type === 'lent' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                </div>
                <button 
                  onClick={() => setItemToDelete(txn)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', padding: '4px' }}
                >
                  <IoTrashOutline size={20} />
                </button>
              </div>
            </Card>
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
