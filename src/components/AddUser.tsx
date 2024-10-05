import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {MessageResponse, User, UserType} from '../Types';
import {useCsrf} from '../utilities/CsrfContext';
import Logo from "../assets/synergylogo.png";
import {useUser} from "../utilities/UserContext";

const AddUser: React.FC = () => {

    // Required
    const [email, setEmail] = useState<string>('');
    const [confEmail, setConfEmail] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [userType, setUserType] = useState<UserType>(UserType.USER);

    // Optional
    const [birthDate, setBirthDate] = useState<Date>();
    const [address, setAddress] = useState<string>('');

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

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUserType(e.target.value as UserType);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!firstName || !lastName || !email || !userType) {
            alert('First name, last name, and email, and role must be filled out!');
            return;
        }

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        if (email != confEmail) {
            alert('Emails do not match.');
            return;
        }

        let birthday, birthMonth, birthYear;
        if (birthDate) {
            birthday = birthDate.getDate() + 1;
            birthMonth = birthDate.getMonth() + 1;
            birthYear = birthDate.getFullYear();
        } else {
            birthday = undefined;
            birthMonth = undefined;
            birthYear = undefined;
        }

        try {

            const response = await fetch('https://synergyaccounting.app/api/admin/create', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    firstName,
                    lastName,
                    userType,
                    birthday,
                    birthMonth,
                    birthYear,
                    address,
                }),
            });

            if (response.ok) {
                const userResponse: User = await response.json();
                alert("User: " + userResponse.username + " has been added!");
                navigate('/dashboard', {state: {csrfToken, loggedInUser}});
            } else {
                const msgResponse: MessageResponse = await response.json();
                alert(msgResponse.message);
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Your session has expired. Refreshing page..');
            navigate('/register');
        }
    };

    return (
        <div className="dashboard">
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
                        <button className="control-button">Add User</button>
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
            <img src={Logo} alt="Synergy" className="dashboard-logo"/>
            <div className="dashboard-center">
                <div className="dashboard-center-container">
                    <label className="center-text">Add a new User</label>
                    <div className="extra-margin"></div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="label">User Email </label>
                            <input type="text" className="custom-input5" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">Confirm Email </label>
                            <input type="text"
                                   className="custom-input5" value={confEmail} onChange={(e) => setConfEmail(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">First Name </label>
                            <input type="text"
                                   className="custom-input5" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">Last Name </label>
                            <input className="custom-input5" type="text" value={lastName}
                                   onChange={(e) => setLastName(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">Role </label>
                            <select
                                id="dropdown"
                                value={userType}
                                onChange={handleChange}
                                className="dropdown-custom"
                            >
                                <option value={UserType.USER}>User</option>
                                <option value={UserType.MANAGER}>Manager</option>
                                <option value={UserType.ADMINISTRATOR}>Administrator</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label className="label">Birthday </label>
                            <input
                                type="date"
                                className="custom-input5"
                                value={birthDate ? birthDate.toISOString().substring(0, 10) : ""}
                                onChange={(e) => setBirthDate(e.target.value ? new Date(e.target.value) : undefined)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Address </label>
                            <input type="text" className="custom-input5" value={address} onChange={(e) => setAddress(e.target.value)}/>
                        </div>
                        <div className="extra-margin"></div>
                        <div className="input-group">
                            <button type="submit" className="custom-button">Add User</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

};

export default AddUser;



