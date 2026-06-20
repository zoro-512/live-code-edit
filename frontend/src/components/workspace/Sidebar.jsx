import React, { useState } from 'react';

const Sidebar = ({ roomName, roomCode, members, userEmail }) => {
    const [copied, setCopied] = useState(false);

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="vs-sidebar-panel">
            <div className="sidebar-header">
                <h3 className="workspace-title">{roomName}</h3>
            </div>

            <div className="sidebar-section">
                <div className="section-title">
                    <span className="arrow-icon">▼</span>
                    <h4>ACTIVE USERS ({members.length + 1})</h4>
                </div>
                <div className="section-content">
                    <ul className="member-list">
                        <li className="member-item me">
                            <div className="member-avatar">ME</div>
                            <div className="member-info">
                                <span className="member-email">{userEmail}</span>
                                <span className="member-status">Owner (You)</span>
                            </div>
                        </li>
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
    );
};

export default Sidebar;
