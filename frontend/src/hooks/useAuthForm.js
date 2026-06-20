import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const useAuthForm = () => {
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

    const switchMode = (toLogin) => {
        setIsLogin(toLogin);
        setError('');
        setSuccessMsg('');
    };

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
                setName('');
                setPassword('');
                setConfirmPassword('');
            } else {
                setError(res.message);
            }
        }

        setLoading(false);
    };

    return {
        isLogin, switchMode,
        name, setName,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        error, successMsg, loading,
        handleSubmit,
    };
};
