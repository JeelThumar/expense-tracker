import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { FcGoogle } from 'react-icons/fc';

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
      background: 'radial-gradient(circle at top right, #1a1a1a, #000000)',
      animation: 'fadeIn 0.8s ease'
    }}>
      <div 
        className="animate-slide-up"
        style={{
          background: 'rgba(28, 28, 30, 0.6)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          padding: '40px 32px',
          borderRadius: '32px',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '64px', height: '64px', background: '#fff', borderRadius: '18px', 
            margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 20px rgba(255,255,255,0.1)'
          }}>
            <span style={{ fontSize: '32px', fontWeight: '900', color: '#000' }}>T.</span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px', letterSpacing: '-1px' }}>Trecker.</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Smart expense tracking starts here</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              First Name
            </label>
            <input 
              type="text" 
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Jeel"
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '16px',
                border: error ? '2px solid #ff4b4b' : '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: '600',
                outline: 'none',
                transition: 'all 0.3s'
              }}
            />
            {error && <span style={{ color: '#ff4b4b', fontSize: '12px', marginTop: '8px', display: 'block', fontWeight: '600' }}>{error}</span>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Last Name <span style={{ opacity: 0.5, fontWeight: '400' }}> (Optional)</span>
            </label>
            <input 
              type="text" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Thumar"
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: '600',
                outline: 'none',
                transition: 'all 0.3s'
              }}
            />
          </div>

          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '18px',
              marginTop: '10px',
              borderRadius: '18px',
              background: '#ffffff',
              color: '#000000',
              fontSize: '17px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 10px 20px rgba(255,255,255,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Get Started
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '600' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <button 
            type="button"
            onClick={login}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '18px',
              background: 'rgba(255,255,255,0.05)',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '700',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <FcGoogle size={24} />
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
};
