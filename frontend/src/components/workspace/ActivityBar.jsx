import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ActivityBar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <aside className="vs-activity-bar">
            <div className="activity-top">
                <div className="activity-icon" title="Go back to Dashboard" onClick={() => navigate('/dashboard')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                </div>
                <div className="activity-icon active" title="Room Workspace">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 3H10V10H3V3Z"/>
                        <path d="M14 3H21V10H14V3Z"/>
                        <path d="M14 14H21V21H14V14Z"/>
                        <path d="M3 14H10V21H3V14Z"/>
                    </svg>
                </div>
            </div>
            <div className="activity-bottom">
                <div className="activity-icon" title="Log Out" onClick={() => { logout(); navigate('/'); }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"/>
                        <path d="M16 17L21 12L16 7"/>
                        <path d="M21 12H9"/>
                    </svg>
                </div>
            </div>
        </aside>
    );
};

export default ActivityBar;
