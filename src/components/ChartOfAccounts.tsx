import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useCsrf} from '../utilities/CsrfContext';
import {useUser} from '../utilities/UserContext';
import Logo from "../assets/synergylogo.png";
import {Account, AccountCategory, AccountType, MessageResponse, Transaction, UserType} from "../Types";
import RightDashboard from "./RightDashboard";
import trashCanIcon from "../assets/trashcan.png";
import Calendar from "./Calandar";

const ChartOfAccounts: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);

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
        if (!isLoading) {
            if (!loggedInUser) {
                navigate('/login')
            }
            else if (loggedInUser.userType === "DEFAULT" || loggedInUser.userType === "USER"){
                navigate('/dashboard');
                alert('You do not have permission to view the chart of accounts.')
            } else {
                getAccounts().then()
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    const getAccounts = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        if (!loggedInUser || loggedInUser.userType === UserType.USER) {
            alert('You do not have permission to view the chart of accounts.');
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
                console.log('Accounts: ', accounts)
                if (location.state && location.state.selectedAccount) {
                    await handleAccountClick(location.state.selectedAccount);
                }

            } else if (response.status === 403) {
                alert('You do not have permission to access this resource.');
                navigate('/dashboard');
                return;
            } else {
                const message: MessageResponse = await response.json();
                alert(message);
                navigate('/dashboard');
                return;
            }
        } catch (error) {
            alert('An error has occurred. Please try again! Please try again.');
            navigate('/dashboard');
        }
    };

    const handleChange = async (transaction: Transaction, isChecked: boolean) => {
        if (transactions) {
            if (isChecked) {
                setSelectedTransactions(prev => [...prev, transaction]);
            } else {
                setSelectedTransactions(prev => prev.filter(id => id !== transaction));
            }
        }
    }

    const handleSort = (key: keyof Account | 'statementType') => {
        const sortedAccounts = [...accounts].sort((a, b) => {
            if (key === 'statementType') {
                const statementTypeA = getStatementType(a.accountCategory);
                const statementTypeB = getStatementType(b.accountCategory);

                if (statementTypeA < statementTypeB) {
                    return -1;
                }
                if (statementTypeA > statementTypeB) {
                    return 1;
                }
                return 0;
            }
            if (a[key] < b[key]) {
                return -1;
            }
            if (a[key] > b[key]) {
                return 1;
            }
            return 0;
        });
        setAccounts(sortedAccounts);
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
            const transactions: Transaction[] = await response.json();
            console.log(transactions);
            setTransactions(transactions);
        } else {
            alert('Failed to fetch transactions.');
        }
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
                    getAccounts().then();
                }
            }

        } catch (error) {
            alert('An error occurred while deleting transactions.');
            console.log(error);
        }
    };

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
            if (!(response.status === 204) && transactions && selectedTransactions) {
                if (response.ok) {
                    const AccountResponse: Account = await response.json();
                    const index: number = selectedAccount ? accounts.indexOf(selectedAccount) : -1;
                    accounts[index] = AccountResponse;
                    setSelectedAccount(AccountResponse);
                } else {
                    const MsgResponse: MessageResponse = await response.json();
                    alert(MsgResponse.message);
                }
            }

        } catch (error) {
            alert('An error occurred while deactivating account.');
            console.log(error);
        }
    };

    const handleGoBack = () => {
        setSelectedAccount(null);
        setTransactions([]);
    };

    const getStatementType = (accountCategory: AccountCategory): string => {
        switch (accountCategory) {
            case AccountCategory.ASSET:
            case AccountCategory.LIABILITY:
            case AccountCategory.EQUITY:
                return 'Balance Sheet (BS)';
            case AccountCategory.REVENUE:
            case AccountCategory.EXPENSE:
                return 'Income Statement (IS)';
            default:
                return 'Retained Earnings (RE)';
        }
    };

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    // @ts-ignore
    return (
            <RightDashboard>
                    <div className="chart-container">
                        {selectedAccount === null ? <>
                                <h1 style={{margin: 'unset'}}>Chart of Accounts</h1>
                                <div style={{ position: 'relative',
                                    width: '100%', display: 'flex', flexDirection: 'row-reverse',
                                alignItems: 'flex-end'}} className="search-bar">
                                    <button
                                        onClick={() => navigate('/dashboard/chart-of-accounts/add',
                                            {state: {selectedAccount}})}
                                        title="Add Account"
                                        style={{right: '0', height: '2rem', width: '2rem'}}
                                        className="control-button add-account-button">
                                        +
                                    </button>
                                </div>
                                <table id="chartOfAccountsTable">
                                    <thead>
                                    <tr>
                                        <th onClick={() => handleSort('accountNumber')}>Account Number</th>
                                        <th onClick={() => handleSort('accountName')}>Account Name</th>
                                        <th onClick={() => handleSort('accountDescription')}>Account Description</th>
                                        <th onClick={() => handleSort('normalSide')}>Normal Side</th>
                                        <th onClick={() => handleSort('accountCategory')}>Category</th>
                                        <th onClick={() => handleSort('accountSubCategory')}>Subcategory</th>
                                    <th onClick={() => handleSort('currentBalance')}>Current Balance</th>
                                    <th onClick={() => handleSort('dateAdded')}>Date Added</th>
                                    <th onClick={() => handleSort('statementType')}>Statement Type</th>
                                    <th onClick={() => handleSort('username')}>Creator</th>
                                </tr>
                                </thead>
                                <tbody>
                                {accounts.map((account) => {
                                    const currentBalance = account.normalSide === AccountType.DEBIT
                                        ? account.debitBalance - account.creditBalance
                                        : account.creditBalance - account.debitBalance;
                                    const statementType = getStatementType(account.accountCategory);
                                    return (
                                        <tr
                                            key={account.accountNumber}
                                            onClick={() => handleAccountClick(account)}
                                            style={{opacity: account.isActive ? 1 : 0.5}}
                                        >
                                            <td>{account.accountNumber}</td>
                                            <td>{account.accountName}</td>
                                            <td>{account.accountDescription}</td>
                                            <td>{account.normalSide}</td>
                                            <td>{account.accountCategory}</td>
                                            <td>{account.accountSubCategory}</td>
                                            <td>{currentBalance.toFixed(2)}</td>
                                            <td>{new Date(account.dateAdded).toLocaleDateString()}</td>
                                            <td>{statementType}</td>
                                            <td>{account.username}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </>
                        : <>
                                <h1 style={{margin: 'unset'}}>
                                    Account Ledger: {selectedAccount.accountName}<br /></h1>
                                <div style={{marginTop: 'unset', right: 'unset', position: 'relative', top: 'unset',
                                    height: 'unset', width: '100%', maxWidth: '100%', display: 'flex', justifyContent:
                                    'space-between'}}
                                    className="button-container">
                                    <div className="button-container"
                                         style={{position: 'relative', width: 'unset', height: 'unset', display: 'flex',
                                             justifyContent: 'flex-end', right: 'unset', marginTop: 'unset'}}>
                                        <button style={{position: 'relative', right: '0', height: '2rem', width: 'auto'}}
                                                onClick={() => handleGoBack()}
                                                className="control-button add-account-button">Go Back
                                        </button>
                                        {selectedAccount.isActive ? (
                                            <button style={{position: 'relative', right: '0', height: '2rem'}}
                                                    onClick={() => handleUpdateActivation()}
                                                    className="control-button add-account-button">Deactivate Account
                                            </button>
                                        ) : (
                                            <button style={{position: 'relative', right: '0', height: '2rem'}}
                                                    onClick={() => handleUpdateActivation()}
                                                    className="control-button add-account-button">Activate Account
                                            </button>
                                        )}
                                        <button style={{position: 'relative', right: '0', height: '2rem'}}
                                                onClick={() =>
                                                    navigate('/dashboard/chart-of-accounts/update-account', {state: {selectedAccount}})}
                                                className="control-button add-account-button">Update Account
                                        </button>
                                        <button style={{position: 'relative', right: '0', height: '2rem'}}
                                                onClick={() =>
                                                    navigate('/dashboard/chart-of-accounts/event-logs', {state: {token: selectedAccount.accountNumber}})}
                                                className="control-button add-account-button">Account Logs
                                        </button>
                                    </div>
                                    <div className="button-container"
                                         style={{position: 'relative', width: 'unset', height: 'unset', display: 'flex',
                                             justifyContent: 'flex-end', right: 'unset', marginTop: 'unset'}}>
                                        <button onClick={handleDeleteTransactions}
                                                style={{width: "2rem", height: "2rem"}}
                                                className="control-button transaction-button"
                                                disabled={selectedTransactions.length === 0}>
                                        <img src={trashCanIcon} alt="Delete"
                                                 style={{width: '20px', height: '20px', position: "absolute", left: "7px", top: "18px"}}/>
                                        </button>
                                        <button
                                            onClick={() => navigate('/dashboard/chart-of-accounts/add-transaction',
                                                {state: {selectedAccount}})}
                                            style={{aspectRatio: "1/1", width: "2rem", height: "2rem"}}
                                            className="control-button transaction-button">
                                            +
                                        </button>
                                    </div>
                                </div>
                                <table id="transactionTable">
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
                                                        navigate('/dashboard/chart-of-accounts/update-transaction', { state: { transaction } }))}>
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
                                                        style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline'}}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/dashboard/journal-entry-detail', { state: { token: transaction.pr } });
                                                        }}>
                                                        {transaction.pr ? transaction.pr : 'N/A'}
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                    </tbody>
                                </table>
                            </>}
                    </div>
            </RightDashboard>
    );
};
export default ChartOfAccounts;
