import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';

const Dashboard = () => {
    const { logout, userEmail } = useAuth();
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const response = await api.get('/room/myRooms');
            setRooms(response.data || []);
        } catch (err) {
            setError('Failed to fetch rooms. Please try again.');
        }
        setLoading(false);
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!roomName.trim()) return;
        setActionLoading(true);
        setActionError('');
        try {
            // `/room/create` endpoint takes `CreateRoomRequest` { roomName }
            const response = await api.post('/room/create', { roomName });
            const createdRoom = response.data; // { id, roomName, roomCode }
            
            setShowCreateModal(false);
            setRoomName('');
            // Navigate directly to the new workspace!
            navigate(`/workspace/${createdRoom.id}`, { state: { roomCode: createdRoom.roomCode, roomName: createdRoom.roomName } });
        } catch (err) {
            setActionError(err.response?.data || 'Failed to create room.');
        }
        setActionLoading(false);
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        if (!roomCode.trim()) return;
        setActionLoading(true);
        setActionError('');
        try {
            // `/room/join` endpoint takes `JoinRoomRequest` { roomCode }
            const response = await api.post('/room/join', { roomCode });
            const joinedRoom = response.data; // { id, roomName, roomCode }

            setShowJoinModal(false);
            setRoomCode('');
            // Navigate directly to the joined workspace!
            navigate(`/workspace/${joinedRoom.id}`, { state: { roomCode: joinedRoom.roomCode, roomName: joinedRoom.roomName } });
        } catch (err) {
            setActionError(err.response?.data || 'Failed to join room. Verify code.');
        }
        setActionLoading(false);
    };

    return (
        <div className="vs-app-layout">
            
            {/* VS Code Main Sidebar Icon Menu */}
            <aside className="vs-activity-bar">
                <div className="activity-top">
                    <div className="activity-icon active" title="Explorer">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 3H10V10H3V3Z"/>
                            <path d="M14 3H21V10H14V3Z"/>
                            <path d="M14 14H21V21H14V14Z"/>
                            <path d="M3 14H10V21H3V14Z"/>
                        </svg>
                    </div>
                </div>
                <div className="activity-bottom">
                    <div className="activity-icon" title="Log Out" onClick={logout}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"/>
                            <path d="M16 17L21 12L16 7"/>
                            <path d="M21 12H9"/>
                        </svg>
                    </div>
                </div>
            </aside>

            {/* VS Code Explorer Sidebar Panel */}
            <div className="vs-sidebar-panel">
                <div className="sidebar-header">
                    <h3>EXPLORER</h3>
                    <div className="user-profile-tag" title={userEmail}>
                        {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="section-title">
                        <span className="arrow-icon">▼</span>
                        <h4>COLLABORATIVE WORKSPACES</h4>
                    </div>

                    <div className="section-content">
                        <div className="room-actions">
                            <button className="btn-sidebar-action" onClick={() => setShowCreateModal(true)}>
                                <span>+</span> Create Room
                            </button>
                            <button className="btn-sidebar-action secondary" onClick={() => setShowJoinModal(true)}>
                                <span>→</span> Join Room
                            </button>
                        </div>

                        {loading ? (
                            <div className="sidebar-loader-container">
                                <div className="vs-loader-sm"></div>
                                <span>Fetching rooms...</span>
                            </div>
                        ) : error ? (
                            <div className="sidebar-error">{error}</div>
                        ) : rooms.length === 0 ? (
                            <div className="sidebar-empty">No active rooms found. Create or join one to begin coding.</div>
                        ) : (
                            <ul className="room-tree-list">
                                {rooms.map((room) => (
                                    <li key={room.id} onClick={() => navigate(`/workspace/${room.id}`, { state: { roomCode: room.roomCode, roomName: room.roomName } })}>
                                        <div className="tree-item-icon">📄</div>
                                        <div className="tree-item-details">
                                            <span className="room-tree-name">{room.roomName}</span>
                                            <span className="room-tree-code">{room.roomCode}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Main VS Code Workspace View */}
            <main className="vs-main-workspace-view">
                <div className="tab-container-header">
                    <div className="active-tab">
                        <span>Welcome.md</span>
                    </div>
                </div>

                <div className="welcome-screen">
                    <div className="welcome-brand">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 22H22L12 2Z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h2>Antigravity Live Code Workspace</h2>
                    </div>

                    <div className="shortcut-group">
                        <h3>Start</h3>
                        <div className="shortcut-card" onClick={() => setShowCreateModal(true)}>
                            <div className="shortcut-icon">🆕</div>
                            <div className="shortcut-info">
                                <h4>Create a New Room</h4>
                                <p>Initialize a new coding workspace for you and your team</p>
                            </div>
                        </div>
                        <div className="shortcut-card" onClick={() => setShowJoinModal(true)}>
                            <div className="shortcut-icon">🚪</div>
                            <div className="shortcut-info">
                                <h4>Join an Existing Room</h4>
                                <p>Connect to another user's session using a 6-digit room code</p>
                            </div>
                        </div>
                    </div>

                    <div className="footer-tips">
                        <p>Tip: All files and code changes sync in real-time between all joined members.</p>
                    </div>
                </div>
            </main>

            {/* Bottom Status Bar */}
            <footer className="vs-status-bar">
                <div className="status-left">
                    <span className="status-item bg-primary">✓ Ready</span>
                    <span className="status-item">{userEmail}</span>
                </div>
                <div className="status-right">
                    <span className="status-item">JSON</span>
                    <span className="status-item">UTF-8</span>
                </div>
            </footer>

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="vs-modal">
                        <div className="modal-header">
                            <h4>Create Collaborative Room</h4>
                            <span className="close-btn" onClick={() => setShowCreateModal(false)}>×</span>
                        </div>
                        <form onSubmit={handleCreateRoom} className="modal-form">
                            <div className="form-group">
                                <label>Room Name</label>
                                <input 
                                    type="text" 
                                    value={roomName} 
                                    onChange={(e) => setRoomName(e.target.value)} 
                                    placeholder="e.g. My Workspace Project" 
                                    required 
                                    autoFocus
                                />
                            </div>
                            {actionError && <div className="modal-error">{actionError}</div>}
                            <div className="modal-footer">
                                <button type="button" className="btn-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn-modal-submit" disabled={actionLoading}>
                                    {actionLoading ? <div className="vs-loader-sm"></div> : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Room Modal */}
            {showJoinModal && (
                <div className="modal-overlay">
                    <div className="vs-modal">
                        <div className="modal-header">
                            <h4>Join Collaborative Room</h4>
                            <span className="close-btn" onClick={() => setShowJoinModal(false)}>×</span>
                        </div>
                        <form onSubmit={handleJoinRoom} className="modal-form">
                            <div className="form-group">
                                <label>6-Digit Room Code</label>
                                <input 
                                    type="text" 
                                    value={roomCode} 
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())} 
                                    placeholder="e.g. AB12CD" 
                                    maxLength="6"
                                    required 
                                    autoFocus
                                />
                            </div>
                            {actionError && <div className="modal-error">{actionError}</div>}
                            <div className="modal-footer">
                                <button type="button" className="btn-modal-cancel" onClick={() => setShowJoinModal(false)}>Cancel</button>
                                <button type="submit" className="btn-modal-submit" disabled={actionLoading}>
                                    {actionLoading ? <div className="vs-loader-sm"></div> : 'Join'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
