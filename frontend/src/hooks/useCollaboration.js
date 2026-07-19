import { useEffect, useRef, useState } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness';
import { MonacoBinding } from 'y-monaco';
import { api, API_BASE_URL } from '../context/AuthContext';

const AVATAR_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];
const hashStr = (s) => String(s).split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
const getColor = (email) => AVATAR_COLORS[Math.abs(hashStr(email || '')) % AVATAR_COLORS.length];

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

export const useCollaboration = (roomId, userEmail, token, onExecutionMessage) => {
    const [members, setMembers] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
    const [fileNames, setFileNames] = useState(['Main.java']);
    
    const stompClientRef = useRef(null);
    const yDocRef = useRef(new Y.Doc());
    const yMapRef = useRef(yDocRef.current.getMap('workspace-files'));
    const monacoBindingRef = useRef(null);
    const awarenessRef = useRef(new awarenessProtocol.Awareness(yDocRef.current));
    const hasSyncedRef = useRef(false);
    const syncTimeoutRef = useRef(null);
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
            
            // Trigger auto-save whenever the document is modified (debounced)
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => {
                const files = getAllFiles();
                api.post(`/room/${roomId}/save`, { code: JSON.stringify(files) })
                    .catch(err => console.error('Failed to auto-save code:', err));
            }, 2000);
        };

        yDocRef.current.on('update', handleYjsUpdate);

        const updateCursorStyles = () => {
            let css = '';
            awarenessRef.current.getStates().forEach((state, clientID) => {
                if (state.user) {
                    const color = state.user.color || '#f59e0b';
                    const name = state.user.name || 'User';
                    css += `
.yRemoteSelection-${clientID} {
  background-color: ${color}33;
}
.yRemoteSelectionHead-${clientID} {
  border-left: 2px solid ${color};
  position: absolute;
  height: 100%;
  box-sizing: border-box;
  z-index: 99;
}
.yRemoteSelectionHead-${clientID}::after {
  content: '${name}';
  display: block;
  position: absolute;
  top: -18px;
  left: -2px;
  color: white;
  background-color: ${color};
  font-size: 11px;
  font-family: sans-serif;
  padding: 2px 6px;
  border-radius: 4px;
  border-bottom-left-radius: 0;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
`;
                }
            });
            let styleEl = document.getElementById('yjs-cursors-style');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'yjs-cursors-style';
                document.head.appendChild(styleEl);
            }
            styleEl.innerHTML = css;
        };

        const handleAwarenessUpdate = ({ added, updated, removed }, origin) => {
            updateCursorStyles();
            if (origin !== 'websocket') {
                const changedClients = added.concat(updated, removed);
                const update = awarenessProtocol.encodeAwarenessUpdate(awarenessRef.current, changedClients);
                const base64Update = uint8ArrayToBase64(update);
                const updateMessage = {
                    roomId, creator: userEmail, content: base64Update, messageType: 'YJS_AWARENESS'
                };
                const client = stompClientRef.current;
                if (client && client.connected) {
                    client.send('/app/chat.send', {}, JSON.stringify(updateMessage));
                }
            }
        };
        awarenessRef.current.on('update', handleAwarenessUpdate);

        // Set local awareness state
        awarenessRef.current.setLocalStateField('user', {
            name: userEmail?.split('@')[0] || 'User',
            color: getColor(userEmail)
        });

        const handleMapObserve = () => {
            const currentFiles = Array.from(yMapRef.current.keys());
            if (currentFiles.length === 0) {
                currentFiles.push('Main.java');
            }
            setFileNames(currentFiles);
        };
        yMapRef.current.observeDeep(handleMapObserve);

        connectWebSocket();

        return () => {
            yDocRef.current.off('update', handleYjsUpdate);
            awarenessRef.current.off('update', handleAwarenessUpdate);
            yMapRef.current.unobserveDeep(handleMapObserve);
            disconnectWebSocket();
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            if (monacoBindingRef.current) monacoBindingRef.current.destroy();
        };
    }, [roomId]);

    const connectWebSocket = () => {
        setConnectionStatus('CONNECTING');
        const socket = new SockJS(`${API_BASE_URL}/ws`);
        const client = Stomp.over(socket);
        stompClientRef.current = client;

        client.debug = (str) => console.log('[STOMP Debug] ' + str);

        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        client.connect(headers, (frame) => {
            // Check if component unmounted while connecting
            if (stompClientRef.current !== client) {
                client.disconnect();
                return;
            }
            setConnectionStatus('CONNECTED');
            
            client.subscribe(`/topic/room/${roomId}`, (messageOutput) => {
                try {
                    const message = JSON.parse(messageOutput.body);
                    handleIncomingMessage(message);
                } catch (e) {
                    console.error('Failed to parse incoming WS message:', e);
                }
            });

            const joinMessage = { roomId, creator: userEmail, content: `${userEmail} joined the session.`, messageType: 'JOIN' };
            client.send('/app/chat.send', {}, JSON.stringify(joinMessage));

            const syncRequest = { roomId, creator: userEmail, content: '', messageType: 'YJS_SYNC_REQUEST' };
            client.send('/app/chat.send', {}, JSON.stringify(syncRequest));

            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(() => {
                if (!hasSyncedRef.current) {
                    console.log('No peer response. Initializing Yjs text state from DB...');
                    api.get(`/room/${roomId}/code`)
                        .then(response => {
                            if (!hasSyncedRef.current) {
                                if (response.data) {
                                    try {
                                        const parsedFiles = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                                        for (const [filename, content] of Object.entries(parsedFiles)) {
                                            const fileText = getFileText(filename);
                                            if (fileText.length === 0) {
                                                fileText.insert(0, content);
                                            }
                                        }
                                        setFileNames(Object.keys(parsedFiles));
                                    } catch (e) {
                                        const mainFile = getFileText('Main.java');
                                        if (mainFile.length === 0) {
                                            mainFile.insert(0, response.data);
                                        }
                                        setFileNames(['Main.java']);
                                    }
                                } else {
                                    const mainFile = getFileText('Main.java');
                                    if (mainFile.length === 0) {
                                        mainFile.insert(0, `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Main!");\n    }\n}`);
                                    }
                                    setFileNames(['Main.java']);
                                }
                                hasSyncedRef.current = true;
                            }
                        })
                        .catch(err => {
                            console.error('Failed to fetch DB fallback state:', err);
                            if (!hasSyncedRef.current) {
                                const mainFile = getFileText('Main.java');
                                if (mainFile.length === 0) {
                                    mainFile.insert(0, `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Main!");\n    }\n}`);
                                }
                                hasSyncedRef.current = true;
                            }
                        });
                }
            }, 1500);

        }, (error) => {
            if (stompClientRef.current === client) {
                setConnectionStatus('DISCONNECTED');
            }
            console.error('STOMP connection failed:', error);
        });
    };

    const disconnectWebSocket = () => {
        const client = stompClientRef.current;
        stompClientRef.current = null;
        if (client) {
            try {
                if (client.connected) {
                    const leftMessage = { roomId, creator: userEmail, content: `${userEmail} left the session.`, messageType: 'LEFT' };
                    client.send('/app/chat.send', {}, JSON.stringify(leftMessage));
                    client.disconnect(() => {
                        setConnectionStatus('DISCONNECTED');
                    });
                } else {
                    if (client.ws) {
                        client.ws.onclose = null;
                        client.ws.close();
                    }
                }
            } catch (e) {
                console.error('Failed clean websocket disconnect:', e);
            }
        }
    };

    const handleIncomingMessage = (msg) => {
        if (msg.messageType === 'JOIN') {
            setMembers(prev => prev.includes(msg.creator) ? prev : [...prev, msg.creator]);
        } else if (msg.messageType === 'LEFT') {
            setMembers(prev => prev.filter(email => email !== msg.creator));
        } else if (msg.messageType === 'YJS_SYNC_REQUEST') {
            if (hasSyncedRef.current) {
                // Send current document state
                const stateUpdate = Y.encodeStateAsUpdate(yDocRef.current);
                const syncResponse = { roomId, creator: userEmail, content: uint8ArrayToBase64(stateUpdate), messageType: 'YJS_SYNC_RESPONSE' };
                stompClientRef.current.send('/app/chat.send', {}, JSON.stringify(syncResponse));
                
                // Also send our awareness state to the requester
                const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(awarenessRef.current, [awarenessRef.current.clientID]);
                const awarenessMsg = { roomId, creator: userEmail, content: uint8ArrayToBase64(awarenessUpdate), messageType: 'YJS_AWARENESS' };
                stompClientRef.current.send('/app/chat.send', {}, JSON.stringify(awarenessMsg));
            }
        } else if (msg.messageType === 'YJS_SYNC_RESPONSE') {
            if (!hasSyncedRef.current) {
                if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                Y.applyUpdate(yDocRef.current, base64ToUint8Array(msg.content), 'websocket-sync');
                hasSyncedRef.current = true;
            }
        } else if (msg.messageType === 'YJS_UPDATE') {
            try {
                Y.applyUpdate(yDocRef.current, base64ToUint8Array(msg.content), 'websocket-update');
            } catch (e) {
                console.error("Failed to apply update", e);
            }
        } else if (msg.messageType === 'YJS_AWARENESS') {
            try {
                awarenessProtocol.applyAwarenessUpdate(awarenessRef.current, base64ToUint8Array(msg.content), 'websocket');
            } catch (e) {
                console.error("Failed to apply awareness", e);
            }
        } else if (msg.messageType === 'EXECUTION_START' || msg.messageType === 'EXECUTION_RESULT') {
            onExecutionMessage(msg);
        }
    };

    const getFileText = (filename) => {
        if (!yMapRef.current.has(filename)) {
            yMapRef.current.set(filename, true);
        }
        return yDocRef.current.getText(filename);
    };

    const bindEditor = (editor, filename = 'Main.java') => {
        if (monacoBindingRef.current) {
            monacoBindingRef.current.destroy();
        }
        
        // Prevent Monaco from overwriting Yjs text with the previous file's content
        const text = getFileText(filename).toString();
        editor.setValue(text);

        monacoBindingRef.current = new MonacoBinding(
            getFileText(filename),
            editor.getModel(),
            new Set([editor]),
            awarenessRef.current
        );
    };

    const getAllFiles = () => {
        const files = {};
        for (const name of yMapRef.current.keys()) {
            files[name] = getFileText(name).toString();
        }
        if (Object.keys(files).length === 0) {
            files['Main.java'] = getFileText('Main.java').toString();
        }
        return files;
    };

    const createFile = (filename) => {
        if (!yMapRef.current.has(filename)) {
            yMapRef.current.set(filename, true);
            
            // Force immediate save to prevent data loss on quick refresh
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            const files = getAllFiles();
            api.post(`/room/${roomId}/save`, { code: JSON.stringify(files) })
                .catch(err => console.error('Failed to auto-save code:', err));
        }
    };

    return { members, connectionStatus, bindEditor, getAllFiles, getFileText, fileNames, createFile };
};
