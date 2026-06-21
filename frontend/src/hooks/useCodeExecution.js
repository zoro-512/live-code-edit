import { useState } from 'react';
import { api } from '../context/AuthContext';

export const useCodeExecution = (roomId) => {
    const [isRunning, setIsRunning] = useState(false);
    const [showTerminal, setShowTerminal] = useState(false);
    const [terminalOutput, setTerminalOutput] = useState(null);
    const [activeTab, setActiveTab] = useState('console');
    const [previewContent, setPreviewContent] = useState('');

    const handleExecutionMessage = (msg) => {
        if (msg.messageType === 'EXECUTION_START') {
            setIsRunning(true);
            setShowTerminal(true);
            setTerminalOutput(null);
        } else if (msg.messageType === 'EXECUTION_RESULT') {
            setIsRunning(false);
            setShowTerminal(true);
            try {
                const result = JSON.parse(msg.content);
                setTerminalOutput({
                    stdout: result.stdout || '',
                    stderr: result.stderr || '',
                    exitCode: result.exitCode,
                    executionTime: result.executionTime,
                    error: null
                });
            } catch (e) {
                setTerminalOutput({
                    stdout: '',
                    stderr: '',
                    exitCode: null,
                    executionTime: null,
                    error: 'Error parsing execution result: ' + msg.content
                });
            }
        }
    };

    const runJavaScriptLocal = (code) => {
        const startTime = Date.now();
        const logs = [];
        const errors = [];

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.sandbox = 'allow-scripts';
        document.body.appendChild(iframe);

        const iframeSrc = `
            <!DOCTYPE html>
            <html>
            <body>
            <script>
                const customConsole = {
                    log: (...args) => {
                        const str = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                        window.parent.postMessage({ type: 'JS_CONSOLE_LOG', data: str }, '*');
                    },
                    error: (...args) => {
                        const str = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
                        window.parent.postMessage({ type: 'JS_CONSOLE_ERROR', data: str }, '*');
                    }
                };
                window.console = { ...window.console, ...customConsole };
                window.onerror = (message, source, lineno, colno, error) => {
                    window.parent.postMessage({ type: 'JS_CONSOLE_ERROR', data: message + " (Line " + lineno + ")" }, '*');
                    return true;
                };
                try {
                    ${code}
                } catch (e) {
                    window.parent.postMessage({ type: 'JS_CONSOLE_ERROR', data: e.message }, '*');
                }
                window.parent.postMessage({ type: 'JS_DONE' }, '*');
            <\/script>
            </body>
            </html>
        `;

        let finished = false;
        const cleanup = () => {
            if (finished) return;
            finished = true;
            window.removeEventListener('message', handleIframeMessage);
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
            setTerminalOutput({
                stdout: logs.join('\\n'),
                stderr: errors.join('\\n'),
                exitCode: errors.length > 0 ? 1 : 0,
                executionTime: Date.now() - startTime,
                error: null
            });
            setIsRunning(false);
        };

        const handleIframeMessage = (event) => {
            if (event.data?.type === 'JS_CONSOLE_LOG') logs.push(event.data.data);
            else if (event.data?.type === 'JS_CONSOLE_ERROR') errors.push(event.data.data);
            else if (event.data?.type === 'JS_DONE') setTimeout(cleanup, 100);
        };

        window.addEventListener('message', handleIframeMessage);
        iframe.srcdoc = iframeSrc;

        setTimeout(cleanup, 5000); // 5s timeout
    };

    const runHtmlLocal = (code) => {
        setPreviewContent(code);
        setActiveTab('preview');
        setTerminalOutput(null);
        setTimeout(() => setIsRunning(false), 300);
    };

    const runCssLocal = (code) => {
        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    ${code}
                </style>
            </head>
            <body style="background:#1e1e1e; color:#cccccc; font-family: sans-serif; padding: 20px;">
                <h1 style="color:#ffffff; border-bottom:1px solid #333; padding-bottom:10px;">CSS Preview Sandbox</h1>
                <p>This paragraph is styled by the CSS editor code above.</p>
                <div class="box" style="margin:20px 0; padding:15px; border:1px dashed #666; display:inline-block;">
                    Class: <code style="color:#f89820">.box</code>
                </div>
                <br />
                <button class="btn" style="padding:6px 12px; cursor:pointer;">
                    Class: <code style="color:#f89820">.btn</code>
                </button>
            </body>
            </html>
        `;
        setPreviewContent(fullHtml);
        setActiveTab('preview');
        setTerminalOutput(null);
        setTimeout(() => setIsRunning(false), 300);
    };

    const handleRunCode = async (language, currentCode) => {
        setIsRunning(true);
        setShowTerminal(true);
        setTerminalOutput(null);

        if (language === 'javascript') {
            runJavaScriptLocal(currentCode);
        } else if (language === 'html') {
            runHtmlLocal(currentCode);
        } else if (language === 'css') {
            runCssLocal(currentCode);
        } else if (language === 'java') {
            setActiveTab('console');
            try {
                await api.post('/execute/run', { sourceCode: currentCode, language, roomId });
            } catch (err) {
                console.error('Code execution failed:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Unknown network error';
                setTerminalOutput({
                    stdout: '',
                    stderr: '',
                    exitCode: null,
                    executionTime: null,
                    error: `Network Error: ${errorMessage}`
                });
                setIsRunning(false);
            }
        } else {
            setIsRunning(false);
        }
    };

    const clearTerminal = () => {
        setTerminalOutput(null);
        setPreviewContent('');
    };

    return {
        isRunning, showTerminal, setShowTerminal, terminalOutput, activeTab, setActiveTab,
        previewContent, handleRunCode, handleExecutionMessage, clearTerminal
    };
};
