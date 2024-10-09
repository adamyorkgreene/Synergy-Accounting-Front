import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {MessageResponse, User, UserType} from '../Types';
import {useCsrf} from '../utilities/CsrfContext';
import Logo from "../assets/synergylogo.png";
import {useUser} from "../utilities/UserContext";

const UpdateUserSearch: React.FC = () => {

    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [userid, setUserid] = useState<string>('');

    const navigate = useNavigate();

    const {csrfToken} = useCsrf();

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email && !username && !userid) {
            alert('Error: At least one field must be filled out.');
            return;
        }

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        try {

            const response = await fetch('https://synergyaccounting.app/api/admin/usersearch', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    userid,
                    username,
                }),
            });

            if (response.ok) {
                const userResponse: User = await response.json();
                navigate('/dashboard/admin/update-user', {state: {csrfToken, loggedInUser, userResponse}});
            } else {
                const msgResponse: MessageResponse = await response.json();
                alert(msgResponse.message);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Your session has expired. Refreshing page..');
            navigate('/login');
        }
    };

    return (
        <div className="dashboard">
            <div className="right-dashboard">
                <div className="label large-font">{loggedInUser.username}</div>
                <div className="profile-container"
                     onClick={() => navigate('/upload-image', {state: {csrfToken, loggedInUser}})}>
                    <img
                        className="profile-icon"
                        src={`https://synergyaccounting.app/api/dashboard/uploads/${loggedInUser.username}.jpg`}
                        alt="Profile Picture"
                    />
                </div>
                {loggedInUser.userType === "ADMINISTRATOR" && (
                    <>
                        <div className="label large-font">Admin Panel</div>
                        <button
                            onClick={() => navigate('/dashboard/admin/add-user', {state: {csrfToken, loggedInUser}})}
                            className="control-button">Add User
                        </button>
                        <button className="control-button">Update User</button>
                        <button
                            onClick={() => navigate('/dashboard/admin/inbox', {state: {csrfToken, loggedInUser}})}
                            className="control-button">Mailbox
                        </button>
                        <div className="extra-margin"></div>
                    </>
                )}
                <div className="label large-font">User Panel</div>
                <button className="control-button"
                        onClick={() => navigate("/dashboard", {state: {csrfToken, loggedInUser}})}>Home
                </button>
                <button className="control-button">Settings</button>
                <button className="control-button" onClick={() => navigate("/logout")}>Log Out</button>
            </div>
            <img src={Logo} alt="Synergy" className="dashboard-logo"/>
            <div className="dashboard-center">
                <div className="dashboard-center-container">
                    <label className="center-text">Search for a User to Update</label>
                    <div className="extra-margin"></div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="label">Email </label>
                            <input type="text" className="custom-input" value={email}
                                   onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">User ID </label>
                            <input type="text" className="custom-input" value={userid}
                                   onChange={(e) => setUserid(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">Username </label>
                            <input type="text" className="custom-input" value={username}
                                   onChange={(e) => setUsername(e.target.value)}/>
                        </div>
                        <div className="extra-margin"></div>
                        <div className="input-group">
                            <button type="submit" className="custom-button">Search</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateUserSearch;



