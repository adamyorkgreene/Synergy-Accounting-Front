import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {MessageResponse, User, UserType} from '../Types';
import {useCsrf} from '../utilities/CsrfContext';
import Logo from "../assets/synergylogo.png";
import {useUser} from "../utilities/UserContext";

const UpdateUser: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const {csrfToken} = useCsrf();
    const { user: loggedInUser } = useUser();

    const [email, setEmail] = useState<string>('');
    const [emailPassword, setEmailPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [userType, setUserType] = useState<UserType>(UserType.USER);
    const [userid, setUserid] = useState<bigint>();
    const [joinDate, setJoinDate] = useState<Date>();
    const [address, setAddress] = useState<string>('');
    const [isVerified, setIsVerified] = useState<boolean>();
    const [isActive, setIsActive] = useState<boolean>();
    const [failedLoginAttempts, setFailedLoginAttempts] = useState<number>(0);

    const [tempLeaveStart, setTempLeaveStart] = useState<Date>();
    const [tempLeaveEnd, setTempLeaveEnd] = useState<Date>();

    const [birthday, setBirthday] = useState<Date>();

    const formattedBirthDate: string = birthday instanceof Date && !isNaN(birthday.getTime()) ? birthday.toISOString().substring(0, 10) : '';
    const formattedLeaveStart: string = tempLeaveStart instanceof Date && !isNaN(tempLeaveStart.getTime()) ? tempLeaveStart.toISOString().substring(0, 10) : '';
    const formattedLeaveEnd: string = tempLeaveEnd instanceof Date && !isNaN(tempLeaveEnd.getTime()) ? tempLeaveEnd.toISOString().substring(0, 10) : '';

    const userResponse: User = location.state?.userResponse;

    useEffect(() => {
        if (!loggedInUser) {
            console.log('No logged-in user found, redirecting to login...');
            navigate('/login');
        }
        if (!userResponse) {
            alert('User data failed to be passed. Please try again.')
            navigate('/dashboard')
            return;
        }

        setEmail(userResponse.email ?? "");
        setUsername(userResponse.username ?? "");
        setUserType(userResponse.userType ?? UserType.DEFAULT);
        setUserid(userResponse.userid ?? BigInt(0));
        setFirstName(userResponse.firstName ?? "");
        setLastName(userResponse.lastName ?? "");
        setIsActive(userResponse.isActive ?? false);
        setIsVerified(userResponse.isVerified ?? false);
        setAddress(userResponse.address ?? "");
        setFailedLoginAttempts(userResponse.failedLoginAttempts ?? 0);
        setBirthday(userResponse.birthday ? new Date(userResponse.birthday) : undefined);
        setJoinDate(userResponse.joinDate ? new Date(userResponse.joinDate) : undefined);
        setTempLeaveStart(userResponse.tempLeaveStart ? new Date(userResponse.tempLeaveStart) : undefined);
        setTempLeaveEnd(userResponse.tempLeaveEnd ? new Date(userResponse.tempLeaveEnd) : undefined);
        setEmailPassword(userResponse.emailPassword ?? "");


    }, [loggedInUser, navigate, userResponse]);

    if (!loggedInUser) {
        return <div>Loading...</div>;
    }

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUserType(e.target.value as UserType);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!firstName || !lastName || !email) {
            alert('First name, last name, and email must be kept at a minimum.');
            return;
        }

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        try {

            const response = await fetch('https://synergyaccounting.app/api/admin/updateuser', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    userid,
                    email,
                    username,
                    firstName,
                    lastName,
                    userType,
                    birthday,
                    address,
                    failedLoginAttempts,
                    isVerified,
                    isActive,
                    tempLeaveStart,
                    tempLeaveEnd,
                    emailPassword
                }),
            });

            if (response.ok) {
                const userResponse: User = await response.json();
                alert("User: " + userResponse.username + " has been updated");
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
                        <button
                            onClick={() => navigate('/dashboard/admin/update-user', {state: {csrfToken, loggedInUser}})}
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
                <div className="update-user-dash">
                    <div className="update-user-column">
                        <div className="profile-container"
                             onClick={() => (navigate('/upload-image', {state: {csrfToken, userResponse}}))}>
                            <img
                                className="profile-icon"
                                src={`https://synergyaccounting.app/api/dashboard/uploads/${userResponse.username}.jpg`}
                                alt="Profile Picture"
                            />
                        </div>
                        {userType === UserType.DEFAULT ? (
                            <button className="control-button" onClick={() => setUserType(UserType.USER)}>Approve
                                User</button>
                        ) : (
                            <button className="empty-button" disabled>Approve User</button>
                        )}
                        {failedLoginAttempts && failedLoginAttempts >= 3 ? (
                            <button className="control-button" onClick={() => setFailedLoginAttempts(0)}>Unlock
                                Account</button>
                        ) : (
                            <button className="empty-button" disabled>Unlock Account</button>
                        )}
                        <button className="control-button" onClick={() => setIsActive(false)}>Deactivate Account
                        </button>
                        <button className="control-button">Delete User</button>
                    </div>
                    <div className="update-user-column-2">
                        <div className={"update-user-dash-header"}>{firstName} {lastName}</div>
                        <div style={{transform: "translateX(5vmin)", justifySelf: "flex-start", marginBottom: "5vmin"}}>
                            <br/>
                            Username: {username}<br/>
                            User ID: {userid?.toString()}<br/>
                            Verified: {isVerified ? "True" : "False"}<br/>
                            Role: {userType.toString()}<br/>
                            Member Since: {joinDate?.toDateString()}<br/>
                        </div>
                        <div style={{transform: "translateY(-0.55vmin", justifySelf: "flex-end", marginTop: "6vh"}}>
                            <div className="input-group">
                                <label className="label">Role </label>
                                <select
                                    id="dropdown"
                                    value={userType}
                                    onChange={handleChange}
                                    className="dropdown-custom"
                                    style={{height: "3.771vmin"}}
                                >
                                    <option value={UserType.USER}>User</option>
                                    <option value={UserType.MANAGER}>Manager</option>
                                    <option value={UserType.ADMINISTRATOR}>Administrator</option>
                                </select>
                            </div>
                            <div className="input-group" style={{margin: "1.5625vmin 0;", height: "3.771vmin"}}>
                                <label className="label">Username </label>
                                <input type="text" className={"custom-input"} value={username}
                                       onChange={(e) => setUsername(e.target.value)}/>
                            </div>
                            <div className="input-group" style={{margin: "1.5625vmin 0;", height: "3.771vmin"}}>
                                <label className="label">Email </label>
                                <input type="text" className={"custom-input"} value={email}
                                       onChange={(e) => setEmail(e.target.value)}/>
                            </div>
                            <div className="input-group" style={{margin: "1.5625vmin 0;", height: "3.771vmin"}}>
                                <label className="label">First Name </label>
                                <input type="text" className={"custom-input"} value={firstName}
                                       onChange={(e) => setFirstName(e.target.value)}/>
                            </div>
                            <div className="input-group" style={{margin: "1.5625vmin 0;", height: "3.771vmin"}}>
                                <label className="label">Last Name </label>
                                <input type="text" className={"custom-input"} value={lastName}
                                       onChange={(e) => setLastName(e.target.value)}/>
                            </div>
                            <div className="input-group" style={{margin: "1.5625vmin 0;", height: "3.771vmin"}}>
                                <label className="label">Birthday </label>
                                <input type="date" className={"custom-input"} value={formattedBirthDate}
                                       onChange={(e) => setBirthday(e.target.value ?
                                           new Date(e.target.value) : undefined)}
                                />
                            </div>
                            <div className="input-group" style={{margin: "1.5625vmin 0;", height: "3.771vmin"}}>
                                <label className="label">Address </label>
                                <input type="text" className={"custom-input"} value={address}
                                       onChange={(e) => setAddress(e.target.value)}/>
                            </div>
                        </div>
                    </div>
                    <div className="update-user-column-2"
                         style={{alignItems: "center", transform: "translateX(0)", justifyContent: "flex-end"}}>
                        <label className="label">Start Temporary Leave </label>
                        <div className="input-group" style={{margin: "1.5625vmin 0;", height: "3.771vmin"}}>
                            <input type="date" className={"custom-input"} value={formattedLeaveStart}
                                   onChange={(e) => setTempLeaveStart(e.target.value ?
                                       new Date(e.target.value) : undefined)}
                            />
                        </div>
                        <label className="label">End Temporary Leave </label>
                        <div className="input-group" style={{margin: "1.5625vmin 0;", height: "3.771vmin"}}>
                            <input type="date" className={"custom-input"} value={formattedLeaveEnd}
                                   onChange={(e) => setTempLeaveEnd(e.target.value ?
                                       new Date(e.target.value) : undefined)}
                            />
                        </div>
                        <form onSubmit={handleSubmit}>
                            <button className="control-button">Save Changes</button>
                        </form>
                    </div>
                </div>
        </div>
    );
};

export default UpdateUser;



