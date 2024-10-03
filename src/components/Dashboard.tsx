import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import Logo from "../assets/synergylogo.png";

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
            <img src={Logo} alt="Synergy" className="dashboard-logo"/>
            <div className="dashboard-center">
            </div>
            <div className="right-dashboard">
                <div className="username-label">{loggedInUser.username}</div>
                <div className="profile-container"
                     onClick={() => (navigate('/upload-image', {state: {csrfToken, loggedInUser}}))}>
                    <img
                        className="profile-icon"
                        src={`https://synergyaccounting.app/api/dashboard/uploads/${loggedInUser.username}.jpg`}
                        alt="Profile Picture"
                    />
                </div>
                {loggedInUser.userType === "ADMINISTRATOR" ? (
                    <>
                        <div className="label2">Admin Panel</div>
                        <button
                            onClick={() => navigate('/dashboard/admin/add-user', {state: {csrfToken, loggedInUser}})}
                            className="control-button">Add
                            User
                        </button>
                        <button onClick={() => navigate('/dashboard/admin/update-user-search', {
                            state: {
                                csrfToken,
                                loggedInUser
                            }
                        })}
                                className="control-button">Update User
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/admin/send-email', {state: {csrfToken, loggedInUser}})}
                            className="control-button">Send Email
                        </button>
                        <div className="add_space"></div>
                    </>
                ) : null}
                <div className="label2">User Panel</div>
                <button className="control-button" onClick={() => (navigate("/dashboard", {state: {csrfToken, loggedInUser}}))}>Home</button>
                <button className="control-button">Settings</button>
                <button className="control-button" onClick={() => (navigate("/logout"))}>Log Out</button>
            </div>
        </div>

    );
};

export default Dashboard;