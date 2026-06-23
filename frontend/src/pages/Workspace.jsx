import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { useCollaboration } from '../hooks/useCollaboration';
import { useCodeExecution } from '../hooks/useCodeExecution';
import ActivityBar from '../components/workspace/ActivityBar';
import Sidebar from '../components/workspace/Sidebar';
import Terminal from '../components/workspace/Terminal';
import StatusBar from '../components/workspace/StatusBar';
import SettingsModal from '../components/workspace/SettingsModal';

// ─── Avatar colours (must match Sidebar) ───────────────────
const AVATAR_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
const getColor  = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];
const getShort  = (email) => (email?.split('@')[0] || 'U').substring(0, 2).toUpperCase();
const getDisplay = (email) => email?.split('@')[0] || email;

const FILE_TABS = [
  { name: 'Main.java', ext: 'java', modified: true },
];

const EXT_COLOR = { java:'#f89820', js:'#f7df1e', jsx:'#61dafb', xml:'#ef4444', ts:'#3178c6', css:'#38bdf8', html:'#e44d26', py:'#3572a5' };

// Custom Monaco theme definitions
const CUSTOM_THEMES = {
  dracula: {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'comment',        foreground: '6272a4', fontStyle: 'italic' },
      { token: 'keyword',        foreground: 'ff79c6' },
      { token: 'string',         foreground: 'f1fa8c' },
      { token: 'number',         foreground: 'bd93f9' },
      { token: 'type',           foreground: '8be9fd', fontStyle: 'italic' },
      { token: 'function',       foreground: '50fa7b' },
      { token: 'variable',       foreground: 'f8f8f2' },
      { token: 'delimiter',      foreground: 'ff79c6' },
    ],
    colors: {
      'editor.background':           '#282a36',
      'editor.foreground':           '#f8f8f2',
      'editorLineNumber.foreground': '#6272a4',
      'editorCursor.foreground':     '#f8f8f0',
      'editor.selectionBackground':  '#44475a',
      'editor.lineHighlightBackground': '#44475a55',
      'editorGutter.background':     '#282a36',
      'scrollbarSlider.background':  '#44475a99',
    },
  },
  monokai: {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'comment',        foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword',        foreground: 'f92672' },
      { token: 'string',         foreground: 'e6db74' },
      { token: 'number',         foreground: 'ae81ff' },
      { token: 'type',           foreground: '66d9e8', fontStyle: 'italic' },
      { token: 'function',       foreground: 'a6e22e' },
      { token: 'variable',       foreground: 'f8f8f2' },
      { token: 'delimiter',      foreground: 'f92672' },
    ],
    colors: {
      'editor.background':           '#272822',
      'editor.foreground':           '#f8f8f2',
      'editorLineNumber.foreground': '#75715e',
      'editorCursor.foreground':     '#f8f8f0',
      'editor.selectionBackground':  '#49483e',
      'editor.lineHighlightBackground': '#3e3d3255',
      'editorGutter.background':     '#272822',
      'scrollbarSlider.background':  '#49483e99',
    },
  },
  'github-dark': {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'comment',        foreground: '8b949e', fontStyle: 'italic' },
      { token: 'keyword',        foreground: 'ff7b72' },
      { token: 'string',         foreground: 'a5d6ff' },
      { token: 'number',         foreground: '79c0ff' },
      { token: 'type',           foreground: 'ffa657' },
      { token: 'function',       foreground: 'd2a8ff' },
      { token: 'variable',       foreground: 'c9d1d9' },
      { token: 'delimiter',      foreground: 'c9d1d9' },
    ],
    colors: {
      'editor.background':           '#0d1117',
      'editor.foreground':           '#c9d1d9',
      'editorLineNumber.foreground': '#6e7681',
      'editorCursor.foreground':     '#c9d1d9',
      'editor.selectionBackground':  '#388bfd33',
      'editor.lineHighlightBackground': '#161b2255',
      'editorGutter.background':     '#0d1117',
      'scrollbarSlider.background':  '#6e768199',
    },
  },
  nord: {
    base: 'vs-dark', inherit: true,
    rules: [
      { token: 'comment',        foreground: '616e88', fontStyle: 'italic' },
      { token: 'keyword',        foreground: '81a1c1' },
      { token: 'string',         foreground: 'a3be8c' },
      { token: 'number',         foreground: 'b48ead' },
      { token: 'type',           foreground: '8fbcbb' },
      { token: 'function',       foreground: '88c0d0' },
      { token: 'variable',       foreground: 'd8dee9' },
      { token: 'delimiter',      foreground: 'eceff4' },
    ],
    colors: {
      'editor.background':           '#2e3440',
      'editor.foreground':           '#d8dee9',
      'editorLineNumber.foreground': '#4c566a',
      'editorCursor.foreground':     '#d8dee9',
      'editor.selectionBackground':  '#434c5e',
      'editor.lineHighlightBackground': '#3b424e55',
      'editorGutter.background':     '#2e3440',
      'scrollbarSlider.background':  '#434c5e99',
    },
  },
};

