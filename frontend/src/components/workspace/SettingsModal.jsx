import React, { useState } from 'react';

const THEMES = [
  { id: 'vs-dark',     label: 'VS Dark',     preview: ['#0c0d10','#1e1e1e','#6366f1'] },
  { id: 'dracula',     label: 'Dracula',     preview: ['#191a21','#282a36','#bd93f9'] },
  { id: 'monokai',     label: 'Monokai',     preview: ['#1a1b18','#272822','#ae81ff'] },
  { id: 'github-dark', label: 'GitHub Dark', preview: ['#010409','#0d1117','#388bfd'] },
  { id: 'nord',        label: 'Nord',        preview: ['#242933','#2e3440','#5e81ac'] },
];

const FONT_SIZES = [11, 12, 13, 14, 15, 16, 18, 20];

const MONACO_THEMES = {
  'vs-dark':     'vs-dark',
  'dracula':     'vs-dark',
  'monokai':     'vs-dark',
  'github-dark': 'vs-dark',
  'nord':        'vs-dark',
};

const SettingsModal = ({ onClose, fontSize, setFontSize, currentTheme, setTheme, showMinimap, setShowMinimap, wordWrap, setWordWrap, smoothScroll, setSmoothScroll }) => {
  const [activeTab, setActiveTab] = useState('appearance');

  const applyTheme = (themeId) => {
    setTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId === 'vs-dark' ? '' : themeId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-[560px] max-h-[80vh] rounded-xl overflow-hidden flex flex-col shadow-2xl border"
        style={{ background: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ background: 'var(--theme-panel)', borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--theme-accent)" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
            <span className="text-sm font-semibold text-white">Settings</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
          >×</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left nav */}
          <div
            className="w-40 flex-shrink-0 border-r flex flex-col gap-1 p-2"
            style={{ background: 'var(--theme-panel)', borderColor: 'var(--theme-border)' }}
          >
            {[
              { id: 'appearance', label: 'Appearance', icon: '🎨' },
              { id: 'editor',     label: 'Editor',     icon: '✏️' },
              { id: 'keybinds',   label: 'Keybindings', icon: '⌨️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                style={activeTab === tab.id ? { background: 'var(--theme-accent)', opacity: 0.9 } : {}}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">

            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--theme-muted)' }}>
                    Color Theme
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => applyTheme(t.id)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                          currentTheme === t.id
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-transparent hover:border-white/10 hover:bg-white/5'
                        }`}
                        style={{ borderColor: currentTheme === t.id ? 'var(--theme-accent)' : undefined }}
                      >
                        {/* Color swatches */}
                        <div className="flex gap-1">
                          {t.preview.map((c, i) => (
                            <div key={i} className="w-5 h-5 rounded-sm" style={{ background: c }} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-200">{t.label}</span>
                        {currentTheme === t.id && (
                          <span className="ml-auto text-xs" style={{ color: 'var(--theme-accent)' }}>✓ Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="space-y-6 animate-fade-in">
                {/* Font Size */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--theme-muted)' }}>
                    Font Size
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="11"
                      max="20"
                      value={fontSize}
                      onChange={e => setFontSize(Number(e.target.value))}
                      className="flex-1 accent-indigo-500"
                    />
                    <span className="text-white font-mono text-sm w-10 text-center">{fontSize}px</span>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {FONT_SIZES.map(s => (
                      <button
                        key={s}
                        onClick={() => setFontSize(s)}
                        className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
                          fontSize === s
                            ? 'text-white'
                            : 'border-transparent text-gray-400 hover:border-white/10 hover:text-white'
                        }`}
                        style={fontSize === s ? { background: 'var(--theme-accent)', borderColor: 'transparent' } : { borderColor: 'var(--theme-border)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--theme-muted)' }}>
                    Font Family
                  </h3>
                  <div className="flex flex-col gap-2">
                    {["'Fira Code', monospace", "Consolas, monospace", "'Courier New', monospace"].map(f => (
                      <button key={f} className="text-left px-3 py-2 rounded-lg border text-xs font-mono text-gray-300 hover:bg-white/5 transition-all" style={{ borderColor: 'var(--theme-border)' }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Minimap + Word Wrap + Smooth Scroll — all wired to Monaco */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--theme-muted)' }}>
                    Other
                  </h3>
                  <div className="space-y-1">
                    {/* Minimap */}
                    <label className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer">
                      <div>
                        <p className="text-sm text-gray-300">Show Minimap</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--theme-muted)' }}>Code overview on the right side</p>
                      </div>
                      <div
                        className="relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
                        style={{ background: showMinimap ? 'var(--theme-accent)' : 'var(--theme-border)' }}
                        onClick={() => setShowMinimap(v => !v)}
                      >
                        <div
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow"
                          style={{ transform: showMinimap ? 'translateX(22px)' : 'translateX(2px)' }}
                        />
                      </div>
                    </label>
                    {/* Word Wrap */}
                    <label className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer">
                      <div>
                        <p className="text-sm text-gray-300">Word Wrap</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--theme-muted)' }}>Wrap long lines to fit the editor</p>
                      </div>
                      <div
                        className="relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
                        style={{ background: wordWrap === 'on' ? 'var(--theme-accent)' : 'var(--theme-border)' }}
                        onClick={() => setWordWrap(v => v === 'on' ? 'off' : 'on')}
                      >
                        <div
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow"
                          style={{ transform: wordWrap === 'on' ? 'translateX(22px)' : 'translateX(2px)' }}
                        />
                      </div>
                    </label>
                    {/* Smooth Scroll */}
                    <label className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-pointer">
                      <div>
                        <p className="text-sm text-gray-300">Smooth Scrolling</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--theme-muted)' }}>Animate editor scroll movements</p>
                      </div>
                      <div
                        className="relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
                        style={{ background: smoothScroll ? 'var(--theme-accent)' : 'var(--theme-border)' }}
                        onClick={() => setSmoothScroll(v => !v)}
                      >
                        <div
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow"
                          style={{ transform: smoothScroll ? 'translateX(22px)' : 'translateX(2px)' }}
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keybinds' && (
              <div className="space-y-2 animate-fade-in">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--theme-muted)' }}>
                  Keyboard Shortcuts
                </h3>
                {[
                  ['Run Code',      'Ctrl + Enter'],
                  ['Toggle Panel',  'Ctrl + `'],
                  ['Format Code',   'Shift + Alt + F'],
                  ['Find',          'Ctrl + F'],
                  ['Undo',          'Ctrl + Z'],
                  ['Redo',          'Ctrl + Y'],
                  ['Save',          'Ctrl + S'],
                  ['Split View',    'Ctrl + \\'],
                ].map(([action, key]) => (
                  <div key={action} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5">
                    <span className="text-sm text-gray-300">{action}</span>
                    <kbd
                      className="px-2 py-0.5 rounded text-xs font-mono text-gray-400 border"
                      style={{ background: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
                    >
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 px-5 py-3 border-t"
          style={{ background: 'var(--theme-panel)', borderColor: 'var(--theme-border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all border"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm text-white font-medium transition-all"
            style={{ background: 'var(--theme-accent)' }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
