import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const API_BASE_URL = 'http://localhost:8080';

// Setup a global Axios instance for API requests
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to append authorization token if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('jwt_token'));
    const [userEmail, setUserEmail] = useState(localStorage.getItem('user_email'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Quick verification of token presence on mount
        const storedToken = localStorage.getItem('jwt_token');
        const storedEmail = localStorage.getItem('user_email');
        if (storedToken && storedEmail) {
            setToken(storedToken);
            setUserEmail(storedEmail);
        } else {
            logout();
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Backend endpoint is `/auth/Login` (case sensitive)
            const response = await axios.post(`${API_BASE_URL}/auth/Login`, {
                email,
                password
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            // The backend returns the raw token string
            const jwtToken = response.data;
            if (jwtToken) {
                localStorage.setItem('jwt_token', jwtToken);
                localStorage.setItem('user_email', email);
                setToken(jwtToken);
                setUserEmail(email);
                return { success: true };
            }
        } catch (error) {
            const errorMsg = error.response?.data || 'Login failed. Please check your credentials.';
            return { success: false, message: errorMsg };
        }
    };

    const register = async (name, email, password) => {
        try {
            // Backend endpoint is `/auth/SignUp` (case sensitive)
            await axios.post(`${API_BASE_URL}/auth/SignUp`, {
                name,
                email,
                password,
                role: 'USER' // Default role
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data || 'Registration failed.';
            return { success: false, message: errorMsg };
        }
    };

    const logout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_email');
        setToken(null);
        setUserEmail(null);
    };

    const value = {
        token,
        userEmail,
        login,
        register,
        logout,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
