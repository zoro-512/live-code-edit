import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
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

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                {/* VS Code title bar decoration */}
                <div className="auth-header-bar">
                    <div className="window-dots">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green"></span>
                    </div>
                    <div className="window-title">antigravity-auth-portal</div>
                </div>

                <div className="auth-content">
                    <div className="brand-logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 22H22L12 2Z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <h1>ANTIGRAVITY</h1>
                    </div>
                    <p className="brand-subtitle">Collaborative Multi-User Code Workspace</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {!isLogin && (
                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Enter full name"
                                    required 
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                placeholder="name@domain.com"
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="••••••••"
                                required 
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    placeholder="••••••••"
                                    required 
                                />
                            </div>
                        )}

                        {error && <div className="auth-message error">{error}</div>}
                        {successMsg && <div className="auth-message success">{successMsg}</div>}

                        <button type="submit" className="btn-auth-submit" disabled={loading}>
                            {loading ? (
                                <div className="vs-loader-sm"></div>
                            ) : (
                                isLogin ? 'Sign In' : 'Sign Up'
                            )}
                        </button>
                    </form>

                    <div className="auth-toggle">
                        {isLogin ? (
                            <p>New to Antigravity? <span onClick={() => { setIsLogin(false); setError(''); }}>Create an account</span></p>
                        ) : (
                            <p>Already have an account? <span onClick={() => { setIsLogin(true); setError(''); }}>Sign In</span></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
