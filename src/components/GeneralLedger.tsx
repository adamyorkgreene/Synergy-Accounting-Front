import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import RightDashboard from "./RightDashboard";
import {Account, JournalEntry, MessageResponse, TransactionForm, UserType} from "../Types";
import AccountLedger from "./AccountLedger";
import { formatCurrency } from '../utilities/Formatter';

const GeneralLedger: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [transactions, setTransactions] = useState<TransactionForm[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sortKey, setSortKey] = useState<keyof TransactionForm | 'account' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [selectedTransactions, setSelectedTransactions] = useState<TransactionForm[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

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
            } else if (!selectedAccount) {
                getJournalEntries();
            }
        }
    }, [loggedInUser, isLoading, location.key, navigate, selectedAccount]);


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
                setTransactions(journalEntries.flatMap(entry => entry.transactions));
                if (location.state?.selectedAccount) {
                    handleAccountClick(location.state.selectedAccount);
                }
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

        filteredTransactions.forEach((transaction) => {
            const accountNumber = transaction.account?.accountNumber;
            if (accountNumber) {
                if (!accountMap[accountNumber]) {
                    accountMap[accountNumber] = [];
                }
                accountMap[accountNumber].push(transaction);
            }
        });

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
        navigate('/dashboard/general-ledger');
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

    if (isLoading || !csrfToken || !loggedInUser) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            <div className="chart-container">
                {selectedAccount ? (
                        <AccountLedger
                            account={selectedAccount}
                            transactions={transactions}
                            selectedTransactions={selectedTransactions}
                            onTransactionSelect={handleChange}
                            onDeleteTransactions={handleDeleteTransactions}
                            onBack={handleGoBack}
                            loggedInUser={loggedInUser}
                            onUpdateActivation={handleUpdateActivation}
                        />

                ) : (
                    <>
                        <h1 style={{margin: 'unset'}}>General Ledger</h1>
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
                                let runningBalance = account.initialBalance;
                                return (
                                    <React.Fragment key={accountNumber}>
                                        <tr onClick={() => handleAccountClick(account)} className="chart-of-accounts-row">
                                            <td colSpan={6} style={{ fontWeight: "bold" }}>
                                                {account.accountName} (#{accountNumber})
                                            </td>
                                        </tr>
                                        {accountTransactions.map((transaction, index) => {
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
                                                    <td>{transaction.transactionType === "DEBIT" ? formatCurrency(transaction.transactionAmount) : '$0.00'}</td>
                                                    <td>{transaction.transactionType === "CREDIT" ? formatCurrency(transaction.transactionAmount) : '$0.00'}</td>
                                                    <td>{formatCurrency(runningBalance)}</td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </RightDashboard>
    );
};

export default GeneralLedger;
