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
      className="w-12 flex flex-col justify-between items-center bg-zinc-950 border-r border-zinc-800 z-10 overflow-hidden" 
      style={{ gridArea: 'act' }}
    >
      {/* Top buttons */}
      <div className="flex flex-col w-full">
        {/* Back to dashboard */}
        <button
          title="Dashboard"
          onClick={() => navigate('/dashboard')}
          className="w-12 h-12 flex items-center justify-center border-none cursor-pointer text-zinc-400 hover:text-white border-l-2 border-transparent transition-colors flex-shrink-0 bg-transparent"
        >
          {icons.back}
        </button>

        {/* Divider */}
        <div className="h-px bg-zinc-800 mx-2 my-1" />

        {topItems.map(item => {
          const active = activeSidePanel === item.id;
          return (
            <button
              key={item.id}
              title={item.title}
              onClick={() => setActiveSidePanel(active ? null : item.id)}
              className={`w-12 h-12 flex items-center justify-center border-none cursor-pointer transition-colors flex-shrink-0 border-l-2 ${active ? 'text-zinc-100 border-indigo-500 bg-zinc-900' : 'text-zinc-400 border-transparent hover:text-white bg-transparent'}`}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* Bottom buttons */}
      <div className="flex flex-col w-full">
        <button
          title="Settings"
          onClick={onSettingsClick}
          className="w-12 h-12 flex items-center justify-center border-none cursor-pointer text-zinc-400 hover:text-white border-l-2 border-transparent transition-colors flex-shrink-0 bg-transparent"
        >
          {icons.settings}
        </button>
        <button
          title="Log Out"
          onClick={() => { logout(); navigate('/'); }}
          className="w-12 h-12 flex items-center justify-center border-none cursor-pointer text-zinc-400 hover:text-red-500 border-l-2 border-transparent transition-colors flex-shrink-0 bg-transparent"
        >
          {icons.logout}
        </button>
      </div>
    </aside>
  );
};

export default ActivityBar;
