import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Account, MessageResponse} from '../Types';
import {useCsrf} from '../utilities/CsrfContext';
import Logo from "../assets/synergylogo.png";
import {useUser} from "../utilities/UserContext";
import RightDashboard from "./RightDashboard";

const UpdateTransaction: React.FC = () => {

    const [accountData, setAccountData] = useState<Account>();

    const [accountNumber, setAccountNumber] = useState<number>();
    const [accountName, setAccountName] = useState<string>();
    const [accountDescription, setAccountDescription] = useState<string>();

    const navigate = useNavigate();
    const location = useLocation();

    const {csrfToken} = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (location.state && location.state.selectedAccount) {
            const accountData = location.state.selectedAccount as Account;
            console.log("Account Data:", accountData);
            setAccountData(accountData);
            setAccountName(accountData.accountName);
            setAccountDescription(accountData.accountDescription);
            setAccountNumber(accountData.accountNumber);
        }
    }, [location.state]);

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
            else if (loggedInUser.userType !== "ADMINISTRATOR"){
                navigate('/dashboard/chart-of-accounts');
                alert('You do not have permission to update accounts.')
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!accountDescription || !accountName) {
            alert('All fields must be filled out!');
            return;
        }

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        try {

            if (!accountNumber) {
                alert("Account number is missing.");
                return;
            }

            const response = await fetch('https://synergyaccounting.app/api/accounts/chart-of-accounts/update-account', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    accountNumber,
                    accountName,
                    accountDescription,
                }),
            });
            if (response.ok) {
                alert("Account has been updated!");
                navigate('/dashboard/chart-of-accounts');
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
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'absolute',
                top: '0'}}
                     className="dashboard-center-container">
                    <h1 style={{margin: 'unset', marginTop: '2vmin'}}>Update an Account</h1>
                    <div className="extra-margin"></div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="updateaccountname" className="label">Account Name</label>
                            <input type='text' className="custom-input" name="Account Name"
                                   value={accountName}
                                   id="updateaccountdescription"
                                   autoComplete="Account Description"
                                   onChange={(e) => setAccountName(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="updateaccountdescription" className="label">Account Description</label>
                            <input type='text' className="custom-input" name="Account Description"
                                   value={accountDescription}
                                   id="updateaccountdescription"
                                   autoComplete="Account Description"
                                   onChange={(e) => setAccountDescription(e.target.value)}/>
                        </div>
                        <div className="extra-margin"></div>
                        <div className="input-group">
                            <button type="submit" className="custom-button">Update Account</button>
                        </div>
                        <div className="input-group">
                            <button onClick={() => navigate('/dashboard/chart-of-accounts', {
                                state: {account: accountData}
                            })}
                                    className="custom-button">Go Back
                            </button>
                        </div>
                    </form>
                </div>
            </RightDashboard>
    );
};

export default UpdateTransaction;



