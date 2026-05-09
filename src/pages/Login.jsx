import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

export const Login = () => {
  const { login } = useAppContext();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError('Please enter your first name.');
      return;
    }
    
    // Create a generic user object
    login({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-main)'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '32px 24px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Trecker.</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Let's personalize your experience</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              First Name
            </label>
            <input 
              type="text" 
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Jeel"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: error ? '1px solid #ff4b4b' : '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
            {error && <span style={{ color: '#ff4b4b', fontSize: '12px', marginTop: '6px', display: 'block' }}>{error}</span>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Last Name <span style={{ color: 'var(--text-tertiary)', fontWeight: '400', textTransform: 'none' }}>(Optional)</span>
            </label>
            <input 
              type="text" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Thumar"
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '16px',
              marginTop: '12px',
              borderRadius: '12px',
              background: 'var(--text-primary)',
              color: 'var(--bg-main)',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
            onMouseDown={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
};
