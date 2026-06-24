import React from 'react';

const StatusBar = ({ connectionStatus, roomCode, editorLine, editorCol, language }) => {
  const isConnected  = connectionStatus === 'CONNECTED';
  const isConnecting = connectionStatus === 'CONNECTING';
  const bgClass = isConnected ? 'bg-indigo-600' : isConnecting ? 'bg-amber-600' : 'bg-red-700';

  const itemClass = "flex items-center px-2.5 h-full cursor-pointer text-[11.5px] text-white whitespace-nowrap hover:bg-black/15 transition-colors";

  return (
    <div 
      className={`h-[22px] flex items-center justify-between text-white select-none overflow-hidden ${bgClass}`}
      style={{ gridArea: 'status' }}
    >
      <div className="flex items-center h-full">
        <div className={`${itemClass} gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-emerald-300' : 'bg-amber-200'}`} />
          {isConnected ? '⚡ Live Sync' : isConnecting ? 'Connecting…' : '● Offline'}
        </div>
        <div className={itemClass}>
          ⊞ main
        </div>
        {roomCode && (
          <div className={itemClass}>
            Room: {roomCode}
          </div>
        )}
      </div>
      <div className="flex items-center h-full">
        {[
          `Ln ${editorLine}, Col ${editorCol}`,
          language?.toUpperCase(),
          'UTF-8',
          'Spaces: 4',
        ].map(label => (
          <div key={label} className={itemClass}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBar;
