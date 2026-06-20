import React from 'react';

const StatusBar = ({ connectionStatus, roomCode, editorLine, editorCol, language }) => {
    return (
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
    );
};

export default StatusBar;
