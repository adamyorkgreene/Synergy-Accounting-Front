import React, { useEffect } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import { validateUser } from '../utilities/csrfutility';  // Adjust path to match your project structure

const Dashboard: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const csrfToken = (location.state as { csrfToken: string })?.csrfToken;

    useEffect(() => {
        if (csrfToken) {
            validateUser(csrfToken, '/dashboard').then();  // Validate user using the utility
        } else {
            navigate('/login');  // Redirect to login if no CSRF token is found
        }
    }, [csrfToken, navigate]);

    return (
        <div>
            <h1>Dashboard</h1>
            {/* Your dashboard content */}
        </div>
    );
};

export default Dashboard;
