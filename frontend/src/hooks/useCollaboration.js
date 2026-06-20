import { useEffect, useRef, useState } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { api, API_BASE_URL } from '../../context/AuthContext';

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
    
    const stompClientRef = useRef(null);
    const yDocRef = useRef(new Y.Doc());
    const yTextRef = useRef(yDocRef.current.getText('monaco'));
    const monacoBindingRef = useRef(null);
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
        };

        yDocRef.current.on('update', handleYjsUpdate);

        const handleTextObserve = () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            saveTimeoutRef.current = setTimeout(() => {
                const plainText = yTextRef.current.toString();
                api.post(`/room/${roomId}/save`, { code: plainText })
                    .catch(err => console.error('Failed to auto-save code:', err));
            }, 2000); 
        };
        yTextRef.current.observe(handleTextObserve);

        connectWebSocket();

        return () => {
            yDocRef.current.off('update', handleYjsUpdate);
            yTextRef.current.unobserve(handleTextObserve);
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
            const leftMessage = { roomId, creator: userEmail, content: `${userEmail} left the session.`, messageType: 'LEFT' };
            try {
                client.send('/app/chat.send', {}, JSON.stringify(leftMessage));
                client.disconnect(() => setConnectionStatus('DISCONNECTED'));
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
            if (msg.creator !== userEmail && hasSyncedRef.current) {
                const stateUpdate = Y.encodeStateAsUpdate(yDocRef.current);
                const syncResponse = { roomId, creator: userEmail, content: uint8ArrayToBase64(stateUpdate), messageType: 'YJS_SYNC_RESPONSE' };
                stompClientRef.current.send('/app/chat.send', {}, JSON.stringify(syncResponse));
            }
        } else if (msg.messageType === 'YJS_SYNC_RESPONSE') {
            if (!hasSyncedRef.current) {
                if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
                Y.applyUpdate(yDocRef.current, base64ToUint8Array(msg.content), 'websocket-sync');
                hasSyncedRef.current = true;
            }
        } else if (msg.messageType === 'YJS_UPDATE') {
            if (msg.creator !== userEmail) {
                Y.applyUpdate(yDocRef.current, base64ToUint8Array(msg.content), 'websocket-update');
            }
        } else if (msg.messageType === 'EXECUTION_START' || msg.messageType === 'EXECUTION_RESULT') {
            onExecutionMessage(msg);
        }
    };

    const bindEditor = (editor) => {
        if (monacoBindingRef.current) {
            monacoBindingRef.current.destroy();
        }
        monacoBindingRef.current = new MonacoBinding(
            yTextRef.current,
            editor.getModel(),
            new Set([editor])
        );
    };

    const getCurrentCode = () => yTextRef.current.toString();

    return { members, connectionStatus, bindEditor, getCurrentCode };
};
