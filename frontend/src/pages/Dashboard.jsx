import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';

const getShort   = (email) => (email?.split('@')[0] || 'U').substring(0, 2).toUpperCase();
const getDisplay = (email) => email?.split('@')[0] || email;

const ROOM_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];

const Dashboard = () => {
    const { logout, userEmail } = useAuth();
    const navigate = useNavigate();

    const [rooms, setRooms]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal,   setShowJoinModal]   = useState(false);
    const [roomName, setRoomName]         = useState('');
    const [roomCode, setRoomCode]         = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError,   setActionError]   = useState('');
    const [hoveredRoom, setHoveredRoom]   = useState(null);

    useEffect(() => { fetchRooms(); }, []);

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const res = await api.get('/room/myRooms');
            setRooms(res.data || []);
        } catch { setError('Failed to fetch rooms.'); }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!roomName.trim()) return;
        setActionLoading(true); setActionError('');
        try {
            const res = await api.post('/room/create', { roomName });
            const r = res.data;
            setShowCreateModal(false); setRoomName('');
            navigate(`/workspace/${r.id}`, { state: { roomCode: r.roomCode, roomName: r.roomName } });
        } catch (err) { setActionError(err.response?.data || 'Failed to create room.'); }
        setActionLoading(false);
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!roomCode.trim()) return;
        setActionLoading(true); setActionError('');
        try {
            const res = await api.post('/room/join', { roomCode });
            const r = res.data;
            setShowJoinModal(false); setRoomCode('');
            navigate(`/workspace/${r.id}`, { state: { roomCode: r.roomCode, roomName: r.roomName } });
        } catch (err) { setActionError(err.response?.data || 'Failed to join room. Verify code.'); }
        setActionLoading(false);
    };

    const closeModals = () => { setShowCreateModal(false); setShowJoinModal(false); setActionError(''); setRoomName(''); setRoomCode(''); };

    // ─── styles ────────────────────────────────────────────────────────────────
    const S = {
        root: {
            display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden',
            background: '#0c0d10', fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif",
        },
        sidebar: {
            display: 'flex', flexDirection: 'column', flexShrink: 0,
            width: 240, background: '#111215',
            borderRight: '1px solid #1e1e23',
        },
        brandRow: {
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '16px 20px', borderBottom: '1px solid #1e1e23',
        },
        brandIcon: {
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        },
        brandText: {
            fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.3px',
        },
        userRow: {
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 20px', borderBottom: '1px solid #1e1e23',
        },
        avatar: {
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff',
        },
        navBtn: (active) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 8, margin: '2px 8px',
            background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
            color: active ? '#a5b4fc' : '#858585',
            border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
            width: 'calc(100% - 16px)', textAlign: 'left', transition: 'all .15s',
        }),
        divider: { borderTop: '1px solid #1e1e23', margin: '8px 0' },
        actionBtn: (primary) => ({
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 16px', margin: '4px 12px', borderRadius: 8,
            background: primary ? '#6366f1' : 'transparent',
            color: primary ? '#fff' : '#858585',
            border: primary ? 'none' : '1px solid #2a2a2e',
            cursor: 'pointer', fontSize: 12, fontWeight: primary ? 600 : 500,
            width: 'calc(100% - 24px)', textAlign: 'left', transition: 'all .15s',
        }),
        main: {
            flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        },
        topBar: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 32px', background: '#111215',
            borderBottom: '1px solid #1e1e23', flexShrink: 0,
        },
        newRoomBtn: {
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8, background: '#6366f1',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontSize: 12, fontWeight: 600, transition: 'all .15s',
        },
        grid: {
            flex: 1, overflowY: 'auto', padding: 32,
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16, alignContent: 'start',
        },
        card: (hovered) => ({
            background: hovered ? '#18181d' : '#141418',
            border: `1px solid ${hovered ? 'rgba(99,102,241,0.4)' : '#1e1e23'}`,
            borderRadius: 12, padding: 20, cursor: 'pointer',
            transition: 'all .15s', display: 'flex', flexDirection: 'column', gap: 12,
            transform: hovered ? 'translateY(-1px)' : 'none',
            boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
        }),
        cardTop: {
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        },
        roomLetter: (color) => ({
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: '#fff',
        }),
        activeBadge: {
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 20, fontSize: 10,
            background: 'rgba(16,185,129,0.1)', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.2)',
        },
        activeDot: {
            width: 6, height: 6, borderRadius: '50%', background: '#10b981',
        },
        roomName: {
            fontSize: 14, fontWeight: 600, color: '#e1e1e1',
            margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        },
        cardFooter: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4,
        },
        roomCode: {
            fontFamily: "'Fira Code', Consolas, monospace",
            fontSize: 11, padding: '3px 8px', borderRadius: 6,
            background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
            border: '1px solid rgba(99,102,241,0.15)', letterSpacing: 1,
        },
    };

    const ModalStyle = {
        overlay: {
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        },
        box: {
            width: 420, background: '#18181b', borderRadius: 16,
            border: '1px solid #27272a', overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        },
        header: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px', borderBottom: '1px solid #27272a',
        },
        body: { padding: 24 },
        label: {
            display: 'block', fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280', marginBottom: 8,
        },
        input: {
            width: '100%', padding: '12px 16px', borderRadius: 10,
            background: '#09090b', color: '#fff', border: '1px solid #27272a',
            fontSize: 13, outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
        },
        footer: { display: 'flex', gap: 10, marginTop: 20 },
        cancelBtn: {
            flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #27272a',
            background: 'transparent', color: '#9ca3af', fontSize: 13, cursor: 'pointer',
        },
        submitBtn: (loading) => ({
            flex: 1, padding: '11px 0', borderRadius: 10, border: 'none',
            background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }),
    };

    return (
        <div style={S.root}>

            {/* ── Sidebar ── */}
            <aside style={S.sidebar}>
                {/* Brand */}
                <div style={S.brandRow}>
                    <div style={S.brandIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white"/>
                            <rect x="13" y="3" width="8" height="8" rx="1.5" fill="white" opacity=".7"/>
                            <rect x="3" y="13" width="8" height="8" rx="1.5" fill="white" opacity=".7"/>
                            <rect x="13" y="13" width="8" height="8" rx="1.5" fill="white" opacity=".4"/>
                        </svg>
                    </div>
                    <span style={S.brandText}>CodeCollab</span>
                </div>

                {/* User */}
                <div style={S.userRow}>
                    <div style={S.avatar}>{getShort(userEmail)}</div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#e1e1e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {getDisplay(userEmail)}
                        </div>
                        <div style={{ fontSize: 10, color: '#10b981', marginTop: 2 }}>● Online</div>
                    </div>
                </div>

                {/* Nav */}
                <div style={{ padding: '8px 0' }}>
                    <button style={S.navBtn(true)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        My Rooms
                    </button>
                </div>

                <div style={{ flex: 1 }} />
                <div style={S.divider} />

                {/* Actions */}
                <div style={{ padding: '8px 0' }}>
                    <button
                        style={S.actionBtn(true)}
                        onClick={() => setShowCreateModal(true)}
                        onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                        onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Create Room
                    </button>
                    <button
                        style={S.actionBtn(false)}
                        onClick={() => setShowJoinModal(true)}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#e1e1e1'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#858585'; }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                            <polyline points="10 17 15 12 10 7"/>
                            <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        Join Room
                    </button>
                    <button
                        style={{ ...S.actionBtn(false), border: 'none', marginTop: 4 }}
                        onClick={logout}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#858585'; }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Log Out
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main style={S.main}>
                {/* Top bar */}
                <div style={S.topBar}>
                    <div>
                        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>My Rooms</h1>
                        <p style={{ fontSize: 12, color: '#858585', margin: '4px 0 0' }}>
                            {rooms.length} workspace{rooms.length !== 1 ? 's' : ''} · Real-time collaboration
                        </p>
                    </div>
                    <button
                        style={S.newRoomBtn}
                        onClick={() => setShowCreateModal(true)}
                        onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                        onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        New Room
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, color: '#858585', fontSize: 13 }}>
                        <div className="vs-loader-sm" />
                        Loading workspaces…
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: 48, color: '#ef4444', fontSize: 13 }}>{error}</div>
                ) : rooms.length === 0 ? (
                    /* Empty state */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 20, paddingBottom: 60 }}>
                        <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
                                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                            </svg>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>No rooms yet</h2>
                            <p style={{ fontSize: 13, color: '#858585', margin: 0 }}>Create or join a workspace to start coding together.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => setShowCreateModal(true)} style={{ padding: '10px 20px', borderRadius: 10, background: '#6366f1', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Create Room</button>
                            <button onClick={() => setShowJoinModal(true)} style={{ padding: '10px 20px', borderRadius: 10, background: 'transparent', color: '#ccc', border: '1px solid #2a2a2e', fontSize: 13, cursor: 'pointer' }}>Join Room</button>
                        </div>
                    </div>
                ) : (
                    <div style={S.grid}>
                        {rooms.map((room, idx) => (
                            <div
                                key={room.id}
                                style={S.card(hoveredRoom === room.id)}
                                onMouseEnter={() => setHoveredRoom(room.id)}
                                onMouseLeave={() => setHoveredRoom(null)}
                                onClick={() => navigate(`/workspace/${room.id}`, { state: { roomCode: room.roomCode, roomName: room.roomName } })}
                            >
                                <div style={S.cardTop}>
                                    <div style={S.roomLetter(ROOM_COLORS[idx % ROOM_COLORS.length])}>
                                        {room.roomName.charAt(0).toUpperCase()}
                                    </div>
                                    <div style={S.activeBadge}>
                                        <div style={S.activeDot} />
                                        Active
                                    </div>
                                </div>
                                <p style={S.roomName}>{room.roomName}</p>
                                <div style={S.cardFooter}>
                                    <code style={S.roomCode}>{room.roomCode}</code>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"
                                        style={{ opacity: hoveredRoom === room.id ? 1 : 0, transition: 'opacity .15s' }}>
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* ── Modal ── */}
            {(showCreateModal || showJoinModal) && (
                <div style={ModalStyle.overlay} onClick={(e) => e.target === e.currentTarget && closeModals()}>
                    <div style={ModalStyle.box}>
                        {/* Header */}
                        <div style={ModalStyle.header}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                                        {showCreateModal
                                            ? <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
                                            : <><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></>
                                        }
                                    </svg>
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                                    {showCreateModal ? 'Create New Room' : 'Join a Room'}
                                </span>
                            </div>
                            <button onClick={closeModals} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>×</button>
                        </div>

                        {/* Body */}
                        <form onSubmit={showCreateModal ? handleCreate : handleJoin} style={ModalStyle.body}>
                            <label style={ModalStyle.label}>
                                {showCreateModal ? 'Room Name' : '6-Digit Room Code'}
                            </label>
                            <input
                                type="text"
                                value={showCreateModal ? roomName : roomCode}
                                onChange={e => showCreateModal ? setRoomName(e.target.value) : setRoomCode(e.target.value.toUpperCase())}
                                placeholder={showCreateModal ? 'e.g. My Project Workspace' : 'e.g. AB12CD'}
                                maxLength={showCreateModal ? undefined : 6}
                                required autoFocus
                                style={{
                                    ...ModalStyle.input,
                                    fontFamily: showJoinModal ? "'Fira Code', monospace" : 'inherit',
                                    letterSpacing: showJoinModal ? '0.3em' : 'normal',
                                    color: showJoinModal ? '#a5b4fc' : '#fff',
                                }}
                                onFocus={e => e.target.style.borderColor = '#6366f1'}
                                onBlur={e => e.target.style.borderColor = '#27272a'}
                            />

                            {actionError && (
                                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)', fontSize: 12 }}>
                                    ✖ {actionError}
                                </div>
                            )}

                            <div style={ModalStyle.footer}>
                                <button type="button" onClick={closeModals} style={ModalStyle.cancelBtn}>Cancel</button>
                                <button type="submit" disabled={actionLoading} style={ModalStyle.submitBtn(actionLoading)}>
                                    {actionLoading
                                        ? <div className="vs-loader-sm" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                        : (showCreateModal ? 'Create Room' : 'Join Room')
                                    }
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
