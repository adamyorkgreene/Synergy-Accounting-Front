import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../Types';
import { useUser } from '../utilities/UserContext';
import RightDashboard from './RightDashboard';

const ExpiredPasswords: React.FC = () => {
    const navigate = useNavigate();
    const { user: loggedInUser, fetchUser } = useUser();

    const [isLoading, setIsLoading] = useState(true);
    const [usersWithExpiredPasswords, setUsersWithExpiredPasswords] = useState<User[]>([]);
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
                alert('You do not have permission to view this report.');
            } else {
                fetchExpiredPasswords();
            }
        }
    }, [isLoading, loggedInUser, navigate]);

    const fetchExpiredPasswords = async () => {
        try {
            const response = await fetch('https://synergyaccounting.app/api/admin/expired-passwords', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data: User[] = await response.json();
                setUsersWithExpiredPasswords(data);
            } else {
                setError('Failed to fetch users with expired passwords.');
            }
        } catch (error) {
            console.error('Error fetching expired passwords:', error);
            setError('An error occurred while fetching the data.');
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            <div className="expired-passwords-report" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <h1 style={{margin: 'unset'}}>Users with Expired Passwords</h1>
                {error ? (
                    <p className="error-message">{error}</p>
                ) : usersWithExpiredPasswords.length === 0 ? (
                    <p>No users with expired passwords found.</p>
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
                        {usersWithExpiredPasswords.map((user) => (
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

export default ExpiredPasswords;
