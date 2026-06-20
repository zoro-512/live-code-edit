import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { useAuth, api, API_BASE_URL } from '../context/AuthContext';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';


const uint8ArrayToBase64 = (arr) => {
    let binary = '';
    const len = arr.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(arr[i]);
    }
    return window.btoa(binary);
};

const base64ToUint8Array = (base64) => {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const Workspace = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { userEmail, token, logout } = useAuth();

    
    const [roomName, setRoomName] = useState(location.state?.roomName || 'Workspace');
    const [roomCode, setRoomCode] = useState(location.state?.roomCode || '');

    
    const [members, setMembers] = useState([]);
    const [language, setLanguage] = useState('java');
    const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
    const [editorLine, setEditorLine] = useState(1);
    const [editorCol, setEditorCol] = useState(1);

    
    const [copied, setCopied] = useState(false);

    
    const [isRunning, setIsRunning] = useState(false);
    const [showTerminal, setShowTerminal] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState(null);
    const [activeTab, setActiveTab] = useState('console'); 
    const [previewContent, setPreviewContent] = useState('');

    
    const stompClientRef = useRef(null);
    
    
    const yDocRef = useRef(new Y.Doc());
    const yTextRef = useRef(yDocRef.current.getText('monaco'));
    const monacoBindingRef = useRef(null);
    const hasSyncedRef = useRef(false);
    const syncTimeoutRef = useRef(null);
    const editorRef = useRef(null);

    
    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        
        const handleYjsUpdate = (update, origin) => {
            if (origin !== 'websocket-update' && origin !== 'websocket-sync') {
                const base64Update = uint8ArrayToBase64(update);
                const updateMessage = {
                    roomId: roomId,
                    creator: userEmail,
                    content: base64Update,
                    messageType: 'YJS_UPDATE'
                };
                const client = stompClientRef.current;
                if (client && client.connected) {
                    client.send('/app/chat.send', {}, JSON.stringify(updateMessage));
                }
            }
        };

        yDocRef.current.on('update', handleYjsUpdate);

        
        const handleTextObserve = () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                const plainText = yTextRef.current.toString();
                api.post(`/room/${roomId}/save`, { code: plainText })
                    .catch(err => console.error('Failed to auto-save code:', err));
            }, 2000); 
        };
        yTextRef.current.observe(handleTextObserve);

        
        if (!roomCode) {
            api.get('/room/myRooms')
                .then(response => {
                    const currentRoom = response.data?.find(r => r.id === parseInt(roomId));
                    if (currentRoom) {
                        setRoomName(currentRoom.roomName);
                        setRoomCode(currentRoom.roomCode);
                    }
                })
                .catch(err => console.error('Failed to load room details:', err));
        }

        
        connectWebSocket();

        
        return () => {
            yDocRef.current.off('update', handleYjsUpdate);
            yTextRef.current.unobserve(handleTextObserve);
            disconnectWebSocket();
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            if (monacoBindingRef.current) {
                monacoBindingRef.current.destroy();
            }
        };
    }, [roomId]);

    const connectWebSocket = () => {
        setConnectionStatus('CONNECTING');
        
        
        const socket = new SockJS(`${API_BASE_URL}/ws`);
        const client = Stomp.over(socket);
        stompClientRef.current = client;

        
        client.debug = (str) => {
            console.log('[STOMP Debug] ' + str);
        };

        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        client.connect(headers, (frame) => {
            setConnectionStatus('CONNECTED');
            
            
            const topic = `/topic/room/${roomId}`;
            client.subscribe(topic, (messageOutput) => {
                try {
                    const message = JSON.parse(messageOutput.body);
                    handleIncomingMessage(message);
                } catch (e) {
                    console.error('Failed to parse incoming WS message:', e);
                }
            });

            
            const joinMessage = {
                roomId: roomId,
                creator: userEmail,
                content: `${userEmail} joined the session.`,
                messageType: 'JOIN'
            };
            client.send('/app/chat.send', {}, JSON.stringify(joinMessage));

            
            const syncRequest = {
                roomId: roomId,
                creator: userEmail,
                content: '',
                messageType: 'YJS_SYNC_REQUEST'
            };
            client.send('/app/chat.send', {}, JSON.stringify(syncRequest));

            
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(() => {
                if (!hasSyncedRef.current) {
                    console.log('No peer response. Initializing Yjs text state from DB...');
                    api.get(`/room/${roomId}/code`)
                        .then(response => {
                            if (!hasSyncedRef.current) {
                                if (response.data) {
                                    yTextRef.current.insert(0, response.data);
                                } else {
                                    yTextRef.current.insert(0, 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}');
                                }
                                hasSyncedRef.current = true;
                            }
                        })
                        .catch(err => {
                            console.error('Failed to fetch DB fallback state:', err);
                            if (!hasSyncedRef.current) {
                                yTextRef.current.insert(0, 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}');
                                hasSyncedRef.current = true;
                            }
                        });
                }
            }, 1500);

        }, (error) => {
            setConnectionStatus('DISCONNECTED');
            console.error('STOMP connection failed:', error);
        });
    };

    const disconnectWebSocket = () => {
        const client = stompClientRef.current;
        if (client && client.connected) {
            
            const leftMessage = {
                roomId: roomId,
                creator: userEmail,
                content: `${userEmail} left the session.`,
                messageType: 'LEFT'
            };
            try {
                client.send('/app/chat.send', {}, JSON.stringify(leftMessage));
                client.disconnect(() => {
                    setConnectionStatus('DISCONNECTED');
                });
            } catch (e) {
                console.error('Failed clean websocket disconnect:', e);
            }
        }
    };

    const handleIncomingMessage = (msg) => {
        if (msg.messageType === 'JOIN') {
            
            setMembers(prev => {
                if (prev.includes(msg.creator)) return prev;
                return [...prev, msg.creator];
            });
        } else if (msg.messageType === 'LEFT') {
            
            setMembers(prev => prev.filter(email => email !== msg.creator));
        } else if (msg.messageType === 'YJS_SYNC_REQUEST') {
            
            if (msg.creator !== userEmail && hasSyncedRef.current) {
                console.log('Received YJS_SYNC_REQUEST. Sending sync response...');
                const stateUpdate = Y.encodeStateAsUpdate(yDocRef.current);
                const base64State = uint8ArrayToBase64(stateUpdate);
                const syncResponse = {
                    roomId: roomId,
                    creator: userEmail,
                    content: base64State,
                    messageType: 'YJS_SYNC_RESPONSE'
                };
                stompClientRef.current.send('/app/chat.send', {}, JSON.stringify(syncResponse));
            }
        } else if (msg.messageType === 'YJS_SYNC_RESPONSE') {
            
            if (!hasSyncedRef.current) {
                console.log('Received YJS_SYNC_RESPONSE. Applying state update...');
                if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                const update = base64ToUint8Array(msg.content);
                Y.applyUpdate(yDocRef.current, update, 'websocket-sync');
                hasSyncedRef.current = true;
            }
        } else if (msg.messageType === 'YJS_UPDATE') {
            
            if (msg.creator !== userEmail) {
                const update = base64ToUint8Array(msg.content);
                Y.applyUpdate(yDocRef.current, update, 'websocket-update');
            }
        } else if (msg.messageType === 'EXECUTION_START') {
            setIsRunning(true);
            setShowTerminal(true);
            setTerminalOutput(null);
        } else if (msg.messageType === 'EXECUTION_RESULT') {
            setIsRunning(false);
            setShowTerminal(true);
            try {
                const result = JSON.parse(msg.content);
                setTerminalOutput({
                    stdout: result.stdout || '',
                    stderr: result.stderr || '',
                    exitCode: result.exitCode,
                    executionTime: result.executionTime,
                    error: null
                });
            } catch (e) {
                setTerminalOutput({
                    stdout: '',
                    stderr: '',
                    exitCode: null,
                    executionTime: null,
                    error: 'Error parsing execution result: ' + msg.content
                });
            }
        }
    };

    
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        
        editor.onDidChangeCursorPosition((e) => {
            setEditorLine(e.position.lineNumber);
            setEditorCol(e.position.column);
        });

        
        if (yTextRef.current) {
            if (monacoBindingRef.current) {
                monacoBindingRef.current.destroy();
            }
            monacoBindingRef.current = new MonacoBinding(
                yTextRef.current,
                editor.getModel(),
                new Set([editor])
            );
        }
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const runJavaScriptLocal = (code) => {
        const startTime = Date.now();
        const logs = [];
        const errors = [];

        // Create a sandboxed iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.sandbox = 'allow-scripts';
        document.body.appendChild(iframe);

        const iframeSrc = `
            <!DOCTYPE html>
            <html>
            <body>
            <script>
                const customConsole = {
                    log: (...args) => {
                        const str = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                        window.parent.postMessage({ type: 'JS_CONSOLE_LOG', data: str }, '*');
                    },
                    error: (...args) => {
                        const str = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                        window.parent.postMessage({ type: 'JS_CONSOLE_ERROR', data: str }, '*');
                    }
                };
                window.console = { ...window.console, ...customConsole };
                window.onerror = (message, source, lineno, colno, error) => {
                    window.parent.postMessage({ type: 'JS_CONSOLE_ERROR', data: message + " (Line " + lineno + ")" }, '*');
                    return true;
                };
                try {
                    ${code}
                } catch (e) {
                    window.parent.postMessage({ type: 'JS_CONSOLE_ERROR', data: e.message }, '*');
                }
                // Signal that synchronous execution is done
                window.parent.postMessage({ type: 'JS_DONE' }, '*');
            <\/script>
            </body>
            </html>
        `;

        let finished = false;
        const cleanup = () => {
            if (finished) return;
            finished = true;
            window.removeEventListener('message', handleIframeMessage);
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
            setTerminalOutput({
                stdout: logs.join('\n'),
                stderr: errors.join('\n'),
                exitCode: errors.length > 0 ? 1 : 0,
                executionTime: Date.now() - startTime,
                error: null
            });
            setIsRunning(false);
        };

        const handleIframeMessage = (event) => {
            if (event.data?.type === 'JS_CONSOLE_LOG') {
                logs.push(event.data.data);
            } else if (event.data?.type === 'JS_CONSOLE_ERROR') {
                errors.push(event.data.data);
            } else if (event.data?.type === 'JS_DONE') {
                // Give a short grace period for any queued microtasks/macrotasks
                setTimeout(cleanup, 100);
            }
        };

        window.addEventListener('message', handleIframeMessage);
        iframe.srcdoc = iframeSrc;

        // Hard fallback: if JS_DONE is never received (e.g. infinite loop), cut off after 5s
        setTimeout(cleanup, 5000);
    };

    const runHtmlLocal = (code) => {
        setPreviewContent(code);
        setActiveTab('preview');
        setTerminalOutput(null);
        setTimeout(() => {
            setIsRunning(false);
        }, 300);
    };

    const runCssLocal = (code) => {
        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    ${code}
                </style>
            </head>
            <body style="background:#1e1e1e; color:#cccccc; font-family: sans-serif; padding: 20px;">
                <h1 style="color:#ffffff; border-bottom:1px solid #333; padding-bottom:10px;">CSS Preview Sandbox</h1>
                <p>This paragraph is styled by the CSS editor code above.</p>
                <div class="box" style="margin:20px 0; padding:15px; border:1px dashed #666; display:inline-block;">
                    Class: <code style="color:#f89820">.box</code>
                </div>
                <br />
                <button class="btn" style="padding:6px 12px; cursor:pointer;">
                    Class: <code style="color:#f89820">.btn</code>
                </button>
            </body>
            </html>
        `;
        setPreviewContent(fullHtml);
        setActiveTab('preview');
        setTerminalOutput(null);
        setTimeout(() => {
            setIsRunning(false);
        }, 300);
    };

    const handleRunCode = async () => {
        const currentCode = yTextRef.current.toString();
        setIsRunning(true);
        setShowTerminal(true);
        setTerminalOutput(null);

        if (language === 'javascript') {
            runJavaScriptLocal(currentCode);
        } else if (language === 'html') {
            runHtmlLocal(currentCode);
        } else if (language === 'css') {
            runCssLocal(currentCode);
        } else if (language === 'java') {
            setActiveTab('console');
            try {
                await api.post('/execute/run', {
                    sourceCode: currentCode,
                    language: language,
                    roomId: roomId
                });
            } catch (err) {
                console.error('Code execution failed:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Unknown network error occurred while running code.';
                setTerminalOutput({
                    stdout: '',
                    stderr: '',
                    exitCode: null,
                    executionTime: null,
                    error: `Network Error: ${errorMessage}`
                });
                setIsRunning(false);
            }
        } else {
            setIsRunning(false);
        }
    };

    return (
        <div className="vs-app-layout">
            
            {}
            <aside className="vs-activity-bar">
                <div className="activity-top">
                    <div className="activity-icon" title="Go back to Dashboard" onClick={() => navigate('/dashboard')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                    </div>
                    <div className="activity-icon active" title="Room Workspace">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 3H10V10H3V3Z"/>
                            <path d="M14 3H21V10H14V3Z"/>
                            <path d="M14 14H21V21H14V14Z"/>
                            <path d="M3 14H10V21H3V14Z"/>
                        </svg>
                    </div>
                </div>
                <div className="activity-bottom">
                    <div className="activity-icon" title="Log Out" onClick={() => { logout(); navigate('/'); }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"/>
                            <path d="M16 17L21 12L16 7"/>
                            <path d="M21 12H9"/>
                        </svg>
                    </div>
                </div>
            </aside>

            {}
            <div className="vs-sidebar-panel">
                <div className="sidebar-header">
                    <h3 className="workspace-title">{roomName}</h3>
                </div>

                {}
                <div className="sidebar-section">
                    <div className="section-title">
                        <span className="arrow-icon">▼</span>
                        <h4>ACTIVE USERS ({members.length + 1})</h4>
                    </div>
                    <div className="section-content">
                        <ul className="member-list">
                            {}
                            <li className="member-item me">
                                <div className="member-avatar">ME</div>
                                <div className="member-info">
                                    <span className="member-email">{userEmail}</span>
                                    <span className="member-status">Owner (You)</span>
                                </div>
                            </li>
                            {}
                            {members.filter(m => m !== userEmail).map((email, idx) => (
                                <li key={idx} className="member-item">
                                    <div className="member-avatar">{email.substring(0, 2).toUpperCase()}</div>
                                    <div className="member-info">
                                        <span className="member-email">{email}</span>
                                        <span className="member-status">Online</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {}
                <div className="sidebar-section border-top">
                    <div className="section-title">
                        <span className="arrow-icon">▼</span>
                        <h4>WORKSPACE SECURITY</h4>
                    </div>
                    <div className="section-content">
                        <div className="room-info-card">
                            <span className="info-label">Room Share Code:</span>
                            <div className="copy-code-container">
                                <span className="info-code">{roomCode || '---'}</span>
                                <button className="btn-copy-code" onClick={copyRoomCode}>
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <p className="security-tip">Share this 6-character code with other developers to let them join your coding workspace.</p>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <main className="vs-main-workspace-view">
                
                {}
                <div className="tab-container-header">
                    <div className="active-tab">
                        <span>main.{language === 'javascript' ? 'js' : language === 'java' ? 'java' : language === 'html' ? 'html' : 'txt'}</span>
                    </div>
                    <div className="tab-actions">
                        {}
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

                        {}
                        {(['java', 'javascript', 'html', 'css'].includes(language)) && (
                            <button 
                                onClick={handleRunCode} 
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

                {}
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

                {}
                {showTerminal && (
                    <div className="vs-terminal-pane">
                        <div className="terminal-header">
                            <div className="terminal-tabs" style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    className={`terminal-tab-btn ${activeTab === 'console' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('console')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: activeTab === 'console' ? '#fff' : '#858585',
                                        borderBottom: activeTab === 'console' ? '2px solid var(--primary)' : 'none',
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Console Output
                                </button>
                                {['html', 'css'].includes(language) && (
                                    <button 
                                        className={`terminal-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('preview')}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: activeTab === 'preview' ? '#fff' : '#858585',
                                            borderBottom: activeTab === 'preview' ? '2px solid var(--primary)' : 'none',
                                            cursor: 'pointer',
                                            padding: '4px 8px',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        Web Preview
                                    </button>
                                )}
                            </div>
                            <div className="terminal-actions">
                                <button className="terminal-clear-btn" onClick={() => { setTerminalOutput(null); setPreviewContent(''); }}>
                                    Clear
                                </button>
                                <button className="terminal-close-btn" onClick={() => setShowTerminal(false)}>
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="terminal-body" style={{ position: 'relative', height: 'calc(100% - 35px)', overflow: 'hidden' }}>
                            {activeTab === 'console' && (
                                <div style={{ height: '100%', overflowY: 'auto', padding: '10px' }}>
                                    {isRunning && (
                                        <div className="terminal-loading">
                                            <span className="vs-loader-sm" style={{ display: 'inline-block', marginRight: '8px', borderTopColor: 'var(--yellow)' }} />
                                            Executing {language.toUpperCase()}...
                                        </div>
                                    )}
                                    {!isRunning && !terminalOutput && (
                                        <div className="terminal-placeholder">
                                            Click the 'Run' button above to run your {language.toUpperCase()} code.
                                        </div>
                                    )}
                                    {terminalOutput && (
                                        <div className="terminal-content">
                                            {terminalOutput.error && (
                                                <div className="terminal-line error">{terminalOutput.error}</div>
                                            )}
                                            {terminalOutput.stderr && (
                                                <div className="terminal-line stderr" style={{ color: 'var(--red)', whiteSpace: 'pre-wrap' }}>{terminalOutput.stderr}</div>
                                            )}
                                            {terminalOutput.stdout && (
                                                <div className="terminal-line stdout" style={{ color: 'var(--green)', whiteSpace: 'pre-wrap' }}>{terminalOutput.stdout}</div>
                                            )}
                                            <div className="terminal-meta">
                                                {terminalOutput.exitCode !== null && (
                                                    <span className={`meta-item exit-code ${terminalOutput.exitCode === 0 ? 'success' : 'fail'}`}>
                                                        Process exited with code {terminalOutput.exitCode}
                                                    </span>
                                                )}
                                                {terminalOutput.executionTime !== null && (
                                                    <span className="meta-item time">
                                                        Time: {terminalOutput.executionTime}ms
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'preview' && (
                                <div className="web-preview-container" style={{ width: '100%', height: '100%', background: '#ffffff' }}>
                                    {previewContent ? (
                                        <iframe
                                            title="Web Preview"
                                            srcDoc={previewContent}
                                            sandbox="allow-scripts"
                                            style={{ width: '100%', height: '100%', border: 'none', background: '#ffffff' }}
                                        />
                                    ) : (
                                        <div className="terminal-placeholder" style={{ color: '#858585', padding: '10px' }}>
                                            No visual output generated yet. Run your HTML/CSS code.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {}
            <footer className="vs-status-bar">
                <div className="status-left">
                    <span className={`status-item bg-primary ${connectionStatus.toLowerCase()}`}>
                        ● {connectionStatus === 'CONNECTED' ? 'Live Workspace Sync' : connectionStatus === 'CONNECTING' ? 'Connecting...' : 'Offline Mode'}
                    </span>
                    <span className="status-item">Room: {roomCode || '---'}</span>
                </div>
                <div className="status-right">
                    <span className="status-item">Ln {editorLine}, Col {editorCol}</span>
                    <span className="status-item">{language.toUpperCase()}</span>
                    <span className="status-item">UTF-8</span>
                </div>
            </footer>

        </div>
    );
};

export default Workspace;
