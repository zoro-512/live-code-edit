import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                backgroundColor: '#1e1e1e',
                color: '#858585',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Segoe UI, sans-serif',
                fontSize: '14px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div className="vs-loader"></div>
                    <div>Initializing workspace...</div>
                </div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
