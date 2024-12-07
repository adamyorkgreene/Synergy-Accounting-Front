import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../Types';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from "../utilities/UserContext";
import RightDashboard from "./RightDashboard";

const UserReport: React.FC = () => {
    const navigate = useNavigate();

    const { user: loggedInUser, fetchUser } = useUser();
    const { csrfToken } = useCsrf();

    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);

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
                navigate('/login');
            }
            else if (loggedInUser.userType !== "ADMINISTRATOR" && loggedInUser.userType !== "MANAGER"){
                navigate('/dashboard');
                alert('You do not have permission to get user reports.');
            } else {
                fetchUserReport();
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    const fetchUserReport = async () => {
        try {
            const response = await fetch('https://synergyaccounting.app/api/admin/users-report', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data: User[] = await response.json();
                setUsers(data);
            } else {
                setError('Failed to fetch user reports.');
            }
        } catch (err) {
            console.error('Error fetching user reports:', err);
            setError('An error occurred while fetching user reports.');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <RightDashboard>
            <div className="user-report" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <h1 style={{margin: 'unset'}}>User Report</h1>
                {users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    <table className="user-table" style={{width: '95%'}}>
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>User Type</th>
                            <th>Address</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.userid}>
                                <td>{user.userid}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.username}</td>
                                <td style={{fontSize: '1vh'}}>{user.email}</td>
                                <td>{user.userType}</td>
                                <td>{user.address}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </RightDashboard>
    );
};

export default UserReport;
