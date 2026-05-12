import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

export const Card = ({ children, className, ...props }) => (
  <div className={clsx("card", className)} {...props}>
    {children}
  </div>
);

export const Button = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyle = "btn";
  const variants = {
    primary: "bg-[#ffffff] text-[#000000]",
    secondary: "bg-transparent border border-[#ffffff33] text-[#ffffff] hover:bg-[#ffffff0d]",
    danger: "bg-[#ff4b4b] text-[#ffffff]",
    ghost: "bg-transparent text-[var(--text-secondary)]",
  };
  
  return (
    <button 
      {...props}
      className={clsx(baseStyle, variants[variant], className)}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, className, ...props }) => (
  <div className={clsx("flex flex-col mb-4", className)} style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
    {label && <label className="text-secondary" style={{ fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</label>}
    <input 
      style={{
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid var(--border-color)',
        color: 'var(--text-primary)',
        fontSize: '18px',
        padding: '8px 0',
        outline: 'none',
        fontFamily: 'var(--font-primary)',
        transition: 'border-color 0.2s ease'
      }}
      onFocus={(e) => e.target.style.borderBottomColor = 'var(--text-primary)'}
      onBlur={(e) => e.target.style.borderBottomColor = 'var(--border-color)'}
      {...props} 
    />
  </div>
);

export const BottomSheet = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}
      onClick={onClose}
    >
      <div 
        className="bottom-sheet"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-card)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '24px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
          borderTop: '1px solid var(--border-color)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '24px',
        width: '100%',
        maxWidth: '340px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>{title}</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>{message}</p>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: '#ff4b4b',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(255, 75, 75, 0.2)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};
