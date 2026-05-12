import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';
import { IoChevronBack, IoCameraOutline } from 'react-icons/io5';

export const ProfileInfo = () => {
  const { user, updateUser } = useAppContext();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [photo, setPhoto] = useState(user?.photo || null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!firstName.trim()) return;
    updateUser({ firstName, lastName, photo });
    navigate(-1);
  };

  return (
    <div style={{ padding: '24px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.6s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
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
        <h2 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>Profile Info</h2>
      </div>

      {/* Photo Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '48px' }}>
        <div 
          onClick={() => fileInputRef.current.click()}
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '30px',
            background: photo ? `url(${photo}) center/cover` : 'var(--bg-card)',
            border: photo ? '2px solid var(--accent-success)' : '2px dashed var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
            transform: 'rotate(-2deg)'
          }}
        >
          {!photo && <IoCameraOutline size={32} color="var(--text-secondary)" />}
          
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: photo ? 0 : 0.5, transition: 'opacity 0.2s'
          }}>
            <IoCameraOutline size={32} color="#ffffff" />
          </div>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>Change Avatar</span>
        
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          style={{ display: 'none' }} 
        />

        {photo && (
          <button
            onClick={() => setPhoto(null)}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              cursor: 'pointer'
            }}
          >
            Remove Photo
          </button>
        )}
      </div>

      {/* Form Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            style={inputFieldStyle}
          />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            style={inputFieldStyle}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!firstName.trim()}
        className="animate-slide-up"
        style={{
          width: '100%',
          padding: '20px',
          borderRadius: '20px',
          border: 'none',
          background: firstName.trim() ? '#ffffff' : 'rgba(255,255,255,0.05)',
          color: firstName.trim() ? '#000000' : 'var(--text-tertiary)',
          fontSize: '17px',
          fontWeight: '800',
          marginTop: 'auto',
          marginBottom: '20px',
          cursor: firstName.trim() ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s',
          boxShadow: firstName.trim() ? '0 10px 20px rgba(255,255,255,0.05)' : 'none',
          animationDelay: '0.3s'
        }}
      >
        Update Profile
      </button>

    </div>
  );
};

const inputFieldStyle = {
  width: '100%',
  padding: '18px',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '16px',
  fontWeight: '600',
  outline: 'none',
  transition: 'all 0.3s'
};
