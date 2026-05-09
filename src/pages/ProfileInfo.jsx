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
    <div style={{ padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px', marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <IoChevronBack size={24} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>Profile Info</h2>
      </div>

      {/* Photo Section */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px' }}>
        <div 
          onClick={() => fileInputRef.current.click()}
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: photo ? `url(${photo}) center/cover` : 'var(--bg-card)',
            border: '2px dashed var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {!photo && <IoCameraOutline size={32} color="var(--text-secondary)" />}
          
          {/* Overlay on hover */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: photo ? 0 : 1, transition: 'opacity 0.2s', ':hover': { opacity: 1 }
          }}>
            {photo && <IoCameraOutline size={32} color="#ffffff" />}
          </div>
        </div>
        <span style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '12px' }}>Tap to change photo</span>
        
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          style={{ display: 'none' }} 
        />
      </div>

      {/* Form Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!firstName.trim()}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '16px',
          border: 'none',
          background: firstName.trim() ? 'var(--text-primary)' : 'var(--border-color)',
          color: firstName.trim() ? 'var(--bg-main)' : 'var(--text-secondary)',
          fontSize: '16px',
          fontWeight: '600',
          marginTop: 'auto',
          cursor: firstName.trim() ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s'
        }}
      >
        Save Changes
      </button>

    </div>
  );
};
