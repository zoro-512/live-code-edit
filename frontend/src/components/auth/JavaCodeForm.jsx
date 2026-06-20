import React from 'react';

// Reusable input wrapped in code syntax styling
const CodeInput = ({ type, value, onChange, placeholder, required, minLength, className = 'code-input' }) => (
    <input
        type={type}
        className={className}
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

const JavaCodeForm = ({ isLogin, email, setEmail, password, setPassword, name, setName, confirmPassword, setConfirmPassword, loading }) => (
    <>
        {/* Package & imports */}
        <div className="code-line">
            <span className="keyword">package</span> <span className="variable">com.cbc.auth</span><span className="punctuation">;</span>
        </div>
        <div className="code-line" />
        <div className="code-line">
            <span className="keyword">import</span> <span className="variable">org.springframework.beans.factory.annotation.Autowired</span><span className="punctuation">;</span>
        </div>
        <div className="code-line">
            <span className="keyword">import</span> <span className="variable">org.springframework.web.bind.annotation.*</span><span className="punctuation">;</span>
        </div>
        <div className="code-line" />
        <div className="code-line"><span className="annotation">@RestController</span></div>
        <div className="code-line">
            <span className="annotation">@RequestMapping</span><span className="punctuation">(</span><span className="string">"/auth"</span><span className="punctuation">)</span>
        </div>
        <div className="code-line">
            <span className="keyword">public class</span>{' '}
            <span className="class-name">{isLogin ? 'LoginController' : 'SignUpController'}</span>{' '}
            <span className="punctuation">{"{"}</span>
        </div>
        <div className="code-line" />
        <div className="code-line indented"><span className="annotation">@Autowired</span></div>
        <div className="code-line indented">
            <span className="keyword">private</span> <span className="class-name">AuthService</span> <span className="variable">auth</span><span className="punctuation">;</span>
        </div>
        <div className="code-line" />

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
                    <CodeInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@domain.com" required />
                    <span className="punctuation">",</span>
                </div>
                <div className="code-line triple-indented">
                    <span className="punctuation">"</span>
                    <CodeInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength="8" />
                    <span className="punctuation">"</span>
                </div>
                <div className="code-line double-indented submit-line-embedded">
                    <span className="punctuation">);</span>
                    <SubmitButton loading={loading} label="RUN SERVICE" />
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
                    <span className="variable">dev</span><span className="punctuation">.</span><span className="function">setName</span><span className="punctuation">("</span>
                    <CodeInput type="text" value={name} onChange={e => setName(e.target.value)} placeholder="your name" required />
                    <span className="punctuation">");</span>
                </div>
                <div className="code-line double-indented">
                    <span className="variable">dev</span><span className="punctuation">.</span><span className="function">setEmail</span><span className="punctuation">("</span>
                    <CodeInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@domain.com" required />
                    <span className="punctuation">");</span>
                </div>
                <div className="code-line double-indented">
                    <span className="variable">dev</span><span className="punctuation">.</span><span className="function">setPassword</span><span className="punctuation">("</span>
                    <CodeInput type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength="8" />
                    <span className="punctuation">");</span>
                </div>
                <div className="code-line double-indented">
                    <span className="variable">dev</span><span className="punctuation">.</span><span className="function">setConfirmPassword</span><span className="punctuation">("</span>
                    <CodeInput type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
                    <span className="punctuation">");</span>
                </div>
                <div className="code-line double-indented submit-line-embedded">
                    <span className="keyword">return</span> <span className="variable">auth</span><span className="punctuation">.</span><span className="function">signUp</span><span className="punctuation">(</span><span className="variable">dev</span><span className="punctuation">);</span>
                    <SubmitButton loading={loading} label="RUN SERVICE" />
                </div>
            </>
        )}

        <div className="code-line indented"><span className="punctuation">{"}"}</span></div>
        <div className="code-line"><span className="punctuation">{"}"}</span></div>
    </>
);

export default JavaCodeForm;
