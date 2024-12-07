import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageResponse, User, UserType } from '../Types';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from "../utilities/UserContext";
import RightDashboard from "./RightDashboard";
import ConfirmPopup from "./ConfirmPopup";

const UpdateUser: React.FC = () => {
    const [userResponse, setUserResponse] = useState<User | undefined>(undefined);
    const [confirming, setConfirming] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const navigate = useNavigate();
    const location = useLocation();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser, setUser: setLoggedInUser, fetchUser } = useUser();

    useEffect(() => {
        if (location.state && location.state.userResponse) {
            setUserResponse(location.state.userResponse as User);
        }
    }, [location.state]);

    useEffect(() => {
        const init = async () => {
            if (!loggedInUser) {
                await fetchUser();
            }
            setIsLoading(false);
        };
        init();
    }, [loggedInUser, fetchUser]);

    useEffect(() => {
        if (!isLoading) {
            if (!loggedInUser) {
                navigate('/login');
            } else if (loggedInUser.userType !== "ADMINISTRATOR" && loggedInUser.userType !== "MANAGER"){
                navigate('/dashboard/chart-of-accounts');
                alert('You do not have permission to update users.');
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    const handleInputChange = (field: keyof User, value: any) => {
        setUserResponse((prev) => prev ? { ...prev, [field]: value } : prev);
    };

    const handleNestedInputChange = (field: keyof User, nestedField: string, value: any) => {
        setUserResponse((prev) =>
            prev ? { ...prev, [field]: { ...(prev[field] as any), [nestedField]: value } } : prev
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userResponse?.firstName || !userResponse?.lastName || !userResponse?.email) {
            alert('First name, last name, and email are required.');
            return;
        }
        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }
        console.log("Updated User JSON outward: ", JSON.stringify(userResponse))
        try {
            const response = await fetch('https://synergyaccounting.app/api/admin/updateuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(userResponse),
            });
            if (response.ok) {
                const updatedUser: User = await response.json();
                console.log("Updated user JSON inward: ", updatedUser)
                alert("User: " + updatedUser.username + " has been updated");
                if (updatedUser.userid === loggedInUser?.userid) {
                    setLoggedInUser(updatedUser);
                }
                setUserResponse(updatedUser);
                navigate('/dashboard/admin/update-user', { state: { userResponse: updatedUser } });
            } else {
                const msgResponse: MessageResponse = await response.json();
                alert(msgResponse.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleDeleteUserRequest = async () => {
        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }
        try {
            const response = await fetch('https://synergyaccounting.app/api/admin/delete-user-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(userResponse?.userid),
            });
            if (response.ok) {
                setConfirming(true);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleDeleteUserConfirm = async () => {
        setConfirming(false);
        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }
        try {
            const response = await fetch('https://synergyaccounting.app/api/admin/delete-user-confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(userResponse?.userid),
            });
            const message: MessageResponse = await response.json();
            alert(message.message);
            if (response.ok) {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const parseDate = (date: any) => (typeof date === 'string' ? new Date(date) : date);

    const formattedDate = (date: any) => {
        const parsedDate = parseDate(date);
        return parsedDate instanceof Date && !isNaN(parsedDate.getTime()) ? parsedDate.toISOString().split('T')[0] : '';
    };
    return (
        <RightDashboard>
            <div style={{ padding: '3vmin', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'nowrap', alignItems: 'flex-start', height: '65vmin' }} className="update-user-dash">
                <div style={{ width: '25.71vmin', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }} className="update-user-column">
                    <div className="profile-container" onClick={() => navigate('/upload-image', { state: { userResponse } })}>
                        <img className="profile-icon" src={`https://synergyaccounting.app/api/dashboard/uploads/${userResponse?.userid.toString()}.jpg`} alt="Profile Picture" />
                    </div>
                    <button style={{ margin: 'unset' }} className="control-button" onClick={() => handleNestedInputChange('user_security', 'isActive', !userResponse?.user_security.isActive)}>
                        {userResponse?.user_security.isActive ? 'Deactivate Account' : 'Reactivate Account'}
                    </button>
                    <button onClick={handleDeleteUserRequest} style={{ margin: 'unset' }} className="control-button">Delete User</button>
                </div>

                <div className="update-user-column" style={{ justifyContent: 'space-around', height: '100%' }}>
                    <h1 style={{ margin: 'unset' }}>{userResponse?.firstName} {userResponse?.lastName}</h1>
                    <div style={{ fontSize: "2.5vmin" }}>
                        <br />
                        User ID: {userResponse?.userid?.toString()}<br />
                        Verified: {userResponse?.user_security.isVerified ? "True" : "False"}<br />
                        Member Since: {formattedDate(userResponse?.user_date?.joinDate)}<br />
                    </div>

                    <div style={{ display: 'flex', alignContent: 'center', flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'space-between', height: '35vmin', marginTop: '1vmin' }}>
                        {[
                            { label: 'Username', field: 'username' },
                            { label: 'Email', field: 'email' },
                            { label: 'First Name', field: 'firstName' },
                            { label: 'Last Name', field: 'lastName' },
                            { label: 'Address', field: 'address' }
                        ].map(({ label, field }) => (
                            <div key={field} style={{ margin: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '3.771vmin' }} className="input-group">
                                <label htmlFor={"update" + label} className="label">{label} </label>
                                <input
                                    type="text"
                                    name={label}
                                    id={"update" + label}
                                    className="custom-input"
                                    value={(userResponse as any)?.[field] || ''}
                                    onChange={(e) => handleInputChange(field as keyof User, e.target.value)}
                                />
                            </div>
                        ))}
                        <div style={{ margin: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '3.771vmin' }} className="input-group">
                            <label htmlFor="updaterole" className="label">Role </label>
                            <select id="updaterole" value={userResponse?.userType} onChange={(e) => handleInputChange('userType', e.target.value as UserType)} className="dropdown-custom" style={{ height: "3.771vmin" }} name="role">
                                <option value={UserType.ACCOUNTANT}>Accountant</option>
                                <option value={UserType.MANAGER}>Manager</option>
                                {loggedInUser?.userType === "ADMINISTRATOR" && (
                                    <option value={UserType.ADMINISTRATOR}>Administrator</option>
                                )}
                            </select>
                        </div>
                        <div style={{ margin: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '3.771vmin' }} className="input-group">
                            <label htmlFor="updatebirthday" className="label">Birthday </label>
                            <input
                                type="date"
                                name="birthday"
                                id="updatebirthday"
                                className="custom-input"
                                value={formattedDate(userResponse?.user_date?.birthday)}
                                onChange={(e) => handleNestedInputChange('user_date', 'birthday', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                            />
                        </div>
                    </div>
                </div>

                <div className="update-user-column" style={{ justifyContent: "space-around", width: '25.71vmin' }}>
                    <label style={{ marginRight: "unset" }} htmlFor="updatestarttempleave" className="label">Start Temporary Leave</label>
                    <div className="input-group" style={{ margin: "1.5625vmin 0", height: "3.771vmin", justifyContent: "center" }}>
                        <input style={{ width: '100%' }} type="date" className="custom-input" value={formattedDate(userResponse?.user_date?.tempLeaveStart)} name="leavestart" id="updatestarttempleave"
                               onChange={(e) => handleNestedInputChange('user_date', 'tempLeaveStart', e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
                    </div>
                    <label style={{ marginRight: "unset" }} htmlFor="updateendtempleave" className="label">End Temporary Leave</label>
                    <div className="input-group" style={{ margin: "1.5625vmin 0", height: "3.771vmin", justifyContent: "center" }}>
                        <input style={{ width: '100%' }} type="date" className="custom-input" value={formattedDate(userResponse?.user_date?.tempLeaveEnd)} name="leaveend" id="updateendtempleave"
                               onChange={(e) => handleNestedInputChange('user_date', 'tempLeaveEnd', e.target.value ? new Date(e.target.value).toISOString() : undefined)} />
                    </div>
                    <form style={{ marginTop: "auto" }} onSubmit={handleSubmit}>
                        <button style={{ margin: 'unset' }} type="submit" className="control-button">Save Changes</button>
                    </form>
                </div>
            </div>

            {confirming && userResponse && (
                <ConfirmPopup user={userResponse} onClose={() => setConfirming(false)} onConfirm={handleDeleteUserConfirm} />
            )}
        </RightDashboard>
    );
};

export default UpdateUser;
