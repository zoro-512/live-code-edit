import React, { useState } from 'react';

const AVATAR_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
const getAvatarColor = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];
const getShort       = (email) => (email?.split('@')[0] || 'U').substring(0, 2).toUpperCase();
const getDisplay     = (email) => email?.split('@')[0] || email;

const FileIcon = ({ name }) => {
  const ext = name.split('.').pop();
  const colors = { java:'#f89820', js:'#f7df1e', jsx:'#61dafb', ts:'#3178c6', xml:'#ef4444', css:'#38bdf8', html:'#e44d26' };
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 4px', borderRadius: 3, background: colors[ext] || '#555', color: ext === 'js' ? '#000' : '#fff', flexShrink: 0 }}>
      {ext?.toUpperCase().slice(0, 2)}
    </span>
  );
};

const Sidebar = ({ roomName, roomCode, members = [], userEmail, activeSidePanel, onFileOpen, fileNames = [], onCreateFile }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const folder = {
    name: 'src / main',
    open: isOpen,
    children: fileNames.map(name => {
      let dotColor = '#fff';
      if (name.endsWith('.java')) dotColor = '#f89820';
      else if (name.endsWith('.js') || name.endsWith('.jsx')) dotColor = '#f7df1e';
      else if (name.endsWith('.html')) dotColor = '#e44d26';
      else if (name.endsWith('.css')) dotColor = '#38bdf8';
      else if (name.endsWith('.py')) dotColor = '#3572a5';
      else if (name === 'index.js') dotColor = '#6366f1';
      return { name, dot: dotColor };
    })
  };

  const toggle = () => setIsOpen(prev => !prev);

  const copy = () => {
    navigator.clipboard.writeText(roomCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateFile = (e) => {
    if (e.key === 'Enter' && newFileName.trim()) {
      const name = newFileName.trim();

      const exists = fileNames.includes(name);
      if (exists) {
        alert(`A file named ${name} already exists.`);
        return;
      }

      if (onCreateFile) onCreateFile(name);
      setIsCreating(false);
      setNewFileName('');
      if (onFileOpen) onFileOpen(name);
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewFileName('');
    }
  };

  if (!activeSidePanel) return null;

  const S = {
    root: "w-[260px] flex flex-col bg-zinc-950 border-r border-zinc-800 overflow-hidden",
    panelHeader: "flex items-center justify-between px-4 h-9 shrink-0 border-b border-zinc-800",
    panelTitle: "text-[10px] font-bold uppercase tracking-widest text-zinc-400",
    scroll: "flex-1 overflow-y-auto",
    roomCodeBox: "border-t border-zinc-800 p-3 shrink-0",
    roomCodeInner: "flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3",
  };

  return (
    <aside className={S.root} style={{ gridArea: 'side' }}>

      {/* ── FILES ── */}
      {activeSidePanel === 'files' && (
        <>
          <div className={S.panelHeader}>
            <span className={S.panelTitle}>Explorer</span>
            <button onClick={() => setIsCreating(true)} className="bg-transparent border-none text-zinc-400 hover:text-white cursor-pointer text-base">+</button>
          </div>
          <div className={S.scroll}>
            <div className="pt-1.5 pb-0.5 px-3 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">
              {roomName || 'Workspace'}
            </div>
            <div>
                {/* Folder row */}
                <div
                  onClick={toggle}
                  className="flex items-center gap-1.5 px-3 py-1 cursor-pointer text-[13px] text-zinc-300 hover:bg-white/5 transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className={`text-zinc-500 transition-transform ${folder.open ? 'rotate-90' : ''}`}>
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
                    onClick={() => onFileOpen && onFileOpen(file.name)}
                    className="flex items-center gap-2 pl-8 pr-3 py-1 cursor-pointer text-[13px] text-zinc-300 hover:bg-white/5 transition-colors"
                  >
                    <FileIcon name={file.name} />
                    <span className="flex-1">{file.name}</span>
                    {file.dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: file.dot }} />}
                  </div>
                ))}
                {isCreating && folder.open && (
                  <div className="pl-8 pr-3 py-1">
                    <input
                      autoFocus
                      type="text"
                      value={newFileName}
                      onChange={e => setNewFileName(e.target.value)}
                      onKeyDown={handleCreateFile}
                      onBlur={() => { setIsCreating(false); setNewFileName(''); }}
                      placeholder="FileName.java"
                      className="w-full bg-zinc-900 text-white border border-indigo-500 px-1.5 py-0.5 text-xs outline-none"
                    />
                  </div>
                )}
            </div>
          </div>
          <div className={S.roomCodeBox}>
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5">Room Code</div>
            <div className={S.roomCodeInner}>
              <span className="font-mono text-[13px] font-semibold flex-1 text-cyan-400">{roomCode || '------'}</span>
              <button onClick={copy} className={`bg-transparent border-none cursor-pointer text-[11px] font-semibold ${copied ? 'text-emerald-500' : 'text-indigo-500'}`}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── SEARCH ── */}
      {activeSidePanel === 'search' && (
        <>
          <div className={S.panelHeader}>
            <span className={S.panelTitle}>Search</span>
          </div>
          <div className="p-3">
            <input
              type="text"
              placeholder="Search in workspace…"
              className="w-full px-3 py-2 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-lg text-xs outline-none box-border"
            />
            <p className="text-[11px] text-zinc-500 mt-3 text-center">Type to search across files</p>
          </div>
        </>
      )}

      {/* ── USERS ── */}
      {activeSidePanel === 'users' && (
        <>
          <div className={S.panelHeader}>
            <span className={S.panelTitle}>Collaborators</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500 text-white">
              {members.length + 1}
            </span>
          </div>
          <div className={`${S.scroll} p-2`}>
            {/* Self */}
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-1 bg-indigo-500/10 border-l-2 border-indigo-500">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: getAvatarColor(0) }}>
                {getShort(userEmail)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-zinc-300 truncate">{getDisplay(userEmail)}</div>
                <div className="text-[10px] text-indigo-500">you · owner</div>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            </div>

            {/* Others */}
            {members.filter(m => m !== userEmail).map((em, idx) => (
              <div key={idx} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-1 hover:bg-white/5 transition-colors">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: getAvatarColor(idx + 1) }}>
                  {getShort(em)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-zinc-300 truncate">{getDisplay(em)}</div>
                  <div className="text-[10px] text-emerald-500">Online</div>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              </div>
            ))}
          </div>
          <div className={S.roomCodeBox}>
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5">Room Code</div>
            <div className={S.roomCodeInner}>
              <span className="font-mono text-[13px] font-semibold flex-1 text-cyan-400">{roomCode || '------'}</span>
              <button onClick={copy} className={`bg-transparent border-none cursor-pointer text-[11px] font-semibold ${copied ? 'text-emerald-500' : 'text-indigo-500'}`}>
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
