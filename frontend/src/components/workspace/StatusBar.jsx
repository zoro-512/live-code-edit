import React from 'react';

const StatusBar = ({ connectionStatus, roomCode, editorLine, editorCol, language }) => {
  const isConnected  = connectionStatus === 'CONNECTED';
  const isConnecting = connectionStatus === 'CONNECTING';
  const bg = isConnected ? '#007acc' : isConnecting ? '#b08000' : '#b91c1c';

  const item = {
    display: 'flex', alignItems: 'center', padding: '0 10px',
    height: '100%', cursor: 'pointer', fontSize: 11.5, color: '#fff',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{
      gridArea: 'status',
      height: 22, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', background: bg,
      color: '#fff', userSelect: 'none', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <div style={{ ...item, gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isConnected ? '#a7f3d0' : '#fde68a', flexShrink: 0 }} />
          {isConnected ? '⚡ Live Sync' : isConnecting ? 'Connecting…' : '● Offline'}
        </div>
        <div style={item}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          ⊞ main
        </div>
        {roomCode && (
          <div style={item}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Room: {roomCode}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {[
          `Ln ${editorLine}, Col ${editorCol}`,
          language?.toUpperCase(),
          'UTF-8',
          'Spaces: 4',
        ].map(label => (
          <div key={label} style={item}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBar;