const Workspace = () => {
  const { roomId }   = useParams();
  const location     = useLocation();
  const { userEmail, token } = useAuth();

  const [roomName]   = useState(location.state?.roomName || 'Workspace');
  const [roomCode]   = useState(location.state?.roomCode || '');
  const [language, setLanguage] = useState('java');
  const [editorLine, setEditorLine] = useState(1);
  const [editorCol,  setEditorCol]  = useState(1);

  // Sidebar panel: 'files' | 'search' | 'users' | null
  const [activeSidePanel, setActiveSidePanel] = useState('files');

  // Settings
  const [showSettings, setShowSettings]   = useState(false);
  const [fontSize,     setFontSize]       = useState(14);
  const [currentTheme, setCurrentTheme]   = useState('vs-dark');
  const [showMinimap,  setShowMinimap]    = useState(true);
  const [wordWrap,     setWordWrap]       = useState('off');
  const [smoothScroll, setSmoothScroll]   = useState(true);

  // Activity log
  const [activityLog, setActivityLog] = useState([]);
  const lastChangeRef    = useRef({ user: null, fromLine: null, toLine: null });
  const changeDebounceRef = useRef(null);  // debounce timer

  const pushActivity = useCallback((event) => {
    setActivityLog(prev => [...prev.slice(-199), { ...event, timestamp: Date.now() }]);
  }, []);

  const {
    isRunning, showTerminal, setShowTerminal, terminalOutput, activeTab, setActiveTab,
    previewContent, handleRunCode, handleExecutionMessage, clearTerminal,
  } = useCodeExecution(roomId);

  // Wire collaboration — augment handleIncomingMessage to emit activity events
  const handleCollabMessage = useCallback((msg) => {
    handleExecutionMessage(msg);
    if (msg.messageType === 'JOIN') {
      pushActivity({ type: 'join', user: getDisplay(msg.creator) });
    } else if (msg.messageType === 'LEFT') {
      pushActivity({ type: 'leave', user: getDisplay(msg.creator) });
    }
  }, [handleExecutionMessage, pushActivity]);

  const { members, connectionStatus, bindEditor, getCurrentCode } = useCollaboration(
    roomId, userEmail, token, handleCollabMessage,
  );

  const editorRef = useRef(null);
  const monaco = useMonaco();

  // Register all custom themes once Monaco is ready
  useEffect(() => {
    if (!monaco) return;
    Object.entries(CUSTOM_THEMES).forEach(([id, def]) => {
      monaco.editor.defineTheme(id, def);
    });
    // Apply current theme immediately after registration
    monaco.editor.setTheme(currentTheme);
  }, [monaco]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reactively apply theme whenever user switches it
  useEffect(() => {
    if (!monaco) return;
    monaco.editor.setTheme(currentTheme);
  }, [monaco, currentTheme]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e) => {
      setEditorLine(e.position.lineNumber);
      setEditorCol(e.position.column);
    });

    // Debounced activity: fires 1.5s after user STOPS typing
    editor.onDidChangeModelContent((e) => {
      if (e.changes.length === 0) return;
      const minLine = Math.min(...e.changes.map(c => c.range.startLineNumber));
      const maxLine = Math.max(...e.changes.map(c =>
        c.range.endLineNumber + (c.text.split('\n').length - 1)
      ));
      // Clear previous debounce timer
      if (changeDebounceRef.current) clearTimeout(changeDebounceRef.current);
      // Store pending range
      lastChangeRef.current = { fromLine: minLine, toLine: Math.max(minLine, maxLine) };
      // Only push after 1500ms of no typing
      changeDebounceRef.current = setTimeout(() => {
        const { fromLine, toLine } = lastChangeRef.current;
        pushActivity({ type: 'change', user: getDisplay(userEmail), fromLine, toLine });
      }, 1500);
    });

    bindEditor(editor);
  };

  const applyTheme = (themeId) => {
    setCurrentTheme(themeId);
  };

  const langExt = { javascript:'js', java:'java', html:'html', css:'css', python:'py' };

  return (
    <div
      style={{
        height: '100vh', width: '100vw', overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: `48px ${activeSidePanel ? '260px' : '0px'} 1fr`,
        gridTemplateRows: '40px 1fr 22px',
        gridTemplateAreas: `
          "nav nav nav"
          "act side main"
          "status status status"
        `,
        background: 'var(--theme-bg)',
        transition: 'grid-template-columns .2s',
      }}
    >
      {/* ══ TOP NAVBAR ══ */}
      <header style={{
        gridArea: 'nav',
        display: 'flex', alignItems: 'center',
        background: '#252526', borderBottom: '1px solid #2d2d2d',
        zIndex: 30, overflow: 'hidden', userSelect: 'none',
      }}>
        {/* Brand icon */}
        <div style={{ width: 48, flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #2d2d2d' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#6366f1"/>
            <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#6366f1" opacity=".7"/>
            <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#6366f1" opacity=".7"/>
            <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#6366f1" opacity=".4"/>
          </svg>
        </div>

        {/* Brand name */}
        <span style={{ padding: '0 12px', fontSize: 13, fontWeight: 700, color: '#e1e1e1', flexShrink: 0, letterSpacing: '-0.3px' }}>CodeCollab</span>

        {/* File Tabs */}
        <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', flex: 1, overflow: 'hidden', borderLeft: '1px solid #2d2d2d' }}>
          {FILE_TABS.map((tab, i) => {
            const isActive = i === 0;
            return (
              <div
                key={tab.name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0 16px', cursor: 'pointer', flexShrink: 0,
                  borderRight: '1px solid #2d2d2d', fontSize: 12,
                  background: isActive ? '#1e1e1e' : 'transparent',
                  color: isActive ? '#e1e1e1' : '#858585',
                  borderTop: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 4px', borderRadius: 3, background: EXT_COLOR[tab.ext] || '#555', color: tab.ext === 'js' ? '#000' : '#fff', flexShrink: 0 }}>
                  {tab.ext.toUpperCase().slice(0, 2)}
                </span>
                {tab.name}
                {tab.modified && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', flexShrink: 0, height: '100%' }}>
          {/* Room badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: '#0c0d10', border: '1px solid #2d2d2d', fontFamily: "'Fira Code',monospace", fontSize: 11, fontWeight: 600, color: '#22d3ee', whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
            Room: {roomCode || '------'}
          </div>

          {/* User avatars */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div title={userEmail} style={{ width: 24, height: 24, borderRadius: '50%', background: getColor(0), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', border: '2px solid #252526', marginLeft: -4, flexShrink: 0 }}>
              {getShort(userEmail)}
            </div>
            {members.filter(m => m !== userEmail).slice(0, 4).map((email, idx) => (
              <div key={idx} title={email} style={{ width: 24, height: 24, borderRadius: '50%', background: getColor(idx + 1), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', border: '2px solid #252526', marginLeft: -4, flexShrink: 0 }}>
                {getShort(email)}
              </div>
            ))}
          </div>

          {/* Lang selector */}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{ background: '#0c0d10', color: '#e1e1e1', border: '1px solid #2d2d2d', borderRadius: 6, padding: '4px 8px', fontSize: 12, outline: 'none', cursor: 'pointer' }}
          >
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
          </select>

          {/* Run button */}
          <button
            onClick={() => handleRunCode(language, getCurrentCode())}
            disabled={isRunning}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 7, border: 'none', background: isRunning ? '#3d3d3d' : '#22c55e', color: isRunning ? '#858585' : '#fff', fontSize: 12, fontWeight: 600, cursor: isRunning ? 'not-allowed' : 'pointer', flexShrink: 0 }}
          >
            {isRunning
              ? <div className="vs-loader-sm" style={{ width: 10, height: 10, borderWidth: 1.5 }} />
              : <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            }
            {isRunning ? 'Running…' : 'Run'}
          </button>
        </div>
      </header>

      {/* ══════════════════ ACTIVITY BAR ══════════════════ */}
      <ActivityBar
        activeSidePanel={activeSidePanel}
        setActiveSidePanel={setActiveSidePanel}
        onSettingsClick={() => setShowSettings(true)}
      />

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      <Sidebar
        roomName={roomName}
        roomCode={roomCode}
        members={members}
        userEmail={userEmail}
        activeSidePanel={activeSidePanel}
      />

      {/* ══════════════════ MAIN EDITOR AREA ══════════════════ */}
      <main
        style={{ gridArea: 'main', background: 'var(--theme-surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Editor toolbar */}
        <div style={{ height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', background: '#252526', borderBottom: '1px solid #2d2d2d', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[['Undo','undo'], ['Redo','redo']].map(([label, cmd]) => (
              <button key={label}
                onClick={() => editorRef.current?.trigger('toolbar', cmd, {})}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#858585' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e1e1e1'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#858585'; }}
              >{label}</button>
            ))}
            <div style={{ width: 1, height: 16, background: '#3d3d3d', margin: '0 4px' }} />
            <button
              onClick={() => setShowTerminal(s => !s)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: showTerminal ? '#818cf8' : '#858585' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >Panel</button>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#858585' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e1e1e1'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#858585'; }}
            >Split</button>
            <button
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#858585' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#e1e1e1'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#858585'; }}
            >Diff</button>
          </div>
          <span style={{ fontSize: 11, color: '#858585' }}>Spaces: 4</span>
        </div>

        {/* Monaco Editor */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <MonacoEditor
            height="100%"
            language={language}
            onMount={handleEditorDidMount}
            options={{
              selectOnLineNumbers: true,
              automaticLayout: true,
              fontSize,
              minimap: { enabled: showMinimap },
              cursorBlinking: 'smooth',
              smoothScrolling: smoothScroll,
              wordWrap: wordWrap,
              fontFamily: "'Fira Code', Consolas, monospace",
              fontLigatures: true,
              renderLineHighlight: 'all',
              lineNumbers: 'on',
              padding: { top: 12 },
            }}
          />
        </div>

        {/* Terminal/Output panel */}
        {showTerminal && (
          <Terminal
            language={language}
            isRunning={isRunning}
            terminalOutput={terminalOutput}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            previewContent={previewContent}
            clearTerminal={clearTerminal}
            setShowTerminal={setShowTerminal}
            activityLog={activityLog}
          />
        )}
      </main>

      {/* ══════════════════ STATUS BAR ══════════════════ */}
      <div style={{ gridArea: 'status' }}>
        <StatusBar
          connectionStatus={connectionStatus}
          roomCode={roomCode}
          editorLine={editorLine}
          editorCol={editorCol}
          language={language}
        />
      </div>

      {/* ══════════════════ SETTINGS MODAL ══════════════════ */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          fontSize={fontSize}
          setFontSize={setFontSize}
          currentTheme={currentTheme}
          setTheme={applyTheme}
          showMinimap={showMinimap}
          setShowMinimap={setShowMinimap}
          wordWrap={wordWrap}
          setWordWrap={setWordWrap}
          smoothScroll={smoothScroll}
          setSmoothScroll={setSmoothScroll}
          editorRef={editorRef}
        />
      )}
    </div>
  );
};

export default Workspace;
