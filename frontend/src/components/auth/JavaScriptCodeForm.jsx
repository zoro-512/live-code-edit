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

const JavaScriptCodeForm = ({ isLogin, email, setEmail, password, setPassword, name, setName, confirmPassword, setConfirmPassword, loading }) => (
    <>
        {/* Express boilerplate header */}
        <div className="code-line">
            <span className="keyword">const</span> <span className="variable">express</span> <span className="punctuation">=</span> <span className="function">require</span><span className="punctuation">(</span><span className="string">'express'</span><span className="punctuation">);</span>
        </div>
        <div className="code-line">
            <span className="keyword">const</span> <span className="variable">auth</span> <span className="punctuation">=</span> <span className="function">require</span><span className="punctuation">(</span><span className="string">'collaborative-code-editor'</span><span className="punctuation">);</span>
        </div>
        <div className="code-line">
            <span className="keyword">const</span> <span className="variable">app</span> <span className="punctuation">=</span> <span className="variable">express</span><span className="punctuation">();</span>
        </div>
        <div className="code-line" />

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
                    <CodeInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@domain.com" required />
                    <span className="string">"</span><span className="punctuation">;</span>
                </div>
                <div className="code-line indented">
                    <span className="keyword">const</span> <span className="variable">userPass</span> <span className="punctuation">=</span> <span className="string">"</span>
                    <CodeInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength="8" />
                    <span className="string">"</span><span className="punctuation">;</span>
                </div>
                <div className="code-line indented submit-line-embedded">
                    <span className="keyword">const</span> <span className="variable">token</span> <span className="punctuation">=</span> <span className="keyword">await</span> <span className="variable">auth</span><span className="punctuation">.</span><span className="function">login</span><span className="punctuation">(</span><span className="variable">userEmail</span><span className="punctuation">,</span> <span className="variable">userPass</span><span className="punctuation">);</span>
                    <SubmitButton loading={loading} label="RUN EXPRESS" />
                </div>
                <div className="code-line indented">
                    <span className="variable">res</span><span className="punctuation">.</span><span className="function">json</span><span className="punctuation">({"{"}</span> <span className="variable">token</span> <span className="punctuation">{"}"});</span>
                </div>
                <div className="code-line"><span className="punctuation">{"}"});</span></div>
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
                    <CodeInput type="text" value={name} onChange={e => setName(e.target.value)} placeholder="your name" required />
                    <span className="string">"</span><span className="punctuation">,</span>
                </div>
                <div className="code-line double-indented">
                    <span className="key">email</span><span className="punctuation">:</span> <span className="string">"</span>
                    <CodeInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" required />
                    <span className="string">"</span><span className="punctuation">,</span>
                </div>
                <div className="code-line double-indented">
                    <span className="key">password</span><span className="punctuation">:</span> <span className="string">"</span>
                    <CodeInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength="8" />
                    <span className="string">"</span><span className="punctuation">,</span>
                </div>
                <div className="code-line double-indented">
                    <span className="key">confirmPassword</span><span className="punctuation">:</span> <span className="string">"</span>
                    <CodeInput type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                    <span className="string">"</span>
                </div>
                <div className="code-line indented"><span className="punctuation">{"}"}</span><span className="punctuation">;</span></div>
                <div className="code-line indented submit-line-embedded">
                    <span className="keyword">const</span> <span className="variable">result</span> <span className="punctuation">=</span> <span className="keyword">await</span> <span className="variable">auth</span><span className="punctuation">.</span><span className="function">register</span><span className="punctuation">(</span><span className="variable">dev</span><span className="punctuation">);</span>
                    <SubmitButton loading={loading} label="RUN EXPRESS" />
                </div>
                <div className="code-line indented">
                    <span className="variable">res</span><span className="punctuation">.</span><span className="function">json</span><span className="punctuation">(</span><span className="variable">result</span><span className="punctuation">);</span>
                </div>
                <div className="code-line"><span className="punctuation">{"}"});</span></div>
            </>
        )}
    </>
);

export default JavaScriptCodeForm;
