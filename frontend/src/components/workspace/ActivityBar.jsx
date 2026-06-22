import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const icons = {
  files: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <polyline points="13 2 13 9 20 9"/>
    </svg>
  ),
  search: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  users: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
    </svg>
  ),
  back: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const iconBtn = (active, danger) => ({
  width: 48,
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: active ? '#e1e1e1' : danger ? '#858585' : '#858585',
  borderLeft: active ? '2px solid #6366f1' : '2px solid transparent',
  transition: 'color .15s, border-color .15s',
  position: 'relative',
  flexShrink: 0,
});

const ActivityBar = ({ activeSidePanel, setActiveSidePanel, onSettingsClick }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const topItems = [
    { id: 'files',  icon: icons.files,  title: 'Explorer' },
    { id: 'search', icon: icons.search, title: 'Search' },
    { id: 'users',  icon: icons.users,  title: 'Collaborators' },
  ];

  return (
    <aside
      style={{
        gridArea: 'act',
        width: 48,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#252526',
        borderRight: '1px solid #2d2d2d',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* Top buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Back to dashboard */}
        <button
          title="Dashboard"
          onClick={() => navigate('/dashboard')}
          style={iconBtn(false, false)}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#858585'}
        >
          {icons.back}
        </button>

        {/* Divider */}
        <div style={{ height: 1, background: '#3d3d3d', margin: '4px 10px' }} />

        {topItems.map(item => {
          const active = activeSidePanel === item.id;
          return (
            <button
              key={item.id}
              title={item.title}
              onClick={() => setActiveSidePanel(active ? null : item.id)}
              style={iconBtn(active, false)}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#858585'; }}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* Bottom buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <button
          title="Settings"
          onClick={onSettingsClick}
          style={iconBtn(false, false)}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#858585'}
        >
          {icons.settings}
        </button>
        <button
          title="Log Out"
          onClick={() => { logout(); navigate('/'); }}
          style={iconBtn(false, true)}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#858585'}
        >
          {icons.logout}
        </button>
      </div>
    </aside>
  );
};

export default ActivityBar;
