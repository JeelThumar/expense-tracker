import React, { useState } from 'react';
import { IoPersonOutline, IoCloudDownloadOutline, IoCloudUploadOutline, IoTrashOutline, IoLogOutOutline, IoChevronForward, IoSettingsOutline } from 'react-icons/io5';
import { useAppContext } from '../context/AppContext.jsx';
import { ConfirmModal } from '../components/ui.jsx';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

export const Profile = () => {
  const { user, transactions, logout, eraseAllData } = useAppContext();
  const navigate = useNavigate();
  
  const [isEraseModalOpen, setIsEraseModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Export date states
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [exportError, setExportError] = useState('');
  
  const [importStatus, setImportStatus] = useState('');
  const { importTransactions } = useAppContext();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportStatus('Processing...');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          setImportStatus('No data found in file.');
          return;
        }

        // Map data to our format with flexible column matching
        const mapped = data.map((row, idx) => {
          const findVal = (keys) => {
            const key = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
            return key ? row[key] : null;
          };

          const amountVal = findVal(['amount', 'value', 'price', 'amt']);
          const typeVal = findVal(['type', 'kind', 'transaction type']);
          const dateVal = findVal(['date', 'time', 'created at', 'day']);
          const catVal = findVal(['category', 'cat', 'group', 'label']);
          const noteVal = findVal(['note', 'description', 'desc', 'remarks', 'memo']);
          const withWhomVal = findVal(['with whom', 'contact', 'person', 'people', 'friend']);

          return {
            id: (Date.now() + idx).toString(),
            date: dateVal ? new Date(dateVal).toISOString() : new Date().toISOString(),
            amount: parseFloat(amountVal) || 0,
            category: catVal || 'Imported',
            type: (typeVal?.toString().toLowerCase() === 'income') ? 'income' : 'expense',
            note: noteVal || '',
            withWhom: withWhomVal || '',
            isImported: true
          };
        });

        importTransactions(mapped);
        setImportStatus(`Successfully imported ${mapped.length} transactions!`);
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportStatus('');
        }, 2000);
      } catch (err) {
        console.error(err);
        setImportStatus('Error parsing file. Ensure it is a valid Excel or CSV.');
      }
    };
    reader.onerror = () => setImportStatus('Error reading file.');
    reader.readAsBinaryString(file);
  };

  const getInitial = () => {
    if (user) {
      if (user.displayName) return user.displayName.charAt(0).toUpperCase();
      if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    if (!user) return 'User';
    if (user.displayName) return user.displayName;
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
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
    <div style={{ padding: '20px 20px 100px', animation: 'fadeIn 0.6s ease' }}>
      
      {/* Profile Header Card */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 24px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
        borderRadius: '28px',
        marginBottom: '32px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background element */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-success)', filter: 'blur(100px)', opacity: 0.1, pointerEvents: 'none' }} />

        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '24px',
          background: user?.photoURL ? `url(${user.photoURL}) center/cover` : 'linear-gradient(135deg, #333, #111)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          border: '2px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
          transform: 'rotate(-3deg)'
        }}>
          {!user?.photoURL && (
            <span style={{ fontSize: '36px', fontWeight: '900', color: '#ffffff' }}>
              {getInitial()}
            </span>
          )}
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '6px', letterSpacing: '-0.5px' }}>
          {getFullName()}
        </h2>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', fontWeight: '700', letterSpacing: '0.5px' }}>
          {user?.email || 'Standard Member'}
        </div>
      </div>

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '120px' }}>
        
        <div 
          onClick={() => navigate('/profile-info')}
          className="animate-slide-up"
          style={{ ...optionStyle, cursor: 'pointer', animationDelay: '0.1s' }}
        >
          <div style={leftIconStyle}><IoPersonOutline size={20} /></div>
          <div style={textContainerStyle}>
            <span style={titleStyle}>Profile Info</span>
          </div>
          <IoChevronForward size={18} color="var(--text-tertiary)" />
        </div>

        <div 
          onClick={() => navigate('/app-settings')}
          className="animate-slide-up"
          style={{ ...optionStyle, cursor: 'pointer', animationDelay: '0.12s' }}
        >
          <div style={leftIconStyle}><IoSettingsOutline size={20} /></div>
          <div style={textContainerStyle}>
            <span style={titleStyle}>App Settings</span>
          </div>
          <IoChevronForward size={18} color="var(--text-tertiary)" />
        </div>

        <div 
          onClick={() => setIsImportModalOpen(true)}
          className="animate-slide-up"
          style={{ ...optionStyle, cursor: 'pointer', animationDelay: '0.15s' }}
        >
          <div style={leftIconStyle}><IoCloudDownloadOutline size={20} /></div>
          <div style={textContainerStyle}>
            <span style={titleStyle}>Import Data</span>
          </div>
          <IoChevronForward size={18} color="var(--text-tertiary)" />
        </div>

        <div 
          onClick={() => setIsExportModalOpen(true)}
          className="animate-slide-up"
          style={{ ...optionStyle, cursor: 'pointer', animationDelay: '0.2s' }}
        >
          <div style={leftIconStyle}><IoCloudUploadOutline size={20} /></div>
          <div style={textContainerStyle}>
            <span style={titleStyle}>Export Data</span>
          </div>
          <IoChevronForward size={18} color="var(--text-tertiary)" />
        </div>

        <div 
          onClick={() => setIsEraseModalOpen(true)}
          className="animate-slide-up"
          style={{ ...optionStyle, cursor: 'pointer', animationDelay: '0.25s' }}
        >
          <div style={{ ...leftIconStyle, color: '#ff4b4b', background: 'rgba(255, 75, 75, 0.05)' }}>
            <IoTrashOutline size={20} />
          </div>
          <div style={textContainerStyle}>
            <span style={{ ...titleStyle, color: '#ff4b4b' }}>Erase All Data</span>
          </div>
          <IoChevronForward size={18} color="rgba(255, 75, 75, 0.3)" />
        </div>

        <div 
          onClick={() => setIsLogoutModalOpen(true)}
          className="animate-slide-up"
          style={{ ...optionStyle, cursor: 'pointer', marginTop: '12px', animationDelay: '0.3s' }}
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

      {/* Import Data Modal */}
      {isImportModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '340px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Import from Excel/CSV</h3>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              Select an Excel (.xlsx) or CSV file. We'll automatically detect your transaction details.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="import-file-input"
              />
              <label 
                htmlFor="import-file-input"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '2px dashed var(--border-color)',
                  background: 'rgba(255,255,255,0.02)',
                  color: 'var(--text-primary)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <IoCloudDownloadOutline size={24} />
                Choose File
              </label>
              
              {importStatus && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  background: importStatus.includes('Error') ? 'rgba(255, 75, 75, 0.1)' : 'rgba(52, 199, 89, 0.1)',
                  color: importStatus.includes('Error') ? '#ff4b4b' : '#34c759',
                  fontSize: '12px',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {importStatus}
                </div>
              )}
            </div>
            
            <button
              onClick={() => { setIsImportModalOpen(false); setImportStatus(''); }}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', fontWeight: '600', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
