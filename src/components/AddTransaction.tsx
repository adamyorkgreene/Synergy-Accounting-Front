import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {Account, AccountType, MessageResponse} from '../Types';
import {useCsrf} from '../utilities/CsrfContext';
import Logo from "../assets/synergylogo.png";
import {useUser} from "../utilities/UserContext";
import RightDashboard from "./RightDashboard";
import Calendar from "./Calandar";

const AddTransaction: React.FC = () => {

    const [selectedAccount, setSelectedAccount] = useState<Account>();
    const [transactionDescription, setTransactionDescription] = useState<string>('');
    const [transactionAmount, setTransactionAmount] = useState<number>();
    const [transactionType, setTransactionType] = useState<AccountType>(AccountType.DEBIT);

    const navigate = useNavigate();
    const location = useLocation();

    const {csrfToken} = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (location.state && location.state?.selectedAccount) {
            setSelectedAccount(location.state.selectedAccount as Account);
        }
    }, [location.state, selectedAccount, setSelectedAccount]);

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
        if (!isLoading && (!loggedInUser || loggedInUser.userType !== "ADMINISTRATOR")) {
            navigate('/login');
        }
    }, [loggedInUser, isLoading, navigate]);

    const handleTypeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTransactionType(e.target.value as AccountType);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!transactionDescription || !transactionType || transactionAmount === undefined) {
            alert('All fields must be filled out!');
            return;
        }

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        try {

            if (!selectedAccount) {
                alert('Account selected was not passed to transaction. Please try again.');
                return;
            }

            const response = await fetch('https://synergyaccounting.app/api/accounts/chart-of-accounts/add-transaction', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    accountNumber: selectedAccount.accountNumber,
                    transactionDescription,
                    transactionType,
                    transactionAmount: transactionAmount || null,
                }),
            });
            if (response.ok) {
                alert("Transaction has been added to: " + selectedAccount.accountName);
                navigate('/dashboard/chart-of-accounts', { state: { account: selectedAccount } });
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
                <div className="dashboard-center-container">
                    <div className="center-text">Add a New Transaction</div>
                    <div className="extra-margin"></div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="addtransactiondescription" className="label">Transaction
                                Description</label>
                            <input type='text' className="custom-input" name="Transaction Description"
                                   value={transactionDescription}
                                   id="addtransactiondescription"
                                   autoComplete="Transaction Description"
                                   onChange={(e) => setTransactionDescription(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="addtransactionamount" className="label">Transaction Amount</label>
                            <input type='number' className="custom-input" name="Initial Balance"
                                   value={transactionAmount}
                                   id="addtransactionamount"
                                   autoComplete="Transaction Amount"
                                   onChange={(e) => setTransactionAmount(e.target.valueAsNumber)}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="addtransactiontype" className="label">Transaction Type </label>
                            <select
                                id="addtransactiontype"
                                value={transactionType}
                                onChange={handleTypeChange}
                                className="custom-input"
                                name="transactionType"
                            >
                                <option value={AccountType.DEBIT}>Debit</option>
                                <option value={AccountType.CREDIT}>Credit</option>
                            </select>
                        </div>
                        <div className="extra-margin"></div>
                        <div className="input-group">
                            <button type="submit" className="custom-button">Add Transaction</button>
                        </div>
                        <div className="input-group">
                            <button onClick={() => navigate('/dashboard/chart-of-accounts', {
                                state:
                                    {account: selectedAccount}
                            })}
                                    className="custom-button">Go Back
                            </button>
                        </div>
                    </form>
                </div>
            </RightDashboard>
    );

};

export default AddTransaction;



