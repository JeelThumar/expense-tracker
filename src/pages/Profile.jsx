import React, { useState } from 'react';
import { IoPersonOutline, IoCloudDownloadOutline, IoCloudUploadOutline, IoTrashOutline, IoLogOutOutline, IoChevronForward } from 'react-icons/io5';
import { useAppContext } from '../context/AppContext.jsx';
import { ConfirmModal } from '../components/ui.jsx';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export const Profile = () => {
  const { user, transactions, logout, eraseAllData } = useAppContext();
  const navigate = useNavigate();
  
  // Modal states
  const [isEraseModalOpen, setIsEraseModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  // Export date states
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [exportError, setExportError] = useState('');

  const getInitial = () => {
    if (user && user.firstName) return user.firstName.charAt(0).toUpperCase();
    return 'U';
  };

  const getFullName = () => {
    if (!user) return 'User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  };

  const handleEraseData = async () => {
    setIsEraseModalOpen(false);
    await eraseAllData();
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  const handleExport = () => {
    if (!exportStart || !exportEnd) {
      setExportError('Both Start Date and End Date are compulsory.');
      return;
    }

    const startDate = new Date(exportStart);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(exportEnd);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
      setExportError('Start Date cannot be after End Date.');
      return;
    }

    setExportError('');

    // Filter transactions
    const filteredTxns = transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate >= startDate && txnDate <= endDate;
    });

    if (filteredTxns.length === 0) {
      setExportError('No transactions found in this date range.');
      return;
    }

    // Prepare data for Excel
    const dataToExport = filteredTxns.map(txn => ({
      Date: format(new Date(txn.date), 'yyyy-MM-dd HH:mm'),
      Type: txn.type === 'income' ? 'Income' : 'Expense',
      Category: txn.category,
      Amount: txn.amount,
      'With Whom': txn.withWhom || '',
      Note: txn.note || ''
    }));

    // Create workbook and download
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    
    const fileName = `Trecker_Export_${format(startDate, 'MMM_yyyy')}_to_${format(endDate, 'MMM_yyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    // Close modal
    setIsExportModalOpen(false);
    setExportStart('');
    setExportEnd('');
  };

  return (
    <div style={{ padding: '24px' }}>
      
      {/* Profile Header Card */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 24px',
        background: 'var(--bg-card)',
        borderRadius: '24px',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: user?.photo ? `url(${user.photo}) center/cover` : 'linear-gradient(135deg, #4f46e5, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: '0 8px 16px rgba(236, 72, 153, 0.3)'
        }}>
          {!user?.photo && (
            <span style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>
              {getInitial()}
            </span>
          )}
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
          {getFullName()}
        </h2>
        <span style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Local Profile</span>
      </div>

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        <div 
          style={{ ...optionStyle, cursor: 'pointer' }}
          onClick={() => navigate('/profile-info')}
        >
          <div style={leftIconStyle}><IoPersonOutline size={20} /></div>
          <div style={textContainerStyle}>
            <span style={titleStyle}>Profile Info</span>
          </div>
          <IoChevronForward size={20} color="var(--text-tertiary)" />
        </div>

        <div style={optionStyle}>
          <div style={leftIconStyle}><IoCloudDownloadOutline size={20} /></div>
          <div style={textContainerStyle}>
            <span style={titleStyle}>Import Data</span>
            <span style={{ fontSize: '10px', background: 'var(--bg-card-elevated)', padding: '2px 8px', borderRadius: '8px', color: 'var(--text-secondary)' }}>Coming Soon</span>
          </div>
          <IoChevronForward size={20} color="var(--text-tertiary)" />
        </div>

        <div 
          style={{ ...optionStyle, cursor: 'pointer' }}
          onClick={() => setIsExportModalOpen(true)}
        >
          <div style={leftIconStyle}><IoCloudUploadOutline size={20} /></div>
          <div style={textContainerStyle}>
            <span style={titleStyle}>Export Data</span>
          </div>
          <IoChevronForward size={20} color="var(--text-tertiary)" />
        </div>

        <div 
          style={{ ...optionStyle, cursor: 'pointer' }}
          onClick={() => setIsEraseModalOpen(true)}
        >
          <div style={{ ...leftIconStyle, color: '#ff4b4b', background: 'rgba(255, 75, 75, 0.1)' }}>
            <IoTrashOutline size={20} />
          </div>
          <div style={textContainerStyle}>
            <span style={{ ...titleStyle, color: '#ff4b4b' }}>Erase My Old Data</span>
          </div>
        </div>

        <div 
          style={{ ...optionStyle, cursor: 'pointer', marginTop: '16px' }}
          onClick={() => setIsLogoutModalOpen(true)}
        >
          <div style={leftIconStyle}><IoLogOutOutline size={20} /></div>
          <div style={textContainerStyle}>
            <span style={titleStyle}>Logout</span>
          </div>
        </div>

      </div>

      {/* Erase Data Confirm Modal */}
      <ConfirmModal 
        isOpen={isEraseModalOpen}
        title="Erase All Data?"
        message="Are you completely sure you want to erase all your transactions? This action cannot be undone."
        confirmText="Erase Data"
        cancelText="Keep Data"
        onConfirm={handleEraseData}
        onCancel={() => setIsEraseModalOpen(false)}
      />

      {/* Logout Confirm Modal */}
      <ConfirmModal 
        isOpen={isLogoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out of your profile?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />

      {/* Export Data Modal */}
      {isExportModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '340px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Export to Excel</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Start Date (Compulsory)</label>
                <input 
                  type="date" 
                  value={exportStart} 
                  onChange={(e) => setExportStart(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  style={dateInputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>End Date (Compulsory)</label>
                <input 
                  type="date" 
                  value={exportEnd} 
                  onChange={(e) => setExportEnd(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  style={dateInputStyle}
                />
              </div>
              {exportError && <span style={{ color: '#ff4b4b', fontSize: '12px' }}>{exportError}</span>}
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { setIsExportModalOpen(false); setExportError(''); }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: 'var(--text-primary)', color: 'var(--bg-main)', fontWeight: '600', cursor: 'pointer' }}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Reusable Styles for Options
const optionStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  background: 'var(--bg-card)',
  borderRadius: '16px',
  transition: 'transform 0.2s',
};

const leftIconStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  background: 'var(--bg-main)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-primary)',
  marginRight: '16px'
};

const textContainerStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const titleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: 'var(--text-primary)'
};

const dateInputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-main)',
  color: 'var(--text-primary)',
  outline: 'none',
  fontSize: '16px',
  fontFamily: 'var(--font-primary)'
};
