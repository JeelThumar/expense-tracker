import React from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { FcGoogle } from 'react-icons/fc';

export const Login = () => {
  const { login } = useAppContext();

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

        <button 
          type="button"
          onClick={() => login()}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '18px',
            background: '#ffffff',
            color: '#000000',
            fontSize: '16px',
            fontWeight: '700',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 10px 20px rgba(255,255,255,0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(255,255,255,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(255,255,255,0.1)';
          }}
        >
          <FcGoogle size={24} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

