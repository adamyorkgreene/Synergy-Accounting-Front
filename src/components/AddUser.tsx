import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {MessageResponse, User, UserType} from '../Types';
import {useCsrf} from '../utilities/CsrfContext';
import Logo from "../assets/synergylogo.png";
import {useUser} from "../utilities/UserContext";
import RightDashboard from "./RightDashboard";

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
            <RightDashboard loggedInUser={loggedInUser} csrfToken={csrfToken} />
            <img src={Logo} alt="Synergy" className="dashboard-logo"/>
            <div className="dashboard-center">
                <div className="dashboard-center-container">
                    <label className="center-text">Add a new User</label>
                    <div className="extra-margin"></div>
                    <form onSubmit={handleSubmit}>
                        {[
                            {label: 'User Email', value: email, setValue: setEmail},
                            {label: 'Confirm Email', value: confEmail, setValue: setConfEmail},
                            {label: 'First Name', value: firstName, setValue: setFirstName},
                            {label: 'Last Name', value: lastName, setValue: setLastName},
                            {label: 'Address', value: address, setValue: setAddress}
                        ].map(({label, value, setValue}, index) => (
                            <div className="input-group" key={index}>
                                <label className="label">{label}</label>
                                <input type="text" className="custom-input" value={value}
                                       onChange={(e) => setValue(e.target.value)}/>
                            </div>
                        ))}
                        <div className="input-group">
                            <label className="label">Role </label>
                            <select
                                id="dropdown"
                                value={userType}
                                onChange={handleChange}
                                className="custom-input"
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
                                className="custom-input"
                                value={birthDate ? birthDate.toISOString().substring(0, 10) : ""}
                                onChange={(e) => setBirthDate(e.target.value ? new Date(e.target.value) : undefined)}
                            />
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



