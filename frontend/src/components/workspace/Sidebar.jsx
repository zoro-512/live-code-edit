import React, { useState } from 'react';

const AVATAR_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
const getAvatarColor = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];
const getShort       = (email) => (email?.split('@')[0] || 'U').substring(0, 2).toUpperCase();
const getDisplay     = (email) => email?.split('@')[0] || email;

const FILE_TREE = [
  {
    name: 'src / main', open: true,
    children: [
      { name: 'Main.java', dot: '#6366f1' },
    ],
  },
];

const FileIcon = ({ name }) => {
  const ext = name.split('.').pop();
  const colors = { java:'#f89820', js:'#f7df1e', jsx:'#61dafb', ts:'#3178c6', xml:'#ef4444', css:'#38bdf8', html:'#e44d26' };
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 4px', borderRadius: 3, background: colors[ext] || '#555', color: ext === 'js' ? '#000' : '#fff', flexShrink: 0 }}>
      {ext?.toUpperCase().slice(0, 2)}
    </span>
  );
};

const Sidebar = ({ roomName, roomCode, members = [], userEmail, activeSidePanel }) => {
  const [tree, setTree] = useState(FILE_TREE);
  const [copied, setCopied] = useState(false);

  const toggle = (i) => setTree(prev => prev.map((f, idx) => idx === i ? { ...f, open: !f.open } : f));

  const copy = () => {
    navigator.clipboard.writeText(roomCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeSidePanel) return null;

  const S = {
    root: {
      gridArea: 'side',
      width: 260,
      display: 'flex',
      flexDirection: 'column',
      background: '#1e1e1e',
      borderRight: '1px solid #2d2d2d',
      overflow: 'hidden',
    },
    panelHeader: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', height: 36, flexShrink: 0,
      borderBottom: '1px solid #2d2d2d',
    },
    panelTitle: {
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 2, color: '#858585',
    },
    scroll: { flex: 1, overflowY: 'auto' },
    roomCodeBox: {
      borderTop: '1px solid #2d2d2d', padding: 12, flexShrink: 0,
    },
    roomCodeInner: {
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#0c0d10', border: '1px solid #2d2d2d',
      borderRadius: 8, padding: '8px 12px',
    },
  };

  return (
    <aside style={S.root}>

      {/* ── FILES ── */}
      {activeSidePanel === 'files' && (
        <>
          <div style={S.panelHeader}>
            <span style={S.panelTitle}>Explorer</span>
          </div>
          <div style={S.scroll}>
            <div style={{ padding: '6px 0 2px', fontSize: 11, fontWeight: 600, color: '#858585', paddingLeft: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              {roomName || 'Workspace'}
            </div>
            {tree.map((folder, fi) => (
              <div key={fi}>
                {/* Folder row */}
                <div
                  onClick={() => toggle(fi)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13, color: '#ccc' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ transform: folder.open ? 'rotate(90deg)' : 'none', transition: 'transform .15s', color: '#858585' }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>{folder.name}</span>
                </div>
                {/* Files */}
                {folder.open && folder.children.map((file, fj) => (
                  <div
                    key={fj}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px 4px 32px', cursor: 'pointer', fontSize: 13, color: '#ccc' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <FileIcon name={file.name} />
                    <span style={{ flex: 1 }}>{file.name}</span>
                    {file.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: file.dot, flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={S.roomCodeBox}>
            <div style={{ fontSize: 10, color: '#858585', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Room Code</div>
            <div style={S.roomCodeInner}>
              <span style={{ fontFamily: "'Fira Code',monospace", fontSize: 13, fontWeight: 600, flex: 1, color: '#22d3ee' }}>{roomCode || '------'}</span>
              <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: copied ? '#10b981' : '#6366f1' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── SEARCH ── */}
      {activeSidePanel === 'search' && (
        <>
          <div style={S.panelHeader}>
            <span style={S.panelTitle}>Search</span>
          </div>
          <div style={{ padding: 12 }}>
            <input
              type="text"
              placeholder="Search in workspace…"
              style={{ width: '100%', padding: '8px 12px', background: '#0c0d10', color: '#e1e1e1', border: '1px solid #2d2d2d', borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: 11, color: '#858585', marginTop: 12, textAlign: 'center' }}>Type to search across files</p>
          </div>
        </>
      )}

      {/* ── USERS ── */}
      {activeSidePanel === 'users' && (
        <>
          <div style={S.panelHeader}>
            <span style={S.panelTitle}>Collaborators</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#6366f1', color: '#fff' }}>
              {members.length + 1}
            </span>
          </div>
          <div style={{ ...S.scroll, padding: 8 }}>
            {/* Self */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 4, background: 'rgba(99,102,241,0.06)', borderLeft: '2px solid #6366f1' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(0), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {getShort(userEmail)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e1e1e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getDisplay(userEmail)}</div>
                <div style={{ fontSize: 10, color: '#6366f1' }}>you · owner</div>
              </div>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
            </div>

            {/* Others */}
            {members.filter(m => m !== userEmail).map((em, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 4 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(idx + 1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {getShort(em)}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e1e1e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getDisplay(em)}</div>
                  <div style={{ fontSize: 10, color: '#10b981' }}>Online</div>
                </div>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              </div>
            ))}
          </div>
          <div style={S.roomCodeBox}>
            <div style={{ fontSize: 10, color: '#858585', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Room Code</div>
            <div style={S.roomCodeInner}>
              <span style={{ fontFamily: "'Fira Code',monospace", fontSize: 13, fontWeight: 600, flex: 1, color: '#22d3ee' }}>{roomCode || '------'}</span>
              <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: copied ? '#10b981' : '#6366f1' }}>
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
