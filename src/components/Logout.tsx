import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../utilities/UserContext';

const Logout: React.FC = () => {

    const navigate = useNavigate();
    const { logout } = useUser();

    useEffect(() => {

        const performLogout = async () => {
            logout();
        };

        performLogout().then(() => navigate('/login'));

    }, [logout, navigate]);

    return <div>Logging out...</div>;

};

export default Logout;
