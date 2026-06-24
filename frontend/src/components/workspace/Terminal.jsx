import React, { useRef, useEffect } from 'react';

const BASE_TABS = [
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
  // Dynamically add Preview tab when previewContent is set
  const TABS = previewContent
    ? [...BASE_TABS, { id: 'preview', label: 'Preview' }]
    : BASE_TABS;

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [terminalOutput, activityLog, activeTab]);

  return (
    <div className="border-t border-zinc-800 flex flex-col h-[240px] min-h-[150px] max-h-[50vh] bg-zinc-950 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between h-9 bg-zinc-900 border-b border-zinc-800 shrink-0 pr-2">
        {/* Tabs */}
        <div className="flex h-full">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 h-full bg-transparent border-none cursor-pointer text-xs font-medium border-b-2 transition-all ${isActive ? 'text-zinc-100 border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'console' && (
            <button onClick={clearTerminal} className="bg-transparent border-none cursor-pointer text-[11px] text-zinc-500 hover:text-zinc-300 px-2 py-0.5 rounded">
              Clear
            </button>
          )}
          <button onClick={() => setShowTerminal(false)} className="bg-transparent border-none cursor-pointer text-lg text-zinc-500 hover:text-zinc-300 leading-none px-1">
            ×
          </button>
        </div>
      </div>

      {/* Body */}
      {/* Body */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto p-3 font-mono text-[12.5px] leading-relaxed">

        {/* CONSOLE */}
        {activeTab === 'console' && (
          <div className="flex flex-col gap-1">
            {isRunning && (
              <div className="flex items-center gap-2 text-amber-500">
                <div className="vs-loader-sm border-t-amber-500" />
                Executing {language?.toUpperCase()}…
              </div>
            )}
            {!isRunning && !terminalOutput && (
              <span className="text-zinc-500 italic">Press Run to execute your {language?.toUpperCase()} code.</span>
            )}
            {terminalOutput?.error && (
              <div className="text-red-300 whitespace-pre-wrap">✖ {terminalOutput.error}</div>
            )}
            {terminalOutput?.stderr && (
              <div className="text-red-500 whitespace-pre-wrap">{terminalOutput.stderr}</div>
            )}
            {terminalOutput?.stdout && (
              <div className="text-emerald-300 whitespace-pre-wrap">{terminalOutput.stdout}</div>
            )}
            {terminalOutput && (
              <div className="flex gap-4 mt-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-500">
                {terminalOutput.exitCode !== null && (
                  <span className={terminalOutput.exitCode === 0 ? 'text-emerald-500' : 'text-red-500'}>
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
          <span className="text-zinc-500 italic">No problems detected.</span>
        )}

        {/* ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="flex flex-col gap-1.5">
            {activityLog.length === 0 && (
              <span className="text-zinc-500 italic">Collaboration activity will appear here…</span>
            )}
            {activityLog.map((ev, idx) => {
              const cfg = ACTIVITY_ICONS[ev.type] || ACTIVITY_ICONS.cursor;
              return (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className="text-zinc-600 shrink-0 w-14">{fmt(ev.timestamp)}</span>
                  <span className="shrink-0 w-3.5 text-center" style={{ color: cfg.color }}>{cfg.icon}</span>
                  <span className="text-zinc-400">
                    <span className="text-cyan-400 font-semibold">{ev.user}</span>
                    {ev.type === 'join'   && ' joined the room'}
                    {ev.type === 'leave'  && ' left the room'}
                    {ev.type === 'change' && (
                      <> changed <span className="font-mono bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded ml-1">L{ev.fromLine}–L{ev.toLine}</span></>
                    )}
                    {ev.type === 'cursor' && (
                      <> moved to <span className="text-amber-500 ml-1">L{ev.line}</span></>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* TERMINAL */}
        {activeTab === 'terminal' && (
          <span className="text-zinc-500 italic">
            <span className="text-emerald-500">$</span> Interactive terminal not available in collaborative mode.
          </span>
        )}

        {/* PREVIEW — HTML/CSS output */}
        {activeTab === 'preview' && previewContent && (
          <iframe
            srcDoc={previewContent}
            sandbox="allow-scripts"
            className="w-full h-full border-none rounded-md bg-white"
            title="HTML/CSS Preview"
          />
        )}
      </div>
    </div>
  );
};

export default Terminal;
