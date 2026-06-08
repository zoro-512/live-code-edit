import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [editorLanguage, setEditorLanguage] = useState('javascript');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        
        if (!email || !password) {
            setError('Please fill in all required fields.');
            return;
        }
 
        if (!isLogin && !name) {
            setError('Please provide your name.');
            return;
        }
 
        if (!isLogin && password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
 
        if (!isLogin && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
 
        setLoading(true);
 
        if (isLogin) {
            const res = await login(email, password);
            if (res.success) {
                navigate('/dashboard');
            } else {
                setError(res.message);
            }
        } else {
            const res = await register(name, email, password);
            if (res.success) {
                setSuccessMsg('Account registered successfully! Please sign in.');
                setIsLogin(true);
                // Clear fields
                setName('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setError(res.message);
            }
        }
        
        setLoading(false);
    };

    // Helper to get tab details based on selected language
    const getTabName = (tabForLogin) => {
        if (editorLanguage === 'java') {
            return tabForLogin ? 'LoginController.java' : 'SignUpController.java';
        } else if (editorLanguage === 'javascript') {
            return tabForLogin ? 'login.js' : 'signup.js';
        } else {
            return tabForLogin ? 'login.py' : 'signup.py';
        }
    };

    const getTabIcon = () => {
        if (editorLanguage === 'java') return <span className="file-icon java">☕</span>;
        if (editorLanguage === 'javascript') return <span className="file-icon js">JS</span>;
        return <span className="file-icon py">PY</span>;
    };

    const getGutterLineCount = () => {
        if (editorLanguage === 'java') return isLogin ? 20 : 23;
        if (editorLanguage === 'javascript') return isLogin ? 12 : 14;
        return isLogin ? 11 : 14;
    };

    return (
        <div className="auth-wrapper flex-column">
            {/* Project Brand Header without triangle logo */}
            <div className="auth-brand-header">
                <h2>Collaborative Code Editor</h2>
            </div>

            <div className="code-editor-card">
                {/* Editor Tab Header */}
                <div className="editor-tab-header">
                    <div className="editor-tabs-container">
                        <div className={`editor-tab ${isLogin ? 'active' : ''}`} onClick={() => { if(!isLogin) { setIsLogin(true); setError(''); setSuccessMsg(''); } }}>
                            {getTabIcon()}
                            <span className="file-name">{getTabName(true)}</span>
                            {isLogin && <span className="tab-dot"></span>}
                        </div>
                        <div className={`editor-tab ${!isLogin ? 'active' : ''}`} onClick={() => { if(isLogin) { setIsLogin(false); setError(''); setSuccessMsg(''); } }}>
                            {getTabIcon()}
                            <span className="file-name">{getTabName(false)}</span>
                            {!isLogin && <span className="tab-dot"></span>}
                        </div>
                    </div>
                    
                    <div className="editor-actions-top">
                        {/* Selector to switch code language */}
                        <select 
                            value={editorLanguage} 
                            onChange={(e) => {
                                setEditorLanguage(e.target.value);
                                setError('');
                                setSuccessMsg('');
                            }} 
                            className="vs-lang-selector"
                            title="Select syntax language"
                        >
                            <option value="java">Java</option>
                            <option value="javascript">JS</option>
                            <option value="python">Python</option>
                        </select>
                        <div className="window-dots-mock-container">
                            <span className="window-dot-mock red"></span>
                            <span className="window-dot-mock yellow"></span>
                            <span className="window-dot-mock green"></span>
                        </div>
                    </div>
                </div>

                <div className="editor-body">
                    {/* Line Number Gutter */}
                    <div className="editor-gutter">
                        {Array.from({ length: getGutterLineCount() }).map((_, i) => (
                            <div key={i} className="line-num">{i + 1}</div>
                        ))}
                    </div>

                    {/* Active Code Form Area */}
                    <div className="editor-content-area">
                        <form onSubmit={handleSubmit} className="code-form">
                            {/* DYNAMIC CODE RENDERING BASED ON LANGUAGE SELECTOR */}
                            {editorLanguage === 'java' && (
                                <>
                                    <div className="code-line">
                                        <span className="keyword">package</span> <span className="variable">com.cbc.auth</span><span className="punctuation">;</span>
                                    </div>
                                    <div className="code-line"></div>
                                    <div className="code-line">
                                        <span className="keyword">import</span> <span className="variable">org.springframework.beans.factory.annotation.Autowired</span><span className="punctuation">;</span>
                                    </div>
                                    <div className="code-line">
                                        <span className="keyword">import</span> <span className="variable">org.springframework.web.bind.annotation.*</span><span className="punctuation">;</span>
                                    </div>
                                    <div className="code-line"></div>
                                    <div className="code-line">
                                        <span className="annotation">@RestController</span>
                                    </div>
                                    <div className="code-line">
                                        <span className="annotation">@RequestMapping</span><span className="punctuation">(</span><span className="string">"/auth"</span><span className="punctuation">)</span>
                                    </div>
                                    <div className="code-line">
                                        <span className="keyword">public class</span> <span className="class-name">{isLogin ? 'LoginController' : 'SignUpController'}</span> <span className="punctuation">{"{"}</span>
                                    </div>
                                    <div className="code-line"></div>
                                    <div className="code-line indented">
                                        <span className="annotation">@Autowired</span>
                                    </div>
                                    <div className="code-line indented">
                                        <span className="keyword">private</span> <span className="class-name">AuthService</span> <span className="variable">auth</span><span className="punctuation">;</span>
                                    </div>
                                    <div className="code-line"></div>

                                    {isLogin ? (
                                        <>
                                            <div className="code-line indented">
                                                <span className="annotation">@PostMapping</span><span className="punctuation">(</span><span className="string">"/login"</span><span className="punctuation">)</span>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="keyword">public</span> <span className="class-name">ResponseEntity</span><span className="punctuation">&lt;</span><span className="class-name">String</span><span className="punctuation">&gt;</span> <span className="function">login</span><span className="punctuation">() {"{"}</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="keyword">return</span> <span className="variable">auth</span><span className="punctuation">.</span><span className="function">signIn</span><span className="punctuation">(</span>
                                            </div>
                                            <div className="code-line triple-indented">
                                                <span className="punctuation">"</span>
                                                <input 
                                                    type="email" 
                                                    className="code-input"
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)} 
                                                    placeholder="email@domain.com"
                                                    required 
                                                />
                                                <span className="punctuation">"</span><span className="punctuation">,</span>
                                            </div>
                                            <div className="code-line triple-indented">
                                                <span className="punctuation">"</span>
                                                <input 
                                                    type="password" 
                                                    className="code-input"
                                                    value={password} 
                                                    onChange={(e) => setPassword(e.target.value)} 
                                                    placeholder="••••••••"
                                                    required 
                                                    minLength="8"
                                                />
                                                <span className="punctuation">"</span>
                                            </div>
                                            <div className="code-line double-indented submit-line-embedded">
                                                <span className="punctuation">);</span>
                                                <button type="submit" className="btn-code-submit" disabled={loading}>
                                                    {loading ? <div className="vs-loader-sm"></div> : <><span className="play-icon">▶</span> RUN SERVICE</>}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="code-line indented">
                                                <span className="annotation">@PostMapping</span><span className="punctuation">(</span><span className="string">"/signup"</span><span className="punctuation">)</span>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="keyword">public</span> <span className="class-name">ResponseEntity</span><span className="punctuation">&lt;</span><span className="class-name">String</span><span className="punctuation">&gt;</span> <span className="function">register</span><span className="punctuation">() {"{"}</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="class-name">User</span> <span className="variable">dev</span> <span className="punctuation">= new</span> <span className="class-name">User</span><span className="punctuation">();</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="variable">dev</span><span className="punctuation">.</span><span className="function">setName</span><span className="punctuation">(</span><span className="punctuation">"</span>
                                                <input 
                                                    type="text" 
                                                    className="code-input"
                                                    value={name} 
                                                    onChange={(e) => setName(e.target.value)} 
                                                    placeholder="your name"
                                                    required 
                                                />
                                                <span className="punctuation">"</span><span className="punctuation">);</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="variable">dev</span><span className="punctuation">.</span><span className="function">setEmail</span><span className="punctuation">(</span><span className="punctuation">"</span>
                                                <input 
                                                    type="email" 
                                                    className="code-input"
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)} 
                                                    placeholder="name@domain.com"
                                                    required 
                                                />
                                                <span className="punctuation">"</span><span className="punctuation">);</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="variable">dev</span><span className="punctuation">.</span><span className="function">setPassword</span><span className="punctuation">(</span><span className="punctuation">"</span>
                                                <input 
                                                    type="password" 
                                                    className="code-input"
                                                    value={password} 
                                                    onChange={(e) => setPassword(e.target.value)} 
                                                    placeholder="••••••••"
                                                    required 
                                                    minLength="8"
                                                />
                                                <span className="punctuation">"</span><span className="punctuation">);</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="variable">dev</span><span className="punctuation">.</span><span className="function">setConfirmPassword</span><span className="punctuation">(</span><span className="punctuation">"</span>
                                                <input 
                                                    type="password" 
                                                    className="code-input"
                                                    value={confirmPassword} 
                                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                                    placeholder="••••••••"
                                                    required 
                                                />
                                                <span className="punctuation">"</span><span className="punctuation">);</span>
                                            </div>
                                            <div className="code-line double-indented submit-line-embedded">
                                                <span className="keyword">return</span> <span className="variable">auth</span><span className="punctuation">.</span><span className="function">signUp</span><span className="punctuation">(</span><span className="variable">dev</span><span className="punctuation">);</span>
                                                <button type="submit" className="btn-code-submit" disabled={loading}>
                                                    {loading ? <div className="vs-loader-sm"></div> : <><span className="play-icon">▶</span> RUN SERVICE</>}
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    <div className="code-line indented">
                                        <span className="punctuation">{"}"}</span>
                                    </div>
                                    <div className="code-line">
                                        <span className="punctuation">{"}"}</span>
                                    </div>
                                </>
                            )}

                            {editorLanguage === 'javascript' && (
                                <>
                                    <div className="code-line">
                                        <span className="keyword">const</span> <span className="variable">express</span> <span className="punctuation">=</span> <span className="function">require</span><span className="punctuation">(</span><span className="string">'express'</span><span className="punctuation">);</span>
                                    </div>
                                    <div className="code-line">
                                        <span className="keyword">const</span> <span className="variable">auth</span> <span className="punctuation">=</span> <span className="function">require</span><span className="punctuation">(</span><span className="string">'collaborative-code-editor'</span><span className="punctuation">);</span>
                                    </div>
                                    <div className="code-line">
                                        <span className="keyword">const</span> <span className="variable">app</span> <span className="punctuation">=</span> <span className="variable">express</span><span className="punctuation">();</span>
                                    </div>
                                    <div className="code-line"></div>

                                    {isLogin ? (
                                        <>
                                            <div className="code-line">
                                                <span className="variable">app</span><span className="punctuation">.</span><span className="function">post</span><span className="punctuation">(</span><span className="string">'/auth/login'</span><span className="punctuation">,</span> <span className="keyword">async</span> <span className="punctuation">(</span><span className="variable">req</span><span className="punctuation">,</span> <span className="variable">res</span><span className="punctuation">) =&gt;</span> <span className="punctuation">{"{"}</span>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="keyword">const</span> <span className="punctuation">{"{"}</span> <span className="variable">email</span><span className="punctuation">,</span> <span className="variable">password</span> <span className="punctuation">{"}"}</span> <span className="punctuation">=</span> <span className="variable">req</span><span className="punctuation">.</span><span className="variable">body</span><span className="punctuation">;</span>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="keyword">const</span> <span className="variable">userEmail</span> <span className="punctuation">=</span> <span className="string">"</span>
                                                <input 
                                                    type="email" 
                                                    className="code-input"
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)} 
                                                    placeholder="email@domain.com"
                                                    required 
                                                />
                                                <span className="string">"</span><span className="punctuation">;</span>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="keyword">const</span> <span className="variable">userPass</span> <span className="punctuation">=</span> <span className="string">"</span>
                                                <input 
                                                    type="password" 
                                                    className="code-input"
                                                    value={password} 
                                                    onChange={(e) => setPassword(e.target.value)} 
                                                    placeholder="••••••••"
                                                    required 
                                                    minLength="8"
                                                />
                                                <span className="string">"</span><span className="punctuation">;</span>
                                            </div>
                                            <div className="code-line indented submit-line-embedded">
                                                <span className="keyword">const</span> <span className="variable">token</span> <span className="punctuation">=</span> <span className="keyword">await</span> <span className="variable">auth</span><span className="punctuation">.</span><span className="function">login</span><span className="punctuation">(</span><span className="variable">userEmail</span><span className="punctuation">,</span> <span className="variable">userPass</span><span className="punctuation">);</span>
                                                <button type="submit" className="btn-code-submit" disabled={loading}>
                                                    {loading ? <div className="vs-loader-sm"></div> : <><span className="play-icon">▶</span> RUN EXPRESS</>}
                                                </button>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="variable">res</span><span className="punctuation">.</span><span className="function">json</span><span className="punctuation">({"{"}</span> <span className="variable">token</span> <span className="punctuation">{"}"}</span><span className="punctuation">);</span>
                                            </div>
                                            <div className="code-line">
                                                <span className="punctuation">{"}"}</span><span className="punctuation">);</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="code-line">
                                                <span className="variable">app</span><span className="punctuation">.</span><span className="function">post</span><span className="punctuation">(</span><span className="string">'/auth/signup'</span><span className="punctuation">,</span> <span className="keyword">async</span> <span className="punctuation">(</span><span className="variable">req</span><span className="punctuation">,</span> <span className="variable">res</span><span className="punctuation">) =&gt;</span> <span className="punctuation">{"{"}</span>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="keyword">const</span> <span className="variable">dev</span> <span className="punctuation">=</span> <span className="punctuation">{"{"}</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="key">name</span><span className="punctuation">:</span> <span className="string">"</span>
                                                <input 
                                                    type="text" 
                                                    className="code-input"
                                                    value={name} 
                                                    onChange={(e) => setName(e.target.value)} 
                                                    placeholder="your name"
                                                    required 
                                                />
                                                <span className="string">"</span><span className="punctuation">,</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="key">email</span><span className="punctuation">:</span> <span className="string">"</span>
                                                <input 
                                                    type="email" 
                                                    className="code-input"
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)} 
                                                    placeholder="name@domain.com"
                                                    required 
                                                />
                                                <span className="string">"</span><span className="punctuation">,</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="key">password</span><span className="punctuation">:</span> <span className="string">"</span>
                                                <input 
                                                    type="password" 
                                                    className="code-input"
                                                    value={password} 
                                                    onChange={(e) => setPassword(e.target.value)} 
                                                    placeholder="••••••••"
                                                    required 
                                                    minLength="8"
                                                />
                                                <span className="string">"</span><span className="punctuation">,</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="key">confirmPassword</span><span className="punctuation">:</span> <span className="string">"</span>
                                                <input 
                                                    type="password" 
                                                    className="code-input"
                                                    value={confirmPassword} 
                                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                                    placeholder="••••••••"
                                                    required 
                                                />
                                                <span className="string">"</span>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="punctuation">{"}"}</span><span className="punctuation">;</span>
                                            </div>
                                            <div className="code-line indented submit-line-embedded">
                                                <span className="keyword">const</span> <span className="variable">result</span> <span className="punctuation">=</span> <span className="keyword">await</span> <span className="variable">auth</span><span className="punctuation">.</span><span className="function">register</span><span className="punctuation">(</span><span className="variable">dev</span><span className="punctuation">);</span>
                                                <button type="submit" className="btn-code-submit" disabled={loading}>
                                                    {loading ? <div className="vs-loader-sm"></div> : <><span className="play-icon">▶</span> RUN EXPRESS</>}
                                                </button>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="variable">res</span><span className="punctuation">.</span><span className="function">json</span><span className="punctuation">(</span><span className="variable">result</span><span className="punctuation">);</span>
                                            </div>
                                            <div className="code-line">
                                                <span className="punctuation">{"}"}</span><span className="punctuation">);</span>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}

                            {editorLanguage === 'python' && (
                                <>
                                    <div className="code-line">
                                        <span className="keyword">from</span> <span className="variable">flask</span> <span className="keyword">import</span> <span className="variable">Flask</span><span className="punctuation">,</span> <span className="variable">request</span><span className="punctuation">,</span> <span className="variable">jsonify</span>
                                    </div>
                                    <div className="code-line">
                                        <span className="keyword">import</span> <span className="variable">auth_service</span> <span className="keyword">as</span> <span className="variable">auth</span>
                                    </div>
                                    <div className="code-line"></div>
                                    <div className="code-line">
                                        <span className="variable">app</span> <span className="punctuation">=</span> <span className="function">Flask</span><span className="punctuation">(</span><span className="variable">__name__</span><span className="punctuation">)</span>
                                    </div>
                                    <div className="code-line"></div>

                                    {isLogin ? (
                                        <>
                                            <div className="code-line">
                                                <span className="annotation">@app.route</span><span className="punctuation">(</span><span className="string">'/auth/login'</span><span className="punctuation">,</span> <span className="variable">methods</span><span className="punctuation">=[</span><span className="string">'POST'</span><span className="punctuation">])</span>
                                            </div>
                                            <div className="code-line">
                                                <span className="keyword">def</span> <span className="function">login</span><span className="punctuation">():</span>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="variable">email</span> <span className="punctuation">=</span> <span className="string">"</span>
                                                <input 
                                                    type="email" 
                                                    className="code-input"
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)} 
                                                    placeholder="email@domain.com"
                                                    required 
                                                />
                                                <span className="string">"</span>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="variable">password</span> <span className="punctuation">=</span> <span className="string">"</span>
                                                <input 
                                                    type="password" 
                                                    className="code-input"
                                                    value={password} 
                                                    onChange={(e) => setPassword(e.target.value)} 
                                                    placeholder="••••••••"
                                                    required 
                                                    minLength="8"
                                                />
                                                <span className="string">"</span>
                                            </div>
                                            <div className="code-line indented submit-line-embedded">
                                                <span className="keyword">return</span> <span className="function">jsonify</span><span className="punctuation">(</span><span className="variable">auth</span><span className="punctuation">.</span><span className="function">sign_in</span><span className="punctuation">(</span><span className="variable">email</span><span className="punctuation">,</span> <span className="variable">password</span><span className="punctuation">))</span>
                                                <button type="submit" className="btn-code-submit" disabled={loading}>
                                                    {loading ? <div className="vs-loader-sm"></div> : <><span className="play-icon">▶</span> RUN FLASK</>}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="code-line">
                                                <span className="annotation">@app.route</span><span className="punctuation">(</span><span className="string">'/auth/signup'</span><span className="punctuation">,</span> <span className="variable">methods</span><span className="punctuation">=[</span><span className="string">'POST'</span><span className="punctuation">])</span>
                                            </div>
                                            <div className="code-line">
                                                <span className="keyword">def</span> <span className="function">register</span><span className="punctuation">():</span>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="variable">dev</span> <span className="punctuation">=</span> <span className="punctuation">{"{"}</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="string">"name"</span><span className="punctuation">:</span> <span className="string">"</span>
                                                <input 
                                                    type="text" 
                                                    className="code-input"
                                                    value={name} 
                                                    onChange={(e) => setName(e.target.value)} 
                                                    placeholder="your name"
                                                    required 
                                                />
                                                <span className="string">"</span><span className="punctuation">,</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="string">"email"</span><span className="punctuation">:</span> <span className="string">"</span>
                                                <input 
                                                    type="email" 
                                                    className="code-input"
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)} 
                                                    placeholder="name@domain.com"
                                                    required 
                                                />
                                                <span className="string">"</span><span className="punctuation">,</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="string">"password"</span><span className="punctuation">:</span> <span className="string">"</span>
                                                <input 
                                                    type="password" 
                                                    className="code-input"
                                                    value={password} 
                                                    onChange={(e) => setPassword(e.target.value)} 
                                                    placeholder="••••••••"
                                                    required 
                                                    minLength="8"
                                                />
                                                <span className="string">"</span><span className="punctuation">,</span>
                                            </div>
                                            <div className="code-line double-indented">
                                                <span className="string">"confirmPassword"</span><span className="punctuation">:</span> <span className="string">"</span>
                                                <input 
                                                    type="password" 
                                                    className="code-input"
                                                    value={confirmPassword} 
                                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                                    placeholder="••••••••"
                                                    required 
                                                />
                                                <span className="string">"</span>
                                            </div>
                                            <div className="code-line indented">
                                                <span className="punctuation">{"}"}</span>
                                            </div>
                                            <div className="code-line indented submit-line-embedded">
                                                <span className="keyword">return</span> <span className="function">jsonify</span><span className="punctuation">(</span><span className="variable">auth</span><span className="punctuation">.</span><span className="function">sign_up</span><span className="punctuation">(</span><span className="variable">dev</span><span className="punctuation">))</span>
                                                <button type="submit" className="btn-code-submit" disabled={loading}>
                                                    {loading ? <div className="vs-loader-sm"></div> : <><span className="play-icon">▶</span> RUN FLASK</>}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </form>

                        {error && <div className="auth-message error">{error}</div>}
                        {successMsg && <div className="auth-message success">{successMsg}</div>}
                    </div>
                </div>

                {/* Bottom Status bar */}
                <div className="editor-status-bar">
                    <div className="status-bar-left">
                        <span className="status-item green-check">✔ Connected</span>
                        <span className="status-item clickable" onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}>
                            ⚡ Switch to {isLogin ? 'Sign Up' : 'Sign In'}
                        </span>
                    </div>
                    <div className="status-bar-right">
                        <span className="status-item">Ln {isLogin ? '18' : '21'}, Col 45</span>
                        <span className="status-item">{editorLanguage === 'java' ? 'Java' : editorLanguage === 'javascript' ? 'JS' : 'Python'}</span>
                        <span className="status-item">UTF-8</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
