import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {MessageResponse, User, UserType} from '../Types';
import {useCsrf} from '../utilities/CsrfContext';
import {useUser} from "../utilities/UserContext";
import RightDashboard from "./RightDashboard";

const AddUser: React.FC = () => {

    const [email, setEmail] = useState<string>('');
    const [confEmail, setConfEmail] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [userType, setUserType] = useState<UserType>(UserType.ACCOUNTANT);

    const [birthday, setBirthday] = useState<Date>();
    const [address, setAddress] = useState<string>('');

    const navigate = useNavigate();

    const {csrfToken} = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (!loggedInUser) {
                await fetchUser();
            }
            setIsLoading(false);
        };
        init().then();
    }, [loggedInUser, fetchUser]);

    useEffect(() => {
        if (!isLoading) {
            if (!loggedInUser) {
                navigate('/login')
            }
            else if (loggedInUser.userType !== "ADMINISTRATOR" && loggedInUser.userType !== "MANAGER"){
                navigate('/dashboard');
                alert('You do not have permission to create users.')
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

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

        if (!validateEmail(email)) {
            alert('Please enter a valid email address.')
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
                    address,
                }),
            });

            if (response.ok) {
                const userResponse: User = await response.json();
                alert("User: " + userResponse.username + " has been added!");
                navigate('/dashboard');
            } else if (response.status === 401) {
                alert("You don't have permission to perform this action.");
                navigate('/dashboard');
            } else {
                const msgResponse: MessageResponse = await response.json();
                alert(msgResponse.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    return (
            <RightDashboard>
                <div style={{position: 'relative', height: '65vmin', display: 'flex', flexDirection: 'column',
                paddingTop: '2vmin', alignContent: 'center', flexWrap: 'wrap',
                justifyContent: 'flex-start', alignItems: 'center'}} className="dashboard-center-container">
                    <h1 style={{margin: 'unset'}}>Add a New User</h1>
                    <form style={{width: '70vmin', display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                    flexWrap: 'wrap', alignContent: 'center'}}
                        onSubmit={handleSubmit}>
                        {[
                            {label: 'User Email', value: email, setValue: setEmail},
                            {label: 'Confirm Email', value: confEmail, setValue: setConfEmail},
                            {label: 'First Name', value: firstName, setValue: setFirstName},
                            {label: 'Last Name', value: lastName, setValue: setLastName},
                            {label: 'Address', value: address, setValue: setAddress}
                        ].map(({label, value, setValue}, index) => (
                            <div style={{margin: '1vmin o'}} className="input-group" key={index}>
                                <label htmlFor={"adduser" + label} className="label">{label}</label>
                                <input type="text" className="custom-input" name={label} value={value}
                                       id={"adduser" + label}
                                       autoComplete={label.toString()} onChange={(e) => setValue(e.target.value)}/>
                            </div>
                        ))}
                        <div style={{margin: '1vmin o'}} className="input-group">
                            <label htmlFor="adduserdropdown" className="label">Role </label>
                            <select
                                id="adduserdropdown"
                                value={userType}
                                onChange={handleChange}
                                className="custom-input"
                                name="role"
                            >
                                <option value={UserType.ACCOUNTANT}>Accountant</option>
                                <option value={UserType.MANAGER}>Manager</option>
                                {loggedInUser?.userType === "ADMINISTRATOR" && (
                                    <option value={UserType.ADMINISTRATOR}>Administrator</option>
                                )}
                            </select>
                        </div>
                        <div style={{margin: '1vmin o'}} className="input-group">
                            <label htmlFor="adduserbirthday" className="label">Birthday </label>
                            <input
                                id="adduserbirthday"
                                type="date"
                                className="custom-input"
                                name="birthday"
                                value={birthday ? birthday.toISOString().substring(0, 10) : ""}
                                onChange={(e) => setBirthday(e.target.value ? new Date(e.target.value) : undefined)}
                            />
                        </div>
                        <div className="input-group">
                            <button type="submit" className="custom-button">Add User</button>
                        </div>
                    </form>
                </div>
            </RightDashboard>
    );

};

export default AddUser;



