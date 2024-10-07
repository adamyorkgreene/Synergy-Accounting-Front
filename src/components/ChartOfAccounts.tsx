import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import Logo from "../assets/synergylogo.png";
import {Account} from "../Types";

const ChartOfAccounts: React.FC = () => {

    const navigate = useNavigate();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser } = useUser();

    const [accounts, setAccounts] = useState<Account[]>([]);

    useEffect(() => {

        if (!loggedInUser) {
            console.log('No logged-in user found, redirecting to login...');
            navigate('/login');
        }

        const getAccounts = async () => {

            if (!csrfToken) {
                console.error('CSRF token is not available.');
                return;
            }

            try {
                const response = await fetch(`https://synergyaccounting.app/api/accounts/chart-of-accounts`, {
                    method: 'GET',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    const accounts: Account[] = await response.json();
                    setAccounts(accounts);
                }
            } catch (error) {
                alert('Error validating confirmation token! Please try again.');
                navigate('/login');
            }
        };

        getAccounts().then();

    }, [loggedInUser, navigate]);

    const handleSort = (key: keyof Account) => {
        const sortedAccounts = [...accounts].sort((a, b) => {
            if (key === 'creator') {
                if (a.creator.username < b.creator.username) {
                    return 1;
                }
                if (a.creator.username > b.creator.username) {
                    return -1;
                }
                return 0;
            } else {
                if (a[key] < b[key]) {
                    return -1;
                }
                if (a[key] > b[key]) {
                    return 1;
                }
            }
            return 0;
        });

        setAccounts(sortedAccounts);
    };

    if (!loggedInUser) {
        return <div>Loading...</div>;
    }

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
                <button className="control-button"
                        onClick={() => (navigate("/dashboard", {state: {csrfToken, loggedInUser}}))}>Home
                </button>
                <button className="control-button">Settings</button>
                <button className="control-button" onClick={() => (navigate("/logout"))}>Log Out</button>
            </div>
            <img src={Logo} alt="Synergy" className="dashboard-logo"/>
            <div className="coa-user-dash">
                <div className="dashboard-columns">
                    <div className="update-user-column" style={{width: "25%"}}></div>
                    <div className="update-user-column" style={{width: "50%", flexDirection: "unset"}}>
                        <label className="center-text" style={{color: "black", fontSize: "5vmin"}}>Chart of
                            Accounts</label>
                    </div>
                    <div className="update-user-column" style={{width: "25%", flexDirection: "row-reverse"}}>
                        <button className="control-button" style={{width: "unset", height: "unset"}}>+</button>
                    </div>
                </div>
                <table id="chartOfAccountsTable">
                    <thead>
                    <tr>
                        <th onClick={() => handleSort('accountNumber')}>Account Number</th>
                        <th onClick={() => handleSort('accountName')}>Account Name</th>
                        <th onClick={() => handleSort('accountDescription')}>Account Description</th>
                        <th onClick={() => handleSort('accountCategory')}>Category</th>
                        <th onClick={() => handleSort('accountSubCategory')}>Subcategory</th>
                        <th onClick={() => handleSort('initialBalance')}>Initial Balance</th>
                        <th onClick={() => handleSort('currentBalance')}>Current Balance</th>
                        <th onClick={() => handleSort('dateAdded')}>Date Added</th>
                        <th onClick={() => handleSort('creator')}>Creator</th>
                    </tr>
                    </thead>
                    <tbody>
                    {accounts.map((account) => (
                        <tr key={account.accountNumber}>
                            <td>{account.accountNumber}</td>
                            <td>{account.accountName}</td>
                            <td>{account.accountDescription}</td>
                            <td>{account.accountCategory}</td>
                            <td>{account.accountSubCategory}</td>
                            <td>{account.initialBalance.toFixed(2)}</td>
                            <td>{account.currentBalance.toFixed(2)}</td>
                            <td>{new Date(account.dateAdded).toLocaleDateString()}</td>
                            <td>{account.creator.username}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ChartOfAccounts;
