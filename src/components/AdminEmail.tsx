import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import Logo from "../assets/synergylogo.png";

const AdminEmail: React.FC = () => {

    const navigate = useNavigate();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser } = useUser();

    const [to, setTo] = useState<string>('');
    const [subject, setSubject] = useState<string>('');
    const [body, setBody] = useState<string>('');

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

        if (!to || !subject || !body) {
            alert('Please fill in all fields.');
            return;
        }

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        try {
            const response = await fetch('https://synergyaccounting.app/api/admin/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ to, from: loggedInUser, subject, body }),
            });

            if (response.ok) {
                alert('Email has been sent successfully.');
                setTo('');
                setSubject('');
                setBody('');
            } else {
                const errorResponse = await response.json();
                alert(`Failed to send email: ${errorResponse.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while sending the email. Please try again.');
        }
    };

    return (
        <div className="dashboard">
            <img src={Logo} alt="Synergy" className="dashboard-logo" />
            <div className="dashboard-center" style={{justifyContent: "center"}}>
                <div className="email-dashboard">
                    <form onSubmit={handleSubmit}>
                        <label className="label3">Send an Email</label>
                        <div className="input-group3">
                            <input
                                type="text"
                                className="custom-input3"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                placeholder="Recipient email address"
                            />
                        </div>
                        <div className="input-group3">
                            <input
                                type="text"
                                className="custom-input3"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Email subject"
                            />
                        </div>
                        <div className="input-group3">
                            <textarea
                                className="custom-textarea3 custom-input3"
                                value={body}
                                style={{width: "75vmin"}}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Email body"
                                rows={10}
                            />
                        </div>

                        <div className="input-group3">
                            <button type="submit" className="custom-button3">Send Email</button>
                        </div>
                    </form>
                </div>
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
                            state: {csrfToken, loggedInUser}
                        })} className="control-button">Update User
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/admin/send-email', {state: {csrfToken, loggedInUser}})}
                            className="control-button">Send Email
                        </button>
                        <div className="add_space"></div>
                    </>
                ) : null}
                <div className="label2">User Panel</div>
                <button className="control-button"
                        onClick={() => (navigate("/dashboard", {state: {csrfToken, loggedInUser}}))}>Home
                </button>
                <button className="control-button">Settings</button>
                <button className="control-button" onClick={() => (navigate("/logout"))}>Log Out</button>
            </div>
        </div>

    );
};

export default AdminEmail;
