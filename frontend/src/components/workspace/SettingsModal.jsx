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
  const [activeTab, setActiveTab] = useState('appearance');
  const [fontFamily, setFontFamily] = useState("'Fira Code', monospace");

  const applyFontFamily = (family) => {
    setFontFamily(family);
    if (editorRef?.current) {
      editorRef.current.updateOptions({ fontFamily: family });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-[580px] max-h-[82vh] bg-[#18181b] border border-[#27272a] rounded-xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#27272a] bg-[#1c1c1f] shrink-0">
          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
            <span className="text-sm font-semibold text-[#e1e1e1]">Settings</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-[#858585] hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left nav */}
          <div className="w-[148px] shrink-0 border-r border-[#27272a] bg-[#1c1c1f] p-2 flex flex-col gap-1">
            {[
              { id: 'appearance', label: 'Appearance', icon: '🎨' },
              { id: 'editor',     label: 'Editor',     icon: '✏️' },
              { id: 'keybinds',   label: 'Keybindings', icon: '⌨️' },
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                  activeTab === tab.id ? 'bg-[#6366f1] text-white' : 'bg-transparent text-[#858585] hover:text-[#e1e1e1]'
                }`}
              >
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">

            {/* ── APPEARANCE ── */}
            {activeTab === 'appearance' && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#858585] mb-3">Color Theme</p>
                <div className="flex flex-col gap-1.5">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-all text-left ${
                        currentTheme === t.id 
                          ? 'border-[#6366f1] bg-indigo-500/10' 
                          : 'border-[#27272a] bg-transparent hover:border-[#3f3f46]'
                      }`}
                    >
                      <div className="flex gap-1">
                        {t.preview.map((c, i) => (
                          <div key={i} className="w-[18px] h-[18px] rounded-sm" style={{ background: c }} />
                        ))}
                      </div>
                      <span className="text-[13px] text-[#e1e1e1] flex-1">{t.label}</span>
                      {currentTheme === t.id && (
                        <span className="text-[11px] text-[#6366f1] font-semibold">✓ Active</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── EDITOR ── */}
            {activeTab === 'editor' && (
              <div className="space-y-6">
                {/* Font Size */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#858585] mb-3">Font Size</p>
                  <div className="flex items-center gap-3 mb-3">
                    <input type="range" min="11" max="20" value={fontSize}
                      onChange={e => setFontSize(Number(e.target.value))}
                      className="flex-1 accent-[#6366f1]" />
                    <span className="text-[#e1e1e1] text-[13px] font-mono w-11 text-center">
                      {fontSize}px
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {FONT_SIZES.map(s => (
                      <button key={s} onClick={() => setFontSize(s)} className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                        fontSize === s 
                          ? 'bg-[#6366f1] text-white border-transparent' 
                          : 'bg-transparent text-[#858585] border-[#27272a]'
                      }`}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#858585] mb-3">Font Family</p>
                  <div className="flex flex-col gap-1.5">
                    {FONT_FAMILIES.map(f => (
                      <button key={f.value} onClick={() => applyFontFamily(f.value)} className={`px-3.5 py-2 rounded-lg text-left text-xs transition-all border ${
                        fontFamily === f.value 
                          ? 'bg-indigo-500/10 text-indigo-300 border-[#6366f1]' 
                          : 'bg-transparent text-[#858585] border-[#27272a]'
                      }`} style={{ fontFamily: f.value }}>{f.label}</button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#858585] mb-3">Other</p>
                  <div className="flex flex-col gap-1">
                    {/* Minimap */}
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg">
                      <div>
                        <p className="text-[13px] text-[#e1e1e1]">Show Minimap</p>
                        <p className="text-[10px] text-[#858585] mt-0.5">Code overview on the right side</p>
                      </div>
                      <button className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${showMinimap ? 'bg-[#6366f1]' : 'bg-[#3d3d3d]'}`} onClick={() => setShowMinimap(v => !v)}>
                        <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform shadow ${showMinimap ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                      </button>
                    </div>
                    {/* Word Wrap */}
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg">
                      <div>
                        <p className="text-[13px] text-[#e1e1e1]">Word Wrap</p>
                        <p className="text-[10px] text-[#858585] mt-0.5">Wrap long lines to fit the editor</p>
                      </div>
                      <button className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${wordWrap === 'on' ? 'bg-[#6366f1]' : 'bg-[#3d3d3d]'}`} onClick={() => setWordWrap(v => v === 'on' ? 'off' : 'on')}>
                        <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform shadow ${wordWrap === 'on' ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                      </button>
                    </div>
                    {/* Smooth Scroll */}
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg">
                      <div>
                        <p className="text-[13px] text-[#e1e1e1]">Smooth Scrolling</p>
                        <p className="text-[10px] text-[#858585] mt-0.5">Animate editor scroll movements</p>
                      </div>
                      <button className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${smoothScroll ? 'bg-[#6366f1]' : 'bg-[#3d3d3d]'}`} onClick={() => setSmoothScroll(v => !v)}>
                        <div className={`absolute top-[2px] w-4 h-4 rounded-full bg-white transition-transform shadow ${smoothScroll ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── KEYBINDINGS ── */}
            {activeTab === 'keybinds' && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#858585] mb-3">Keyboard Shortcuts</p>
                <div className="flex flex-col gap-0.5">
                  {[
                    ['Run Code',     'Ctrl + Enter'],
                    ['Toggle Panel', 'Ctrl + `'],
                    ['Find',         'Ctrl + F'],
                    ['Undo',         'Ctrl + Z'],
                    ['Redo',         'Ctrl + Y'],
                    ['Save',         'Ctrl + S'],
                    ['Split View',   'Ctrl + \\'],
                  ].map(([action, key]) => (
                    <div key={action} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                      <span className="text-[13px] text-[#ccc]">{action}</span>
                      <kbd className="px-2 py-0.5 rounded text-[11px] font-mono text-[#858585] bg-[#0c0d10] border border-[#27272a]">{key}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 px-5 py-3 border-t border-[#27272a] bg-[#1c1c1f] shrink-0">
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg text-[13px] text-[#858585] bg-transparent border border-[#27272a] hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={onClose} className="px-4.5 py-1.5 rounded-lg text-[13px] font-semibold text-white bg-[#6366f1] border-none hover:bg-indigo-600 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
