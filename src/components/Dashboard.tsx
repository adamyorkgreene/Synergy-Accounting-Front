import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import Logo from "../assets/synergylogo.png";
import RightDashboard from "./RightDashboard";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser } = useUser();

    useEffect(() => {

        if (!loggedInUser) {
            console.log('No logged-in user found, redirecting to login...');
            navigate('/login');
        }
    }, [loggedInUser, navigate]);

    if (!loggedInUser) {
        return <div>Loading...</div>;
    }
    return (
        <div className="dashboard">
            <RightDashboard loggedInUser={loggedInUser} csrfToken={csrfToken} />
            <img src={Logo} alt="Synergy" className="dashboard-logo"/>
            <div className="update-user-dash">
                <div className="update-user-column">
                    <button className="control-button" onClick={() => navigate("/dashboard/chart-of-accounts", {
                        state: {
                            csrfToken,
                            loggedInUser
                        }
                    })}>Chart of Accounts
                    </button>
                </div>
                <div className="update-user-column"></div>
                <div className="update-user-column"></div>
            </div>
        </div>

    );
};

export default Dashboard;
