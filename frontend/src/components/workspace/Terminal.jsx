import React, { useRef, useEffect } from 'react';

const TABS = [
  { id: 'console',  label: 'Console' },
  { id: 'problems', label: 'Problems' },
  { id: 'activity', label: 'Activity' },
  { id: 'terminal', label: 'Terminal' },
];

const ACTIVITY_ICONS = {
  join:   { icon: '→', color: '#10b981' },
  leave:  { icon: '←', color: '#ef4444' },
  change: { icon: '✎', color: '#6366f1' },
  cursor: { icon: '◎', color: '#f59e0b' },
};

const fmt = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

const Terminal = ({ language, isRunning, terminalOutput, activeTab, setActiveTab, previewContent, clearTerminal, setShowTerminal, activityLog = [] }) => {
  const bodyRef = useRef(null);
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [terminalOutput, activityLog, activeTab]);

  return (
    <div style={{
      borderTop: '1px solid #2d2d2d',
      display: 'flex', flexDirection: 'column',
      height: 240, minHeight: 150, maxHeight: '50vh',
      background: '#0c0d10', flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 36, background: '#1e1e1e', borderBottom: '1px solid #2d2d2d',
        flexShrink: 0, paddingRight: 8,
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', height: '100%' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0 16px', height: '100%', background: 'transparent', border: 'none',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  color: isActive ? '#e1e1e1' : '#858585',
                  borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all .15s',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeTab === 'console' && (
            <button onClick={clearTerminal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#858585', padding: '2px 8px', borderRadius: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = '#e1e1e1'} onMouseLeave={e => e.currentTarget.style.color = '#858585'}>
              Clear
            </button>
          )}
          <button onClick={() => setShowTerminal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#858585', lineHeight: 1, padding: '0 4px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e1e1e1'} onMouseLeave={e => e.currentTarget.style.color = '#858585'}>
            ×
          </button>
        </div>
      </div>

      {/* Body */}
      <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: 12, fontFamily: "'Fira Code',Consolas,monospace", fontSize: 12.5 }}>

        {/* CONSOLE */}
        {activeTab === 'console' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {isRunning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b' }}>
                <div className="vs-loader-sm" style={{ borderTopColor: '#f59e0b' }} />
                Executing {language?.toUpperCase()}…
              </div>
            )}
            {!isRunning && !terminalOutput && (
              <span style={{ color: '#858585', fontStyle: 'italic' }}>Press Run to execute your {language?.toUpperCase()} code.</span>
            )}
            {terminalOutput?.error && (
              <div style={{ color: '#fca5a5', whiteSpace: 'pre-wrap' }}>✖ {terminalOutput.error}</div>
            )}
            {terminalOutput?.stderr && (
              <div style={{ color: '#ef4444', whiteSpace: 'pre-wrap' }}>{terminalOutput.stderr}</div>
            )}
            {terminalOutput?.stdout && (
              <div style={{ color: '#a7f3d0', whiteSpace: 'pre-wrap' }}>{terminalOutput.stdout}</div>
            )}
            {terminalOutput && (
              <div style={{ display: 'flex', gap: 16, marginTop: 8, paddingTop: 8, borderTop: '1px solid #2d2d2d', fontSize: 11, color: '#858585' }}>
                {terminalOutput.exitCode !== null && (
                  <span style={{ color: terminalOutput.exitCode === 0 ? '#10b981' : '#ef4444' }}>
                    {terminalOutput.exitCode === 0 ? '✓' : '✖'} Exit code {terminalOutput.exitCode}
                  </span>
                )}
                {terminalOutput.executionTime !== null && <span>⏱ {terminalOutput.executionTime}ms</span>}
              </div>
            )}
          </div>
        )}

        {/* PROBLEMS */}
        {activeTab === 'problems' && (
          <span style={{ color: '#858585', fontStyle: 'italic' }}>No problems detected.</span>
        )}

        {/* ACTIVITY */}
        {activeTab === 'activity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activityLog.length === 0 && (
              <span style={{ color: '#858585', fontStyle: 'italic' }}>Collaboration activity will appear here…</span>
            )}
            {activityLog.map((ev, idx) => {
              const cfg = ACTIVITY_ICONS[ev.type] || ACTIVITY_ICONS.cursor;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12 }}>
                  <span style={{ color: '#555', flexShrink: 0, width: 56 }}>{fmt(ev.timestamp)}</span>
                  <span style={{ color: cfg.color, flexShrink: 0, width: 14, textAlign: 'center' }}>{cfg.icon}</span>
                  <span style={{ color: '#ccc' }}>
                    <span style={{ color: '#22d3ee', fontWeight: 600 }}>{ev.user}</span>
                    {ev.type === 'join'   && ' joined the room'}
                    {ev.type === 'leave'  && ' left the room'}
                    {ev.type === 'change' && (
                      <> changed <span style={{ fontFamily: 'monospace', background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '1px 5px', borderRadius: 4 }}>L{ev.fromLine}–L{ev.toLine}</span></>
                    )}
                    {ev.type === 'cursor' && (
                      <> moved to <span style={{ color: '#f59e0b' }}>L{ev.line}</span></>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* TERMINAL */}
        {activeTab === 'terminal' && (
          <span style={{ color: '#858585', fontStyle: 'italic' }}>
            <span style={{ color: '#10b981' }}>$</span> Interactive terminal not available in collaborative mode.
          </span>
        )}
      </div>
    </div>
  );
};

export default Terminal;
