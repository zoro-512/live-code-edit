import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Endpoint */}
          <Route path="/login" element={<Auth />} />

          {/* Protected Area: Dashboard & Room Explorer */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Protected Area: Real-Time Collaborative Workspace */}
          <Route 
            path="/workspace/:roomId" 
            element={
              <ProtectedRoute>
                <Workspace />
              </ProtectedRoute>
            } 
          />

          {/* Redirect any other request to Dashboard (which forwards to login if unauthenticated) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
