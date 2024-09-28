import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { csrfToken, isReady: csrfIsReady } = useCsrf();
    const { user: loggedInUser } = useUser();

    useEffect(() => {
        // Wait for CSRF context to be ready before evaluating user status
        if (csrfIsReady) {
            if (!loggedInUser) {
                console.log('No logged-in user found, redirecting to login...');
                navigate('/login');
            }
        }
    }, [csrfIsReady, loggedInUser, navigate]);

    // Wait until CSRF and user data are ready
    if (!csrfIsReady || !loggedInUser) {
        return <div>Loading...</div>;
    }
    return (
        <div className="dashboard">
            <img
                className="profile-icon"
                src={`https://synergyaccounting.app/api/dashboard/uploads/${loggedInUser.username}.jpg`}
                alt="Profile Picture"
            />
            <h1>Dashboard</h1>
            <button onClick={() => (navigate('/upload-image', {state: {csrfToken, loggedInUser}}))}
                    className="custom-button">
                Upload Image
            </button>
        </div>
    );
};

export default Dashboard;
