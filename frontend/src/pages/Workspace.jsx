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
  const [language, setLanguage] = useState('javascript');
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

  const { members, connectionStatus, bindEditor, getAllFiles, fileNames, createFile } = useCollaboration(
    roomId, userEmail, token, handleCollabMessage,
  );

  const [openTabs, setOpenTabs] = useState([{ name: 'index.js', ext: 'js', modified: false }]);
  const [activeFile, setActiveFile] = useState('index.js');

  const handleOpenFile = (name) => {
    if (!openTabs.find(t => t.name === name)) {
      setOpenTabs(prev => [...prev, { name, ext: name.split('.').pop(), modified: false }]);
    }
    setActiveFile(name);
  };

  const handleCloseTab = (e, name) => {
    e.stopPropagation();
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t.name !== name);
      if (activeFile === name) {
        if (newTabs.length > 0) {
          setActiveFile(newTabs[newTabs.length - 1].name);
        } else {
          setActiveFile(null);
        }
      }
      return newTabs;
    });
  };

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

  const activeFileRef = useRef(activeFile);
  activeFileRef.current = activeFile; // Update synchronously during render

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    editor.onDidChangeModel(() => {
      bindEditor(editor, activeFileRef.current);
    });

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

    bindEditor(editor, activeFileRef.current);
  };

  const applyTheme = (themeId) => {
    setCurrentTheme(themeId);
  };

  const langExt = { javascript:'js', java:'java', html:'html', css:'css', python:'py' };

  return (
    <div
      className="h-screen w-screen overflow-hidden grid transition-[grid-template-columns] duration-200 bg-zinc-950"
      style={{
        gridTemplateColumns: `48px ${activeSidePanel ? '260px' : '0px'} 1fr`,
        gridTemplateRows: '40px 1fr 22px',
        gridTemplateAreas: `
          "nav nav nav"
          "act side main"
          "status status status"
        `,
      }}
    >
      {/* ══ TOP NAVBAR ══ */}
      {/* ══ TOP NAVBAR ══ */}
      <header className="flex items-center bg-zinc-900 border-b border-zinc-800 z-30 overflow-hidden select-none" style={{ gridArea: 'nav' }}>
        {/* Brand icon */}
        <div className="w-12 shrink-0 h-full flex items-center justify-center border-r border-zinc-800">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#6366f1"/>
            <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#6366f1" opacity=".7"/>
            <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#6366f1" opacity=".7"/>
            <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#6366f1" opacity=".4"/>
          </svg>
        </div>

        {/* Brand name */}
        <span className="px-3 text-[13px] font-bold text-zinc-300 shrink-0 tracking-tight">CBC</span>

        {/* File Tabs */}
        <div className="flex items-stretch h-full flex-1 overflow-hidden border-l border-zinc-800">
          {openTabs.map((tab) => {
            const isActive = tab.name === activeFile;
            return (
              <div
                key={tab.name}
                onClick={() => setActiveFile(tab.name)}
                className={`group flex items-center gap-2 pl-4 pr-2 cursor-pointer shrink-0 border-r border-zinc-800 text-xs border-t-2 transition-colors ${isActive ? 'bg-zinc-950 text-zinc-100 border-indigo-500' : 'bg-transparent text-zinc-500 border-transparent hover:bg-white/5'}`}
              >
                <span className="text-[9px] font-bold px-1 py-0.5 rounded-[3px] shrink-0" style={{ background: EXT_COLOR[tab.ext] || '#555', color: tab.ext === 'js' ? '#000' : '#fff' }}>
                  {tab.ext?.toUpperCase().slice(0, 2)}
                </span>
                {tab.name}
                {tab.modified ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mx-1.5" />
                ) : (
                  <button
                    onClick={(e) => handleCloseTab(e, tab.name)}
                    className={`ml-1 w-5 h-5 rounded flex items-center justify-center border-none bg-transparent cursor-pointer hover:bg-white/10 ${isActive ? 'text-zinc-300' : 'text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity'}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2.5 px-3 shrink-0 h-full">
          {/* Room badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px] font-semibold text-cyan-400 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Room: {roomCode || '------'}
          </div>

          {/* User avatars */}
          <div className="flex items-center">
            <div title={userEmail} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-zinc-900 -ml-1 shrink-0" style={{ background: getColor(0) }}>
              {getShort(userEmail)}
            </div>
            {members.filter(m => m !== userEmail).slice(0, 4).map((email, idx) => (
              <div key={idx} title={email} className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-zinc-900 -ml-1 shrink-0" style={{ background: getColor(idx + 1) }}>
                {getShort(email)}
              </div>
            ))}
          </div>

          {/* Lang selector */}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="bg-zinc-950 text-zinc-300 border border-zinc-800 rounded-md px-2 py-1 text-xs outline-none cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
          </select>

          {/* Run button */}
          <button
            onClick={() => {
                const currentCode = getAllFiles()[activeFile] || '';
                handleRunCode(language, currentCode, getAllFiles());
            }}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border-none text-xs font-semibold shrink-0 ${isRunning ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600'}`}
          >
            {isRunning
              ? <div className="vs-loader-sm border-t-zinc-500" />
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
        onFileOpen={handleOpenFile}
        fileNames={fileNames}
        onCreateFile={createFile}
      />

      {/* ══════════════════ MAIN EDITOR AREA ══════════════════ */}
      <main
        className="flex flex-col overflow-hidden bg-zinc-950" style={{ gridArea: 'main' }}
      >
        {/* Editor toolbar */}
        <div className="h-8 flex items-center justify-between px-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-0.5">
            {[['Undo','undo'], ['Redo','redo']].map(([label, cmd]) => (
              <button key={label}
                onClick={() => editorRef.current?.trigger('toolbar', cmd, {})}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-transparent border-none cursor-pointer text-xs text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
              >{label}</button>
            ))}
            <div className="w-px h-4 bg-zinc-700 mx-1" />
            <button
              onClick={() => setShowTerminal(s => !s)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded bg-transparent border-none cursor-pointer text-xs hover:bg-white/10 ${showTerminal ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >Panel</button>
            <button
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-transparent border-none cursor-pointer text-xs text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
            >Split</button>
            <button
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-transparent border-none cursor-pointer text-xs text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
            >Diff</button>
          </div>
          <span className="text-[11px] text-zinc-500">Spaces: 4</span>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0 relative">
          {activeFile ? (
            <MonacoEditor
              height="100%"
              language={language}
              path={activeFile}
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
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-950">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <p className="text-sm">Select a file to edit</p>
            </div>
          )}
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
