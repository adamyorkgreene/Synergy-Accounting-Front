import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {AccountType, MessageResponse, TransactionForm} from '../Types';
import {useCsrf} from '../utilities/CsrfContext';
import {useUser} from "../utilities/UserContext";
import RightDashboard from "./RightDashboard";

const UpdateTransaction: React.FC = () => {

    const [transactionId] = useState<number>();
    const [, setTransaction] = useState<TransactionForm>();
    const [transactionDescription, setTransactionDescription] = useState<string>();
    const [transactionAmount, setTransactionAmount] = useState<number>();
    const [transactionType, setTransactionType] = useState<AccountType>(AccountType.DEBIT);

    const navigate = useNavigate();
    const location = useLocation();

    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [isLoading, setIsLoading] = useState(true);
    const account = location.state?.account;
    const origin = location.state?.origin;

    useEffect(() => {
        if (location.state?.transaction) {
            const transactionData = location.state.transaction as TransactionForm;
            setTransaction(transactionData);
            setTransactionDescription(transactionData.transactionDescription);
            setTransactionAmount(transactionData.transactionAmount);
            setTransactionType(transactionData.transactionType);
        }
    }, [location.state]);

    const handleGoBack = () => {
        if (origin && account) {
            navigate(`/dashboard/${origin}`, { state: { selectedAccount: account } });
        } else {
            navigate('/dashboard/chart-of-accounts');
        }
    };

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
                alert('You do not have permission to update transactions.')
            }
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

            if (!transactionId) {
                alert("Transaction ID is missing.");
                return;
            }

            const response = await fetch('https://synergyaccounting.app/api/accounts/chart-of-accounts/update-transaction', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    transactionId,
                    transactionDescription,
                    transactionType,
                    transactionAmount: transactionAmount || null,
                }),
            });
            if (response.ok) {
                alert("Transaction has been updated!");
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
                <div style={{position: 'absolute', top: '0'}} className="dashboard-center-container">
                    <h1 style={{margin: 'unset', marginTop: '2vmin', marginBottom: '2vmin'}}>Update a Transaction</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="updatetransactiondescription" className="label">Transaction
                                Description</label>
                            <input type='text' className="custom-input" name="Transaction Description"
                                   value={transactionDescription}
                                   id="updatetransactiondescription"
                                   autoComplete="Transaction Description"
                                   onChange={(e) => setTransactionDescription(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="updatetransactionamount" className="label">Transaction Amount</label>
                            <input type='number' className="custom-input" name="Initial Balance"
                                   value={transactionAmount}
                                   id="updatetransactionamount"
                                   autoComplete="Transaction Amount"
                                   onChange={(e) => setTransactionAmount(e.target.valueAsNumber)}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="updatetransactiontype" className="label">Transaction Type </label>
                            <select
                                id="updatetransactiontype"
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
                            <button type="submit" className="custom-button">Update Transaction</button>
                        </div>
                        <div className="input-group">
                            <button onClick={handleGoBack}
                                    className="custom-button">Go Back
                            </button>
                        </div>
                    </form>
                </div>
            </RightDashboard>
    );
};

export default UpdateTransaction;



