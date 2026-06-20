import React from 'react';

const CodeInput = ({ type, value, onChange, placeholder, required, minLength }) => (
    <input
        type={type}
        className="code-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
    />
);

const SubmitButton = ({ loading, label }) => (
    <button type="submit" className="btn-code-submit" disabled={loading}>
        {loading ? <div className="vs-loader-sm" /> : <><span className="play-icon">▶</span> {label}</>}
    </button>
);

const PythonCodeForm = ({ isLogin, email, setEmail, password, setPassword, name, setName, confirmPassword, setConfirmPassword, loading }) => (
    <>
        {/* Flask boilerplate header */}
        <div className="code-line">
            <span className="keyword">from</span> <span className="variable">flask</span> <span className="keyword">import</span> <span className="variable">Flask</span><span className="punctuation">,</span> <span className="variable">request</span><span className="punctuation">,</span> <span className="variable">jsonify</span>
        </div>
        <div className="code-line">
            <span className="keyword">import</span> <span className="variable">auth_service</span> <span className="keyword">as</span> <span className="variable">auth</span>
        </div>
        <div className="code-line" />
        <div className="code-line">
            <span className="variable">app</span> <span className="punctuation">=</span> <span className="function">Flask</span><span className="punctuation">(</span><span className="variable">__name__</span><span className="punctuation">)</span>
        </div>
        <div className="code-line" />

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
                    <CodeInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@domain.com" required />
                    <span className="string">"</span>
                </div>
                <div className="code-line indented">
                    <span className="variable">password</span> <span className="punctuation">=</span> <span className="string">"</span>
                    <CodeInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength="8" />
                    <span className="string">"</span>
                </div>
                <div className="code-line indented submit-line-embedded">
                    <span className="keyword">return</span> <span className="function">jsonify</span><span className="punctuation">(</span><span className="variable">auth</span><span className="punctuation">.</span><span className="function">sign_in</span><span className="punctuation">(</span><span className="variable">email</span><span className="punctuation">,</span> <span className="variable">password</span><span className="punctuation">))</span>
                    <SubmitButton loading={loading} label="RUN FLASK" />
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
                    <CodeInput type="text" value={name} onChange={e => setName(e.target.value)} placeholder="your name" required />
                    <span className="string">"</span><span className="punctuation">,</span>
                </div>
                <div className="code-line double-indented">
                    <span className="string">"email"</span><span className="punctuation">:</span> <span className="string">"</span>
                    <CodeInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" required />
                    <span className="string">"</span><span className="punctuation">,</span>
                </div>
                <div className="code-line double-indented">
                    <span className="string">"password"</span><span className="punctuation">:</span> <span className="string">"</span>
                    <CodeInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength="8" />
                    <span className="string">"</span><span className="punctuation">,</span>
                </div>
                <div className="code-line double-indented">
                    <span className="string">"confirmPassword"</span><span className="punctuation">:</span> <span className="string">"</span>
                    <CodeInput type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                    <span className="string">"</span>
                </div>
                <div className="code-line indented"><span className="punctuation">{"}"}</span></div>
                <div className="code-line indented submit-line-embedded">
                    <span className="keyword">return</span> <span className="function">jsonify</span><span className="punctuation">(</span><span className="variable">auth</span><span className="punctuation">.</span><span className="function">sign_up</span><span className="punctuation">(</span><span className="variable">dev</span><span className="punctuation">))</span>
                    <SubmitButton loading={loading} label="RUN FLASK" />
                </div>
            </>
        )}
    </>
);

export default PythonCodeForm;
