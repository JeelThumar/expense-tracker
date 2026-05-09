import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IoHome, IoHomeOutline, IoList, IoListOutline, IoPieChart, IoPieChartOutline, IoSettings, IoSettingsOutline, IoPeople, IoPeopleOutline, IoAdd } from 'react-icons/io5';

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', iconActive: IoHome, iconInactive: IoHomeOutline, label: 'Home' },
    { path: '/transactions', iconActive: IoList, iconInactive: IoListOutline, label: 'History' },
    { path: '/reports', iconActive: IoPieChart, iconInactive: IoPieChartOutline, label: 'Reports' },
    { path: '/friends', iconActive: IoPeople, iconInactive: IoPeopleOutline, label: 'Friends' },
    { path: '/settings', iconActive: IoSettings, iconInactive: IoSettingsOutline, label: 'Settings' },
  ];

  const getHeaderTitle = () => {
    switch (location.pathname) {
      case '/': return 'Trecker.';
      case '/transactions': return 'History';
      case '/reports': return 'Reports';
      case '/friends': return 'Friends';
      case '/settings': return 'Settings';
      default: return 'Trecker.';
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 24px 10px',
        position: 'sticky',
        top: 0,
        background: 'rgba(20, 20, 20, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 40
      }}>
        <h1 style={{ fontSize: location.pathname === '/' ? '28px' : '22px', fontWeight: '800' }}>
          {getHeaderTitle()}
        </h1>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        <Outlet />
      </main>

      {/* Bottom Navigation and FAB (Hidden on /add) */}
      {location.pathname !== '/add' && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 48px)',
          maxWidth: '400px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 50
        }}>
          {/* Floating Pill Nav */}
          <nav style={{
            flex: 1,
            background: 'rgba(28, 28, 30, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = isActive ? item.iconActive : item.iconInactive;
              return (
                <NavLink 
                  key={item.path} 
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                    color: isActive ? '#000000' : 'var(--text-tertiary)',
                    background: isActive ? '#ffffff' : 'transparent',
                    padding: isActive ? '10px 16px' : '10px',
                    borderRadius: '24px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <Icon size={20} />
                  {isActive && (
                    <span style={{ fontSize: '12px', fontWeight: '600', transition: 'opacity 0.3s' }}>
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Floating Action Button */}
          <button 
            onClick={() => navigate(location.pathname === '/friends' ? '/add-ledger' : '/add')}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffffff, #e0e0e0)',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              boxShadow: '0 10px 24px rgba(255, 255, 255, 0.25), 0 4px 8px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <IoAdd size={32} />
          </button>
        </div>
      )}
    </div>
  );
};
