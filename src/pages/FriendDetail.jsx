import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { Card, ConfirmModal, BottomSheet, Input, Button } from '../components/ui.jsx';
import { IoChevronBack, IoTrashOutline } from 'react-icons/io5';
import { Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { normalizeName } from '../utils/names.js';

export const FriendDetail = () => {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name);
  const navigate = useNavigate();
  const { ledger, deleteLedgerTxn, deleteTransaction, transactions, addLedgerTxn, renameFriend, deleteFriend } = useAppContext();
  const [itemToDelete, setItemToDelete] = useState(null);

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [isDeleteFriendOpen, setIsDeleteFriendOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('Settle Up');

  useEffect(() => {
    if (isSettleUpOpen) {
      setSettleAmount(Math.abs(netBalance).toFixed(2));
    }
  }, [isSettleUpOpen]);

  const history = useMemo(() => {
    // 1. Get ledger entries
    const ledgerEntries = ledger
      .filter(t => t.person && normalizeName(t.person) === normalizeName(decodedName))
      .map(t => ({
        ...t,
        isSplit: false,
        displayAmount: t.amount,
        displayType: t.type
      }));

    // 2. Get transaction splits
    const transactionSplits = transactions
      .filter(t => {
        if (!t.withWhom) return false;
        const people = t.withWhom.split(',').map(n => normalizeName(n)).filter(Boolean);
        return people.includes(normalizeName(decodedName));
      })
      .map(t => {
        const people = t.withWhom.split(',').map(n => normalizeName(n)).filter(Boolean);
        const numPeople = t.numberOfPeople || (people.length + (t.includeMe !== false ? 1 : 0)) || 1;
        const share = t.trackBalance !== false ? (t.amount / numPeople) : 0;
        return {
          ...t,
          isSplit: true,
          displayAmount: share,
          displayType: t.type === 'expense' ? 'lent' : 'borrowed',
          totalAmount: t.amount,
          numberOfPeople: numPeople,
          trackBalance: t.trackBalance !== false
        };
      });

    return [...ledgerEntries, ...transactionSplits].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [ledger, transactions, decodedName]);
  
  const netBalance = history.reduce((acc, txn) => {
    return txn.displayType === 'lent' ? acc + txn.displayAmount : acc - txn.displayAmount;
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
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
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setNewFriendName(decodedName);
              setIsRenameOpen(true);
            }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Rename Friend"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => setIsDeleteFriendOpen(true)}
            style={{ background: 'rgba(255, 75, 75, 0.05)', border: '1px solid rgba(255, 75, 75, 0.1)', color: 'var(--accent-danger)', cursor: 'pointer', width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Delete Friend"
          >
            <IoTrashOutline size={18} />
          </button>
        </div>
      </div>

      {netBalance !== 0 && (
        <Card style={{
          background: 'linear-gradient(135deg, #1e1e1e 0%, #111 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Balance Status</div>
            <div style={{ fontSize: '18px', fontWeight: '800', marginTop: '4px', color: statusColor }}>{statusText}</div>
          </div>
          <button
            onClick={() => setIsSettleUpOpen(true)}
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg-main)',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(255,255,255,0.05)'
            }}
          >
            Settle Up
          </button>
        </Card>
      )}

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
              onClick={() => {
                if (txn.isSplit) {
                  navigate(`/transaction/${txn.id}`);
                } else {
                  navigate(`/ledger/${txn.id}`);
                }
              }}
              style={{ 
                animationDelay: `${index * 0.05}s`,
                background: 'var(--bg-card)', 
                padding: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderRadius: '18px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {txn.isSplit ? (
                    <>
                      <span>{txn.category || 'Expense'} Split</span>
                      <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '6px', color: 'var(--text-secondary)' }}>Split</span>
                      {txn.trackBalance === false && (
                        <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 6px', borderRadius: '6px', color: 'var(--accent-danger)' }}>No Payback</span>
                      )}
                    </>
                  ) : (
                    txn.displayType === 'lent' ? 'You gave' : 'They gave'
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {format(new Date(txn.date), 'MMM dd, yyyy')}
                </div>
                {txn.note && <div style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>"{txn.note}"</div>}
                {txn.isSplit && (
                  <div style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                    Total: ₹{txn.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})} divided by {txn.numberOfPeople}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  fontWeight: '800', 
                  fontSize: '18px', 
                  color: txn.trackBalance === false ? 'var(--text-tertiary)' : (txn.displayType === 'lent' ? 'var(--accent-success)' : 'var(--accent-danger)'),
                  textAlign: 'right'
                }}>
                  {txn.trackBalance === false ? '₹0.00' : `${txn.displayType === 'lent' ? '+' : '-'}₹${txn.displayAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToDelete(txn);
                  }}
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
        title={itemToDelete?.isSplit ? "Delete Transaction?" : "Delete Transfer?"}
        message={itemToDelete?.isSplit ? `Are you sure you want to delete this split transaction of ₹${itemToDelete?.amount}?` : `Are you sure you want to delete this transfer of ₹${itemToDelete?.amount}?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (itemToDelete) {
            if (itemToDelete.isSplit) {
              deleteTransaction(itemToDelete.id);
            } else {
              deleteLedgerTxn(itemToDelete.id);
            }
          }
          setItemToDelete(null);
        }}
        onCancel={() => setItemToDelete(null)}
      />

      <BottomSheet isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} title="Rename Friend">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="New Name"
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            placeholder="Enter name"
          />
          <Button
            onClick={async () => {
              if (newFriendName.trim() && newFriendName.trim() !== decodedName) {
                await renameFriend(decodedName, newFriendName.trim());
                navigate(`/friends/${encodeURIComponent(normalizeName(newFriendName.trim()))}`, { replace: true });
              }
              setIsRenameOpen(false);
            }}
            disabled={!newFriendName.trim() || newFriendName.trim() === decodedName}
          >
            Rename
          </Button>
        </div>
      </BottomSheet>

      <ConfirmModal
        isOpen={isDeleteFriendOpen}
        title="Delete Friend?"
        message={`Are you sure you want to delete ${decodedName} and all associated ledger history? Split transactions will be updated.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={async () => {
          await deleteFriend(decodedName);
          setIsDeleteFriendOpen(false);
          navigate('/friends');
        }}
        onCancel={() => setIsDeleteFriendOpen(false)}
      />

      <BottomSheet isOpen={isSettleUpOpen} onClose={() => setIsSettleUpOpen(false)} title="Settle Up">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {netBalance > 0 ? `Record a payment received from ${decodedName}.` : `Record a payment made to ${decodedName}.`}
          </div>
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            value={settleAmount}
            onChange={(e) => setSettleAmount(e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Note"
            value={settleNote}
            onChange={(e) => setSettleNote(e.target.value)}
            placeholder="e.g. Settle Up"
          />
          <Button
            onClick={() => {
              const amt = parseFloat(settleAmount);
              if (isNaN(amt) || amt <= 0) {
                alert('Please enter a valid amount.');
                return;
              }
              const type = netBalance > 0 ? 'borrowed' : 'lent';
              addLedgerTxn({
                type,
                amount: amt,
                person: decodedName,
                date: new Date().toISOString().split('T')[0],
                note: settleNote.trim() || 'Settle Up'
              });
              setIsSettleUpOpen(false);
              setSettleAmount('');
              setSettleNote('Settle Up');
            }}
            disabled={!settleAmount || parseFloat(settleAmount) <= 0}
          >
            Record Settlement
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
};
