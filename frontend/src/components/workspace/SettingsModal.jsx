import React, { useState } from 'react';

const THEMES = [
  { id: 'vs-dark',     label: 'VS Dark',     preview: ['#0c0d10','#1e1e1e','#6366f1'] },
  { id: 'dracula',     label: 'Dracula',     preview: ['#191a21','#282a36','#bd93f9'] },
  { id: 'monokai',     label: 'Monokai',     preview: ['#1a1b18','#272822','#ae81ff'] },
  { id: 'github-dark', label: 'GitHub Dark', preview: ['#010409','#0d1117','#388bfd'] },
  { id: 'nord',        label: 'Nord',        preview: ['#242933','#2e3440','#5e81ac'] },
];

const FONT_SIZES = [11, 12, 13, 14, 15, 16, 18, 20];

const FONT_FAMILIES = [
  { label: "Fira Code",   value: "'Fira Code', monospace" },
  { label: "Consolas",    value: "Consolas, monospace" },
  { label: "Courier New", value: "'Courier New', monospace" },
];

const SettingsModal = ({
  onClose, fontSize, setFontSize, currentTheme, setTheme,
  showMinimap, setShowMinimap, wordWrap, setWordWrap,
  smoothScroll, setSmoothScroll, editorRef,
}) => {
  const [activeTab,   setActiveTab]   = useState('appearance');
  const [fontFamily,  setFontFamily]  = useState("'Fira Code', monospace");

  const applyFontFamily = (family) => {
    setFontFamily(family);
    if (editorRef?.current) {
      editorRef.current.updateOptions({ fontFamily: family });
    }
  };

  // ─── inline style tokens ──────────────────────────────────────
  const S = {
    overlay: {
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
    },
    card: {
      width: 580, maxHeight: '82vh', borderRadius: 14,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: '#18181b', border: '1px solid #27272a',
      boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderBottom: '1px solid #27272a',
      background: '#1c1c1f', flexShrink: 0,
    },
    body: { display: 'flex', flex: 1, overflow: 'hidden' },
    nav: {
      width: 148, flexShrink: 0, borderRight: '1px solid #27272a',
      background: '#1c1c1f', padding: 8, display: 'flex', flexDirection: 'column', gap: 4,
    },
    navBtn: (active) => ({
      width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 8,
      background: active ? '#6366f1' : 'transparent',
      color: active ? '#fff' : '#858585', border: 'none', cursor: 'pointer',
      fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
      transition: 'all .15s',
    }),
    content: { flex: 1, overflowY: 'auto', padding: 20 },
    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: 2, color: '#858585', marginBottom: 12,
    },
    footer: {
      display: 'flex', justifyContent: 'flex-end', gap: 10,
      padding: '12px 20px', borderTop: '1px solid #27272a',
      background: '#1c1c1f', flexShrink: 0,
    },
    toggle: (on) => ({
      position: 'relative', width: 40, height: 20, borderRadius: 20,
      background: on ? '#6366f1' : '#3d3d3d', cursor: 'pointer',
      flexShrink: 0, transition: 'background .2s', border: 'none',
    }),
    toggleThumb: (on) => ({
      position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%',
      background: '#fff', transition: 'transform .2s',
      transform: on ? 'translateX(22px)' : 'translateX(2px)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
    }),
  };

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#e1e1e1' }}>Settings</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#858585', lineHeight: 1 }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#858585'}>×</button>
        </div>

        {/* Body */}
        <div style={S.body}>
          {/* Left nav */}
          <div style={S.nav}>
            {[
              { id: 'appearance', label: 'Appearance', icon: '🎨' },
              { id: 'editor',     label: 'Editor',     icon: '✏️' },
              { id: 'keybinds',   label: 'Keybindings', icon: '⌨️' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={S.navBtn(activeTab === tab.id)}
                onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = '#e1e1e1'; }}
                onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = '#858585'; }}>
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={S.content}>

            {/* ── APPEARANCE ── */}
            {activeTab === 'appearance' && (
              <div>
                <div style={S.section}>
                  <p style={S.sectionTitle}>Color Theme</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                          background: currentTheme === t.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                          border: `1px solid ${currentTheme === t.id ? '#6366f1' : '#27272a'}`,
                          textAlign: 'left', transition: 'all .15s',
                        }}
                        onMouseEnter={e => { if (currentTheme !== t.id) e.currentTarget.style.borderColor = '#3f3f46'; }}
                        onMouseLeave={e => { if (currentTheme !== t.id) e.currentTarget.style.borderColor = '#27272a'; }}
                      >
                        {/* Swatches */}
                        <div style={{ display: 'flex', gap: 4 }}>
                          {t.preview.map((c, i) => (
                            <div key={i} style={{ width: 18, height: 18, borderRadius: 4, background: c }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 13, color: '#e1e1e1', flex: 1 }}>{t.label}</span>
                        {currentTheme === t.id && (
                          <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>✓ Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── EDITOR ── */}
            {activeTab === 'editor' && (
              <div>
                {/* Font Size */}
                <div style={S.section}>
                  <p style={S.sectionTitle}>Font Size</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <input type="range" min="11" max="20" value={fontSize}
                      onChange={e => setFontSize(Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#6366f1' }} />
                    <span style={{ color: '#e1e1e1', fontSize: 13, fontFamily: 'monospace', width: 44, textAlign: 'center' }}>
                      {fontSize}px
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {FONT_SIZES.map(s => (
                      <button key={s} onClick={() => setFontSize(s)} style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'monospace', cursor: 'pointer',
                        background: fontSize === s ? '#6366f1' : 'transparent',
                        color: fontSize === s ? '#fff' : '#858585',
                        border: `1px solid ${fontSize === s ? 'transparent' : '#27272a'}`,
                        transition: 'all .15s',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div style={S.section}>
                  <p style={S.sectionTitle}>Font Family</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {FONT_FAMILIES.map(f => (
                      <button key={f.value} onClick={() => applyFontFamily(f.value)} style={{
                        padding: '9px 14px', borderRadius: 8, textAlign: 'left', cursor: 'pointer',
                        fontFamily: f.value, fontSize: 12,
                        background: fontFamily === f.value ? 'rgba(99,102,241,0.1)' : 'transparent',
                        color: fontFamily === f.value ? '#a5b4fc' : '#858585',
                        border: `1px solid ${fontFamily === f.value ? '#6366f1' : '#27272a'}`,
                        transition: 'all .15s',
                      }}>{f.label}</button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div style={S.section}>
                  <p style={S.sectionTitle}>Other</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* Minimap */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, color: '#e1e1e1', margin: 0 }}>Show Minimap</p>
                        <p style={{ fontSize: 10, color: '#858585', marginTop: 2 }}>Code overview on the right side</p>
                      </div>
                      <button style={S.toggle(showMinimap)} onClick={() => setShowMinimap(v => !v)}>
                        <div style={S.toggleThumb(showMinimap)} />
                      </button>
                    </div>
                    {/* Word Wrap */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, color: '#e1e1e1', margin: 0 }}>Word Wrap</p>
                        <p style={{ fontSize: 10, color: '#858585', marginTop: 2 }}>Wrap long lines to fit the editor</p>
                      </div>
                      <button style={S.toggle(wordWrap === 'on')} onClick={() => setWordWrap(v => v === 'on' ? 'off' : 'on')}>
                        <div style={S.toggleThumb(wordWrap === 'on')} />
                      </button>
                    </div>
                    {/* Smooth Scroll */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 8 }}>
                      <div>
                        <p style={{ fontSize: 13, color: '#e1e1e1', margin: 0 }}>Smooth Scrolling</p>
                        <p style={{ fontSize: 10, color: '#858585', marginTop: 2 }}>Animate editor scroll movements</p>
                      </div>
                      <button style={S.toggle(smoothScroll)} onClick={() => setSmoothScroll(v => !v)}>
                        <div style={S.toggleThumb(smoothScroll)} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── KEYBINDINGS ── */}
            {activeTab === 'keybinds' && (
              <div>
                <p style={S.sectionTitle}>Keyboard Shortcuts</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    ['Run Code',     'Ctrl + Enter'],
                    ['Toggle Panel', 'Ctrl + `'],
                    ['Find',         'Ctrl + F'],
                    ['Undo',         'Ctrl + Z'],
                    ['Redo',         'Ctrl + Y'],
                    ['Save',         'Ctrl + S'],
                    ['Split View',   'Ctrl + \\'],
                  ].map(([action, key]) => (
                    <div key={action} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', borderRadius: 8,
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 13, color: '#ccc' }}>{action}</span>
                      <kbd style={{
                        padding: '3px 8px', borderRadius: 5, fontSize: 11,
                        fontFamily: 'monospace', color: '#858585',
                        background: '#0c0d10', border: '1px solid #27272a',
                      }}>{key}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div style={S.footer}>
          <button onClick={onClose} style={{
            padding: '7px 16px', borderRadius: 8, fontSize: 13,
            background: 'transparent', color: '#858585',
            border: '1px solid #27272a', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={onClose} style={{
            padding: '7px 18px', borderRadius: 8, fontSize: 13,
            fontWeight: 600, background: '#6366f1', color: '#fff',
            border: 'none', cursor: 'pointer',
          }}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
