import React, { useState, useEffect } from 'react';
import Calendar from "./Calandar";
import RightDashboard from "./RightDashboard";
import Logo from "../assets/synergylogo.png";
import { Account, AccountType, MessageResponse } from "../Types";
import { useCsrf } from "../utilities/CsrfContext";
import { useUser } from "../utilities/UserContext";
import { useNavigate } from "react-router-dom";

interface TransactionForm {
    accountNumber: number;
    transactionDate: Date;
    transactionDescription: string;
    transactionAmount: number;
    transactionType: AccountType;
}

const JournalEntryForm: React.FC = () => {
    const [transactions, setTransactions] = useState<TransactionForm[]>([
        {
            accountNumber: 0, // Placeholder for debit
            transactionDate: new Date(),
            transactionDescription: '',
            transactionAmount: 0,
            transactionType: AccountType.DEBIT
        },
        {
            accountNumber: 0, // Placeholder for credit
            transactionDate: new Date(),
            transactionDescription: '',
            transactionAmount: 0,
            transactionType: AccountType.CREDIT
        }
    ]);
    const [accounts, setAccounts] = useState<Account[]>([]);

    const navigate = useNavigate();
    const { csrfToken } = useCsrf();
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
        if (!isLoading && (!loggedInUser || loggedInUser.userType === "DEFAULT")) {
            navigate('/login');
        } else {
            getAccounts().then();
        }
    }, [loggedInUser, isLoading, navigate]);

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
            } else if (response.status === 403) {
                alert('You do not have permission to access this resource.');
                return;
            } else {
                alert('An error has occurred. Please try again.');
            }
        } catch (error) {
            console.error('An error occurred while fetching accounts:', error);
            alert('An error has occurred. Please try again.');
        }
    };

    const handleAddTransaction = () => {
        setTransactions([...transactions,
            {
                accountNumber: 0, // Placeholder for new debit
                transactionDate: new Date(),
                transactionDescription: '',
                transactionAmount: 0,
                transactionType: AccountType.DEBIT
            },
            {
                accountNumber: 0, // Placeholder for new credit
                transactionDate: new Date(),
                transactionDescription: '',
                transactionAmount: 0,
                transactionType: AccountType.CREDIT
            }
        ]);
    };

    const handleRemoveTransaction = (index: number) => {
        setTransactions(transactions.filter((_, i) => i !== index));
    };

    const handleInputChange = (index: number, field: string, value: any) => {
        setTransactions(
            transactions.map((tx, i) =>
                i === index ? { ...tx, [field]: value } : tx
            )
        );
    };

    const validateBalance = () => {
        const totalDebit = transactions
            .filter(tx => tx.transactionType === AccountType.DEBIT)
            .reduce((sum, tx) => sum + tx.transactionAmount, 0);

        const totalCredit = transactions
            .filter(tx => tx.transactionType === AccountType.CREDIT)
            .reduce((sum, tx) => sum + tx.transactionAmount, 0);

        return totalDebit === totalCredit;
    };

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    const handleSubmit = async () => {
        if (!validateBalance()) {
            alert('Debits and credits must be equal.');
            return;
        }
        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }
        if (transactions.length === 0) {
            alert('You cannot submit an empty set of transactions.')
            return;
        }

        for (const transaction of transactions) {

            if (!transaction.accountNumber) {
                alert('All transactions must belong to a specified account.')
                return;
            }

            if (!transaction.transactionType) {
                alert("Transaction type (credit or debit) must be specified.")
                return;
            }

            if (!transaction.transactionAmount) {
                alert("Transaction amount must be specified.")
                return;
            }

            try {
                const response = await fetch('https://synergyaccounting.app/api/accounts/chart-of-accounts/add-transaction', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        accountNumber: transaction.accountNumber,
                        transactionDescription: transaction.transactionDescription || "",
                        transactionType: transaction.transactionType,
                        transactionAmount: transaction.transactionAmount || null,
                    }),
                });

                if (response.ok) {
                    continue;
                }

                if (response.status === 401) {
                    alert("You don't have permission to perform this action.");
                    return;
                } else {
                    const msgResponse: MessageResponse = await response.json();
                    alert(msgResponse.message);
                    return;
                }

            } catch (error) {
                console.error('Error:', error);
                alert("An error has occurred. Please try again later.");
                return;
            }
        }

        alert("All transactions have been added successfully.");

    };

    return (
        <RightDashboard>
                <div className="update-user-dash" style={{
                    alignItems: "center", flexDirection: "column", height: "inherit",
                    padding: "unset", justifyContent: "unset"
                }}>
                    <h3 style={{marginBottom: "2vmin"}}>Add Journal Entry</h3>
                    {transactions.map((tx, index) => (
                        <div key={index} className="transaction-row">
                            <select
                                value={tx.accountNumber}
                                onChange={(e) => handleInputChange(index, 'accountNumber', parseInt(e.target.value))}
                                className="dropdown-custom"
                            >
                                <option value="">Select Account</option>
                                {accounts.map(account => (
                                    <option key={account.accountNumber}
                                            value={account.accountNumber}>{account.accountName}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={tx.transactionAmount}
                                onChange={(e) => handleInputChange(index, 'transactionAmount', parseFloat(e.target.value))}
                                placeholder="Amount"
                                className="custom-input"
                            />
                            <select
                                value={tx.transactionType}
                                onChange={(e) => handleInputChange(index, 'transactionType', e.target.value as AccountType)}
                                className="dropdown-custom"
                            >
                                <option value="">Select Type</option>
                                <option value={AccountType.DEBIT}>Debit</option>
                                <option value={AccountType.CREDIT}>Credit</option>
                            </select>
                            <input
                                type="text"
                                className="custom-input"
                                value={tx.transactionDescription}
                                onChange={(e) => handleInputChange(index, 'transactionDescription', e.target.value)}
                                placeholder="Description"
                            />
                            <button style={{
                                width: "22.274vmin",
                                height: "calc(2.778vmin * 1.5)",
                                transform: "translateY(0.15vmin)"
                            }}
                                    className="control-button" onClick={() => handleRemoveTransaction(index)}>Remove
                            </button>
                        </div>
                    ))}
                    <button className="control-button" onClick={handleAddTransaction}>Add Transactions</button>
                    <button className="control-button" onClick={handleSubmit}>Submit Journal Entry</button>
                </div>
            </RightDashboard>
    );
};

export default JournalEntryForm;