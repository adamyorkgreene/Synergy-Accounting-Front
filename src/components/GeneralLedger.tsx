import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import RightDashboard from "./RightDashboard";
import {Account, AccountType, JournalEntry, MessageResponse, Transaction, TransactionForm, UserType} from "../Types";
import trashCanIcon from "../assets/trashcan.png";

const GeneralLedger: React.FC = () => {
    const navigate = useNavigate();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [transactions, setTransactions] = useState<TransactionForm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortKey, setSortKey] = useState<keyof TransactionForm | 'account' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [selectedTransactions, setSelectedTransactions] = useState<TransactionForm[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>(''); // Add search state

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
            } else if (loggedInUser.userType === "DEFAULT" || loggedInUser.userType === "USER") {
                navigate('/dashboard');
                alert('You do not have permission to view the general ledger.');
            } else {
                getJournalEntries().then();
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    const getJournalEntries = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        try {
            const response = await fetch(`https://synergyaccounting.app/api/accounts/general-ledger`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });

            if (response.ok) {
                const journalEntries: JournalEntry[] = await response.json();
                const allTransactions = journalEntries.flatMap(entry => entry.transactions);
                setTransactions(allTransactions);
            } else if (response.status === 403) {
                alert('You do not have permission to access this resource.');
                navigate('/dashboard');
            } else {
                alert('An error occurred while fetching transactions.');
            }
        } catch (error) {
            alert('An error has occurred. Please try again!');
            navigate('/dashboard');
        }
    };

    const handleAccountClick = async (account: Account) => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        setSelectedAccount(account);
        const response = await fetch(`/api/accounts/chart-of-accounts/${account.accountNumber}`, {
            method: 'GET',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            },
            credentials: 'include'
        });

        if (response.ok) {
            const transactions: TransactionForm[] = await response.json();
            console.log(transactions);
            setTransactions(transactions);
        } else {
            alert('Failed to fetch transactions.');
        }
    };

    const getSortedTransactionsByAccount = () => {
        const accountMap: { [accountNumber: string]: TransactionForm[] } = {};

        // Filter transactions based on search query
        const filteredTransactions = transactions.filter((transaction) => {
            const accountName = transaction.account?.accountName?.toLowerCase() || '';
            const amount = transaction.transactionAmount.toString();
            const date = new Date(transaction.transactionDate).toLocaleDateString('en-US');

            return (
                accountName.includes(searchQuery.toLowerCase()) ||
                amount.includes(searchQuery) ||
                date.includes(searchQuery)
            );
        });

        // Group transactions by account
        filteredTransactions.forEach((transaction) => {
            const accountNumber = transaction.account?.accountNumber;
            if (accountNumber) {
                if (!accountMap[accountNumber]) {
                    accountMap[accountNumber] = [];
                }
                accountMap[accountNumber].push(transaction);
            }
        });

        // Sort transactions within each account group
        Object.keys(accountMap).forEach(account => {
            accountMap[account].sort((a, b) => {
                if (!sortKey) return 0;

                let aValue = a[sortKey];
                let bValue = b[sortKey];

                if (sortKey === 'account') {
                    aValue = a.account?.accountNumber || 0;
                    bValue = b.account?.accountNumber || 0;
                }

                if (aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
                if (bValue === undefined) return sortOrder === 'asc' ? -1 : 1;

                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        });

        return accountMap;
    };

    const handleDeleteTransactions = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        if (!loggedInUser || loggedInUser.userType !== UserType.ADMINISTRATOR) {
            alert('You do not have permission to delete these transactions.');
            return;
        }
        try {
            const response = await fetch('https://synergyaccounting.app/api/accounts/chart-of-accounts/delete-transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(selectedTransactions)
            });

            if (response.status === 403) {
                alert('You do not have permission to delete these transactions.');
                return;
            }
            const responseMsg: MessageResponse = await response.json();
            alert(responseMsg.message)
            if (!(response.status === 204) && transactions && selectedTransactions) {
                if (response.ok) {
                    setTransactions(transactions.filter(transaction => !selectedTransactions.includes(transaction)));
                    setSelectedTransactions([]);
                    getJournalEntries().then();
                }
            }

        } catch (error) {
            alert('An error occurred while deleting transactions.');
            console.log(error);
        }
    };

    const handleSort = (key: keyof TransactionForm | 'account') => {
        setSortKey(key);
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleGoBack = () => {
        setSelectedAccount(null);
        setSelectedTransactions([]);
        getJournalEntries(); // Refresh the general ledger when going back
    };

    const handleChange = async (transaction: TransactionForm, isChecked: boolean) => {
        if (transactions) {
            if (isChecked) {
                setSelectedTransactions(prev => [...prev, transaction]);
            } else {
                setSelectedTransactions(prev => prev.filter(id => id !== transaction));
            }
        }
    }

    const handleUpdateActivation = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        if (!loggedInUser || loggedInUser.userType !== UserType.ADMINISTRATOR) {
            alert('You do not have permission to deactivate this account.');
            return;
        }
        try {
            const response = await fetch('https://synergyaccounting.app/api/accounts/chart-of-accounts/update-activation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(selectedAccount)
            });
            if (response.status === 403) {
                alert('You do not have permission to change this account activation.');
                return;
            }
            if (response.ok) {
                const AccountResponse: Account = await response.json();
                alert(AccountResponse.accountName + " has been updated.");
            }
        } catch (error) {
            alert('An error occurred while deactivating account.');
            console.log(error);
        }
    };

    const sortedAccounts = getSortedTransactionsByAccount();

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            <div className="chart-container">
                {selectedAccount === null ? (
                    <>
                        <label className="center-text" style={{ fontSize: "5vmin", marginBottom: "2vmin" }}>
                            General Ledger
                        </label>
                        <div style={{width: '100%', display: 'flex', flexDirection: 'row'}} className="search-bar">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search by Account, Amount, or Date"
                                style={{marginBottom: "1rem", marginTop: "1rem", width: "100%", padding: "8px"}}
                            />
                            <button
                                onClick={() => navigate('/dashboard/journal-entry-form',
                                    {state: {selectedAccount}})}
                                className="control-button add-account-button"
                                title="Add Journal Entry"
                                style={{width: '3%', height: 'auto', position: 'relative', marginTop: '1rem',
                                marginBottom: '1rem', marginLeft: '1rem', right: 'unset'}}>
                                +
                            </button>
                        </div>
                        <table id="chartOfAccountsTable">
                            <thead>
                            <tr>
                                <th onClick={() => handleSort('account')}>Account</th>
                                <th onClick={() => handleSort('transactionDate')}>Date</th>
                                <th onClick={() => handleSort('transactionDescription')}>Description</th>
                                <th onClick={() => handleSort('transactionType')}>Debit</th>
                                <th onClick={() => handleSort('transactionType')}>Credit</th>
                                <th onClick={() => handleSort('transactionAmount')}>Balance</th>
                            </tr>
                            </thead>
                            <tbody>
                            {Object.keys(sortedAccounts).map(accountNumber => {
                                const accountTransactions = sortedAccounts[accountNumber];
                                const account = accountTransactions[0]?.account;
                                if (!account) return null;

                                // Initialize running balance with the account's initial balance
                                let runningBalance = account.initialBalance;

                                return (
                                    <React.Fragment key={accountNumber}>
                                        <tr onClick={() => handleAccountClick(account)} className="chart-of-accounts-row">
                                            <td colSpan={6} style={{ fontWeight: "bold" }}>
                                                {account.accountName} (#{accountNumber})
                                            </td>
                                        </tr>
                                        {accountTransactions.map((transaction, index) => {
                                            // Update running balance based on account's normal balance type
                                            if (account.normalSide === "DEBIT") {
                                                if (transaction.transactionType === "DEBIT") {
                                                    runningBalance += transaction.transactionAmount;
                                                } else {
                                                    runningBalance -= transaction.transactionAmount;
                                                }
                                            } else if (account.normalSide === "CREDIT") {
                                                if (transaction.transactionType === "CREDIT") {
                                                    runningBalance += transaction.transactionAmount;
                                                } else {
                                                    runningBalance -= transaction.transactionAmount;
                                                }
                                            }

                                            return (
                                                <tr key={index} className="chart-of-accounts-row">
                                                    <td>{transaction.account?.accountName || 'Unknown Account'}</td>
                                                    <td>{new Date(transaction.transactionDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit'
                                                    })}</td>
                                                    <td>{transaction.transactionDescription}</td>
                                                    <td>{transaction.transactionType === "DEBIT" ? transaction.transactionAmount.toFixed(2) : ''}</td>
                                                    <td>{transaction.transactionType === "CREDIT" ? transaction.transactionAmount.toFixed(2) : ''}</td>
                                                    <td>{runningBalance.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <>
                        <label className="center-text" style={{fontSize: "5vmin", marginBottom: "2vmin"}}>
                            Account Ledger: {selectedAccount.accountName}<br/></label>
                        <div style={{marginTop: '1vmin', right: '0', position: 'absolute'}}
                             className="button-container">
                            <div style={{position: 'relative'}}
                                 className="button-container">
                                <button style={{position: 'relative', right: '0'}} onClick={() => handleGoBack()}
                                        className="control-button add-account-button">Go Back
                                </button>
                                {selectedAccount.isActive ? (
                                    <button style={{position: 'relative', right: '0'}}
                                            onClick={() => handleUpdateActivation()}
                                            className="control-button add-account-button">Deactivate Account
                                    </button>
                                ) : (
                                    <button style={{position: 'relative', right: '0'}}
                                            onClick={() => handleUpdateActivation()}
                                            className="control-button add-account-button">Activate Account
                                    </button>
                                )}
                                <button style={{position: 'relative', right: '0'}}
                                        onClick={() =>
                                            navigate('/dashboard/chart-of-accounts/update-account', {state: {selectedAccount}})}
                                        className="control-button add-account-button">Update Account
                                </button>
                            </div>
                            <div style={{position: 'relative', marginLeft: '34.3vw'}}
                                 className="button-container">
                                <button onClick={handleDeleteTransactions}
                                        className="control-button transaction-button"
                                        disabled={selectedTransactions.length === 0}>
                                    <img src={trashCanIcon} alt="Delete"
                                         style={{width: '20px', height: '20px'}}/>
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard/chart-of-accounts/add-transaction',
                                        {state: {selectedAccount}})}
                                    style={{aspectRatio: "1/1", width: "2rem"}}
                                    className="control-button transaction-button">
                                    +
                                </button>
                            </div>
                        </div>
                        <table id="transactionTable" style={{marginTop: "8vmin"}}>
                            <thead>
                            <tr>
                                <th style={{width: 'min-content'}}>Select</th>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Debit</th>
                                <th>Credit</th>
                                <th>Balance</th>
                                <th>PR</th>
                            </tr>
                            </thead>
                            <tbody>
                            {(() => {
                                let runningBalance = selectedAccount.initialBalance;
                                return transactions.map((transaction) => {
                                    if (selectedAccount.normalSide === "DEBIT") {
                                        if (transaction.transactionType === "DEBIT") {
                                            runningBalance += transaction.transactionAmount;
                                        } else {
                                            runningBalance -= transaction.transactionAmount;
                                        }
                                    } else {
                                        if (transaction.transactionType === "DEBIT") {
                                            runningBalance -= transaction.transactionAmount;
                                        } else {
                                            runningBalance += transaction.transactionAmount;
                                        }
                                    }
                                    return (
                                        <tr key={transaction.transactionId} onClick={() =>
                                            loggedInUser?.userType === "ADMINISTRATOR" && (
                                                navigate('/dashboard/chart-of-accounts/update-transaction', {state: {transaction}}))}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) =>
                                                        handleChange(transaction, e.target.checked)
                                                    }
                                                />
                                            </td>
                                            <td>{new Date(transaction?.transactionDate).toLocaleDateString()}</td>
                                            <td>{transaction.transactionDescription}</td>
                                            <td>{transaction.transactionType === "DEBIT" ? transaction.transactionAmount.toFixed(2) : ''}</td>
                                            <td>{transaction.transactionType === "CREDIT" ? transaction.transactionAmount.toFixed(2) : ''}</td>
                                            <td>{runningBalance.toFixed(2)}</td>
                                            <td
                                                className="pr-column"
                                                style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate('/dashboard/journal-entry-detail', {state: {token: transaction.pr}});
                                                }}>
                                                {transaction.pr ? transaction.pr : 'N/A'}
                                            </td>
                                        </tr>
                                    );
                                });
                            })()}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </RightDashboard>
    );
};

export default GeneralLedger;
