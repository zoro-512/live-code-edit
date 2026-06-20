import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { useCollaboration } from '../hooks/useCollaboration';
import { useCodeExecution } from '../hooks/useCodeExecution';
import ActivityBar from '../components/workspace/ActivityBar';
import Sidebar from '../components/workspace/Sidebar';
import Terminal from '../components/workspace/Terminal';
import StatusBar from '../components/workspace/StatusBar';

const Workspace = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const { userEmail, token } = useAuth();

    const [roomName] = useState(location.state?.roomName || 'Workspace');
    const [roomCode] = useState(location.state?.roomCode || '');
    const [language, setLanguage] = useState('java');
    const [editorLine, setEditorLine] = useState(1);
    const [editorCol, setEditorCol] = useState(1);

    const {
        isRunning, showTerminal, setShowTerminal, terminalOutput, activeTab, setActiveTab,
        previewContent, handleRunCode, handleExecutionMessage, clearTerminal
    } = useCodeExecution(roomId);

    const { members, connectionStatus, bindEditor, getCurrentCode } = useCollaboration(roomId, userEmail, token, handleExecutionMessage);

    const handleEditorDidMount = (editor) => {
        editor.onDidChangeCursorPosition((e) => {
            setEditorLine(e.position.lineNumber);
            setEditorCol(e.position.column);
        });
        bindEditor(editor);
    };

    return (
        <div className="vs-app-layout">
            <ActivityBar />

            <Sidebar 
                roomName={roomName} 
                roomCode={roomCode} 
                members={members} 
                userEmail={userEmail} 
            />

            <main className="vs-main-workspace-view">
                <div className="tab-container-header">
                    <div className="active-tab">
                        <span>main.{language === 'javascript' ? 'js' : language === 'java' ? 'java' : language === 'html' ? 'html' : 'txt'}</span>
                    </div>
                    <div className="tab-actions">
                        <button 
                            onClick={() => setShowTerminal(!showTerminal)} 
                            className={`vs-terminal-toggle-btn ${showTerminal ? 'active' : ''}`}
                            title="Toggle Output Panel"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <line x1="3" y1="15" x2="21" y2="15"/>
                            </svg>
                        </button>

                        {(['java', 'javascript', 'html', 'css'].includes(language)) && (
                            <button 
                                onClick={() => handleRunCode(language, getCurrentCode())} 
                                disabled={isRunning} 
                                className="vs-run-btn"
                                title={`Run ${language.toUpperCase()} Program`}
                            >
                                {isRunning ? (
                                    <div className="vs-loader-sm" />
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                )}
                                <span>{isRunning ? 'Running...' : 'Run'}</span>
                            </button>
                        )}

                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)} 
                            className="vs-lang-selector"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                        </select>
                    </div>
                </div>

                <div className="monaco-editor-pane">
                    <MonacoEditor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        onMount={handleEditorDidMount}
                        options={{
                            selectOnLineNumbers: true,
                            automaticLayout: true,
                            fontSize: 14,
                            minimap: { enabled: true },
                            cursorBlinking: 'smooth',
                            smoothScrolling: true,
                            fontFamily: "'Fira Code', Consolas, monospace"
                        }}
                    />
                </div>

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
                    />
                )}
            </main>

            <StatusBar 
                connectionStatus={connectionStatus} 
                roomCode={roomCode} 
                editorLine={editorLine} 
                editorCol={editorCol} 
                language={language} 
            />
        </div>
    );
};

export default Workspace;
