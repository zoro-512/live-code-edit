import React, { useState } from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import JavaCodeForm from '../components/auth/JavaCodeForm';
import JavaScriptCodeForm from '../components/auth/JavaScriptCodeForm';
import PythonCodeForm from '../components/auth/PythonCodeForm';

const TAB_ICONS = {
    java:       <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: '#f89820', color: '#fff' }}>☕</span>,
    javascript: <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: '#f7df1e', color: '#000' }}>JS</span>,
    python:     <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: '#3572a5', color: '#ffd43b' }}>PY</span>,
};

const TAB_NAMES = {
    java:       { login: 'LoginController.java',  signup: 'SignUpController.java' },
    javascript: { login: 'login.js',              signup: 'signup.js' },
    python:     { login: 'login.py',              signup: 'signup.py' },
};

const GUTTER_LINES = {
    java:       { login: 20, signup: 22 },
    javascript: { login: 12, signup: 14 },
    python:     { login: 11, signup: 14 },
};

const Auth = () => {
    const [lang, setLang] = useState('java');
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
    const gutterCount = GUTTER_LINES[lang][mode];
    const formProps = { isLogin, email, setEmail, password, setPassword, name, setName, confirmPassword, setConfirmPassword, loading };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#0c0d10', fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif",
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Background glow blobs */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', filter: 'blur(120px)', opacity: 0.12, background: '#6366f1', top: -100, left: -80 }} />
                <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.08, background: '#007acc', bottom: -80, right: -60 }} />
                {/* Dot grid */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 0)',
                    backgroundSize: '28px 28px',
                }} />
            </div>

            {/* Brand */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="8" height="8" rx="1.5" fill="white"/>
                        <rect x="13" y="3" width="8" height="8" rx="1.5" fill="white" opacity=".7"/>
                        <rect x="3" y="13" width="8" height="8" rx="1.5" fill="white" opacity=".7"/>
                        <rect x="13" y="13" width="8" height="8" rx="1.5" fill="white" opacity=".4"/>
                    </svg>
                </div>
                <span style={{
                    fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px',
                    background: 'linear-gradient(135deg,#fff 40%,#a5b4fc)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>CodeCollab</span>
            </div>

            {/* Editor card */}
            <div style={{
                position: 'relative', zIndex: 10, width: 760,
                background: '#1e1e1e', borderRadius: 12,
                border: '1px solid #333',
                boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.08)',
                overflow: 'hidden',
            }}>
                {/* Tab header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#252526', borderBottom: '1px solid #1e1e1e', height: 38,
                }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', height: '100%' }}>
                        {[true, false].map(forLogin => (
                            <div
                                key={String(forLogin)}
                                onClick={() => (isLogin !== forLogin) && switchMode(forLogin)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '0 18px', height: '100%', cursor: 'pointer',
                                    borderRight: '1px solid #1e1e1e',
                                    background: isLogin === forLogin ? '#1e1e1e' : 'transparent',
                                    color: isLogin === forLogin ? '#fff' : '#858585',
                                    borderTop: isLogin === forLogin ? '2px solid #6366f1' : '2px solid transparent',
                                    fontSize: 12, transition: 'all .15s',
                                }}
                            >
                                {TAB_ICONS[lang]}
                                <span>{TAB_NAMES[lang][forLogin ? 'login' : 'signup']}</span>
                                {isLogin === forLogin && (
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', marginLeft: 2 }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Right controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 16 }}>
                        <select
                            value={lang}
                            onChange={e => setLang(e.target.value)}
                            style={{ background: '#0c0d10', color: '#ccc', border: '1px solid #333', borderRadius: 4, padding: '3px 8px', fontSize: 11, outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="java">Java</option>
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                        </select>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['#ef4444','#f59e0b','#10b981'].map(c => (
                                <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.85 }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor body */}
                <div style={{ display: 'flex', minHeight: 380, background: '#1e1e1e' }}>
                    {/* Line gutter */}
                    <div style={{
                        width: 48, flexShrink: 0, background: '#1e1e1e',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
                        padding: '24px 10px 24px 0', userSelect: 'none',
                        fontFamily: "'Fira Code', Consolas, monospace", fontSize: 13,
                        lineHeight: '28px', color: '#858585',
                    }}>
                        {Array.from({ length: gutterCount }).map((_, i) => (
                            <div key={i} style={{ height: 28, textAlign: 'right', width: '100%' }}>{i + 1}</div>
                        ))}
                    </div>

                    {/* Form content */}
                    <div style={{ flex: 1, padding: '24px 32px', overflowX: 'auto' }}>
                        <form onSubmit={handleSubmit} className="code-form">
                            {lang === 'java'       && <JavaCodeForm       {...formProps} />}
                            {lang === 'javascript' && <JavaScriptCodeForm {...formProps} />}
                            {lang === 'python'     && <PythonCodeForm     {...formProps} />}
                        </form>

                        {error && (
                            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 6, fontFamily: "'Fira Code', monospace", fontSize: 12.5, background: 'rgba(239,68,68,0.07)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.15)' }}>
                                ✖ {error}
                            </div>
                        )}
                        {successMsg && (
                            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 6, fontFamily: "'Fira Code', monospace", fontSize: 12.5, background: 'rgba(16,185,129,0.07)', color: '#a7f3d0', border: '1px solid rgba(16,185,129,0.15)' }}>
                                ✓ {successMsg}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 12px', height: 24, background: '#007acc', color: '#fff', fontSize: 11.5,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a7f3d0' }} />
                            Connected
                        </span>
                        <span
                            onClick={() => switchMode(!isLogin)}
                            style={{ cursor: 'pointer', opacity: 0.85 }}
                            onMouseEnter={e => e.target.style.opacity = 1}
                            onMouseLeave={e => e.target.style.opacity = 0.85}
                        >
                            ⚡ Switch to {isLogin ? 'Sign Up' : 'Sign In'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: 0.8 }}>
                        <span>Ln {isLogin ? '18' : '21'}, Col 45</span>
                        <span>{lang === 'java' ? 'Java' : lang === 'javascript' ? 'JS' : 'Python'}</span>
                        <span>UTF-8</span>
                    </div>
                </div>
            </div>

            {/* Tagline */}
            <p style={{ position: 'relative', zIndex: 10, marginTop: 20, fontSize: 11.5, color: '#3d3d47', textAlign: 'center' }}>
                Real-time collaborative coding · WebSockets + Yjs
            </p>
        </div>
    );
};

export default Auth;
