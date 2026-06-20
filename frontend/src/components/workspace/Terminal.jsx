import React from 'react';

const Terminal = ({
    language,
    isRunning,
    terminalOutput,
    activeTab,
    setActiveTab,
    previewContent,
    clearTerminal,
    setShowTerminal
}) => {
    return (
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
                    <button className="terminal-clear-btn" onClick={clearTerminal}>Clear</button>
                    <button className="terminal-close-btn" onClick={() => setShowTerminal(false)}>×</button>
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
    );
};

export default Terminal;
