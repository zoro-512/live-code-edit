import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { useAuth, api, API_BASE_URL } from '../context/AuthContext';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

const Workspace = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { userEmail } = useAuth();

    // Details passed from Dashboard or fetched
    const [roomName, setRoomName] = useState(location.state?.roomName || 'Workspace');
    const [roomCode, setRoomCode] = useState(location.state?.roomCode || '');

    // Collaborative Code & User States
    const [editorCode, setEditorCode] = useState('// Welcome to the collaborative workspace!\n// Start coding here...');
    const [members, setMembers] = useState([]);
    const [language, setLanguage] = useState('javascript');
    const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
    const [editorLine, setEditorLine] = useState(1);
    const [editorCol, setEditorCol] = useState(1);

    // Copy Feedback
    const [copied, setCopied] = useState(false);

    // Refs for WebSocket client and remote state locks
    const stompClientRef = useRef(null);
    const isRemoteChange = useRef(false);

    // Ref for the debounced auto-save timer
    const saveTimeoutRef = useRef(null);

    useEffect(() => {
        // Fetch room info if not passed in routing state (e.g., page refresh)
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

        // Fetch saved code for this room
        api.get(`/room/${roomId}/code`)
            .then(response => {
                if (response.data) {
                    setEditorCode(response.data);
                }
            })
            .catch(err => console.error('Failed to load room code:', err));

        // Establish WebSocket Connection
        connectWebSocket();

        // Cleanup on unmount
        return () => {
            disconnectWebSocket();
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [roomId]);

    const connectWebSocket = () => {
        setConnectionStatus('CONNECTING');
        
        // SockJS connection to backend `/ws`
        const socket = new SockJS(`${API_BASE_URL}/ws`);
        const client = Stomp.over(socket);
        stompClientRef.current = client;

        // Disable heavy STOMP debug logs in browser console
        client.debug = (str) => {
            console.log('[STOMP Debug] ' + str);
        };

        client.connect({}, (frame) => {
            setConnectionStatus('CONNECTED');
            
            // Subscribe to room topic
            const topic = `/topic/room/${roomId}`;
            client.subscribe(topic, (messageOutput) => {
                try {
                    const message = JSON.parse(messageOutput.body);
                    handleIncomingMessage(message);
                } catch (e) {
                    console.error('Failed to parse incoming WS message:', e);
                }
            });

            // Send JOIN message to alert others
            const joinMessage = {
                roomId: roomId,
                creator: userEmail,
                content: `${userEmail} joined the session.`,
                messageType: 'JOIN'
            };
            client.send('/app/chat.send', {}, JSON.stringify(joinMessage));

        }, (error) => {
            setConnectionStatus('DISCONNECTED');
            console.error('STOMP connection failed:', error);
        });
    };

    const disconnectWebSocket = () => {
        const client = stompClientRef.current;
        if (client && client.connected) {
            // Send LEFT message before disconnecting
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
            // Add user to active members list if not already present
            setMembers(prev => {
                if (prev.includes(msg.creator)) return prev;
                return [...prev, msg.creator];
            });
        } else if (msg.messageType === 'LEFT') {
            // Remove user from active members
            setMembers(prev => prev.filter(email => email !== msg.creator));
        } else if (msg.messageType === 'CHAT') {
            // Update editor content ONLY if the change originated from a remote user
            if (msg.creator !== userEmail) {
                isRemoteChange.current = true;
                setEditorCode(msg.content);
            }
        }
    };

    const handleEditorChange = (value) => {
        if (isRemoteChange.current) {
            // Programmatic update from remote user, reset lock and skip broadcast
            isRemoteChange.current = false;
            return;
        }

        // Send local changes to all room members
        setEditorCode(value);
        broadcastCodeChange(value);

        // Debounce saving the code to the database via REST API
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        
        saveTimeoutRef.current = setTimeout(() => {
            api.post(`/room/${roomId}/save`, { code: value })
                .catch(err => console.error('Failed to auto-save code:', err));
        }, 2000); // 2-second debounce interval
    };

    const broadcastCodeChange = (code) => {
        const client = stompClientRef.current;
        if (client && client.connected) {
            const chatMessage = {
                roomId: roomId,
                creator: userEmail,
                content: code,
                messageType: 'CHAT'
            };
            client.send('/app/chat.send', {}, JSON.stringify(chatMessage));
        }
    };

    // Tracking Cursor Position in Status Bar
    const handleEditorDidMount = (editor, monaco) => {
        editor.onDidChangeCursorPosition((e) => {
            setEditorLine(e.position.lineNumber);
            setEditorCol(e.position.column);
        });
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="vs-app-layout">
            
            {/* VS Code Main Sidebar Icon Menu */}
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
                    <div className="activity-icon" title="Log Out" onClick={() => navigate('/dashboard')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"/>
                            <path d="M16 17L21 12L16 7"/>
                            <path d="M21 12H9"/>
                        </svg>
                    </div>
                </div>
            </aside>

            {/* VS Code Workspace Sidebar Panel */}
            <div className="vs-sidebar-panel">
                <div className="sidebar-header">
                    <h3 className="workspace-title">{roomName}</h3>
                </div>

                {/* Section 1: Active Collaborators */}
                <div className="sidebar-section">
                    <div className="section-title">
                        <span className="arrow-icon">▼</span>
                        <h4>ACTIVE USERS ({members.length + 1})</h4>
                    </div>
                    <div className="section-content">
                        <ul className="member-list">
                            {/* Always render current user first */}
                            <li className="member-item me">
                                <div className="member-avatar">ME</div>
                                <div className="member-info">
                                    <span className="member-email">{userEmail}</span>
                                    <span className="member-status">Owner (You)</span>
                                </div>
                            </li>
                            {/* Render remote members */}
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

                {/* Section 2: Room Info */}
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

            {/* Main VS Code Monaco Workspace */}
            <main className="vs-main-workspace-view">
                
                {/* Editor Tabs bar */}
                <div className="tab-container-header">
                    <div className="active-tab">
                        <span>main.{language === 'javascript' ? 'js' : language === 'java' ? 'java' : language === 'html' ? 'html' : 'txt'}</span>
                    </div>
                    <div className="tab-actions">
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)} 
                            className="vs-lang-selector"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="cpp">C++</option>
                        </select>
                    </div>
                </div>

                {/* Monaco Editor Container */}
                <div className="monaco-editor-pane">
                    <MonacoEditor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={editorCode}
                        onChange={handleEditorChange}
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
            </main>

            {/* Bottom Status Bar */}
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
