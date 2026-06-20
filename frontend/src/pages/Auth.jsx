import React, { useState } from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import JavaCodeForm from '../components/auth/JavaCodeForm';
import JavaScriptCodeForm from '../components/auth/JavaScriptCodeForm';
import PythonCodeForm from '../components/auth/PythonCodeForm';

// Maps language → tab icon element
const TAB_ICONS = {
    java:       <span className="file-icon java">☕</span>,
    javascript: <span className="file-icon js">JS</span>,
    python:     <span className="file-icon py">PY</span>,
};

// Maps language + mode → filename shown in the tab
const TAB_NAMES = {
    java:       { login: 'LoginController.java',  signup: 'SignUpController.java' },
    javascript: { login: 'login.js',              signup: 'signup.js' },
    python:     { login: 'login.py',              signup: 'signup.py' },
};

// Line count for the gutter per language + mode
const GUTTER_LINES = {
    java:       { login: 20, signup: 22 },
    javascript: { login: 12, signup: 14 },
    python:     { login: 11, signup: 14 },
};

const Auth = () => {
    const [editorLanguage, setEditorLanguage] = useState('java');

    const {
        isLogin, switchMode,
        name, setName,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        error, successMsg, loading,
        handleSubmit,
    } = useAuthForm();

    const mode = isLogin ? 'login' : 'signup';
    const tabIcon = TAB_ICONS[editorLanguage];
    const tabName = (forLogin) => TAB_NAMES[editorLanguage][forLogin ? 'login' : 'signup'];
    const gutterCount = GUTTER_LINES[editorLanguage][mode];

    const formProps = { isLogin, email, setEmail, password, setPassword, name, setName, confirmPassword, setConfirmPassword, loading };

    return (
        <div className="auth-wrapper flex-column">
            <div className="auth-brand-header">
                <h2>Collaborative Code Editor</h2>
            </div>

            <div className="code-editor-card">
                {/* ── Tab Header ── */}
                <div className="editor-tab-header">
                    <div className="editor-tabs-container">
                        <div
                            className={`editor-tab ${isLogin ? 'active' : ''}`}
                            onClick={() => !isLogin && switchMode(true)}
                        >
                            {tabIcon}
                            <span className="file-name">{tabName(true)}</span>
                            {isLogin && <span className="tab-dot" />}
                        </div>
                        <div
                            className={`editor-tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => isLogin && switchMode(false)}
                        >
                            {tabIcon}
                            <span className="file-name">{tabName(false)}</span>
                            {!isLogin && <span className="tab-dot" />}
                        </div>
                    </div>

                    <div className="editor-actions-top">
                        <select
                            value={editorLanguage}
                            onChange={(e) => { setEditorLanguage(e.target.value); }}
                            className="vs-lang-selector"
                            title="Select syntax language"
                        >
                            <option value="java">Java</option>
                            <option value="javascript">JS</option>
                            <option value="python">Python</option>
                        </select>
                        <div className="window-dots-mock-container">
                            <span className="window-dot-mock red" />
                            <span className="window-dot-mock yellow" />
                            <span className="window-dot-mock green" />
                        </div>
                    </div>
                </div>

                {/* ── Editor Body ── */}
                <div className="editor-body">
                    {/* Line number gutter */}
                    <div className="editor-gutter">
                        {Array.from({ length: gutterCount }).map((_, i) => (
                            <div key={i} className="line-num">{i + 1}</div>
                        ))}
                    </div>

                    {/* Code form content */}
                    <div className="editor-content-area">
                        <form onSubmit={handleSubmit} className="code-form">
                            {editorLanguage === 'java'       && <JavaCodeForm       {...formProps} />}
                            {editorLanguage === 'javascript' && <JavaScriptCodeForm {...formProps} />}
                            {editorLanguage === 'python'     && <PythonCodeForm     {...formProps} />}
                        </form>

                        {error      && <div className="auth-message error">{error}</div>}
                        {successMsg && <div className="auth-message success">{successMsg}</div>}
                    </div>
                </div>

                {/* ── Status Bar ── */}
                <div className="editor-status-bar">
                    <div className="status-bar-left">
                        <span className="status-item green-check">✔ Connected</span>
                        <span
                            className="status-item clickable"
                            onClick={() => switchMode(!isLogin)}
                        >
                            ⚡ Switch to {isLogin ? 'Sign Up' : 'Sign In'}
                        </span>
                    </div>
                    <div className="status-bar-right">
                        <span className="status-item">Ln {isLogin ? '18' : '21'}, Col 45</span>
                        <span className="status-item">
                            {editorLanguage === 'java' ? 'Java' : editorLanguage === 'javascript' ? 'JS' : 'Python'}
                        </span>
                        <span className="status-item">UTF-8</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
