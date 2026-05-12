import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline, IoSettingsOutline, IoChevronDown } from 'react-icons/io5';
import { useAppContext } from '../context/AppContext.jsx';

export const AppSettings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useAppContext();
  
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    navigate(-1);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', animation: 'fadeIn 0.6s ease' }}>
      {/* Header */}
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: 'var(--bg-card)', border: '1px solid var(--border-color)', 
            width: '44px', height: '44px', borderRadius: '14px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: 'var(--text-primary)', cursor: 'pointer' 
          }}
        >
          <IoCloseOutline size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>Application Settings</h2>
        <div style={{ width: '44px' }} />
      </div>

      <div style={{ padding: '0 20px 40px 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Units Section */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IoSettingsOutline size={14} />
            Measurement Units
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={settingRowStyle}>
              <span style={labelStyle}>Distance Unit</span>
              <div style={toggleContainerStyle}>
                {['km', 'miles'].map(unit => (
                  <button
                    key={unit}
                    onClick={() => setLocalSettings(prev => ({ ...prev, distanceUnit: unit }))}
                    style={{
                      ...toggleButtonStyle,
                      background: localSettings.distanceUnit === unit ? 'var(--text-primary)' : 'transparent',
                      color: localSettings.distanceUnit === unit ? 'var(--bg-main)' : 'var(--text-secondary)'
                    }}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>

            <div style={settingRowStyle}>
              <span style={labelStyle}>Fuel Unit</span>
              <div style={toggleContainerStyle}>
                {['Litre', 'Gallon'].map(unit => (
                  <button
                    key={unit}
                    onClick={() => setLocalSettings(prev => ({ ...prev, fuelUnit: unit }))}
                    style={{
                      ...toggleButtonStyle,
                      background: localSettings.fuelUnit === unit ? 'var(--text-primary)' : 'transparent',
                      color: localSettings.fuelUnit === unit ? 'var(--bg-main)' : 'var(--text-secondary)'
                    }}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
            Default Pricing
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Default Petrol Price (per {localSettings.fuelUnit})
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>₹</span>
              <input 
                type="number"
                step="0.01"
                value={localSettings.defaultFuelPrice}
                onChange={(e) => setLocalSettings(prev => ({ ...prev, defaultFuelPrice: parseFloat(e.target.value) || 0 }))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '24px',
                  fontWeight: '800',
                  width: '100%',
                  outline: 'none',
                  padding: '4px 0'
                }}
              />
            </div>
            <p style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: '1.5' }}>
              This price will be used for fuel calculations if no specific price is entered during a transaction.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            marginTop: 'auto',
            padding: '20px',
            borderRadius: '20px',
            background: 'var(--text-primary)',
            color: 'var(--bg-main)',
            fontSize: '17px',
            fontWeight: '800',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(255,255,255,0.05)'
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

const settingRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  background: 'var(--bg-card)',
  borderRadius: '20px',
  border: '1px solid var(--border-color)'
};

const labelStyle = {
  fontSize: '15px',
  fontWeight: '600',
  color: 'var(--text-primary)'
};

const toggleContainerStyle = {
  display: 'flex',
  background: 'var(--bg-main)',
  padding: '4px',
  borderRadius: '12px',
  border: '1px solid var(--border-color)'
};

const toggleButtonStyle = {
  padding: '6px 12px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '12px',
  fontWeight: '800',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'all 0.2s'
};
