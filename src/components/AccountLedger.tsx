import React from 'react';
import {Account, User, TransactionForm} from "../Types";
import trashCanIcon from "../assets/trashcan.png";
import { useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency } from '../utilities/Formatter';

interface AccountLedgerProps {
    account: Account;
    transactions: TransactionForm[];
    selectedTransactions: TransactionForm[];
    onTransactionSelect: (transaction: TransactionForm, isChecked: boolean) => void;
    onDeleteTransactions: () => void;
    onBack: () => void;
    loggedInUser: User;
    onUpdateActivation: () => void;
}

const AccountLedger: React.FC<AccountLedgerProps> = ({
                                                         account,
                                                         transactions,
                                                         selectedTransactions,
                                                         onTransactionSelect,
                                                         onDeleteTransactions,
                                                         onBack,
                                                         onUpdateActivation,
                                                     }) => {
    const navigate = useNavigate();
    const location = useLocation();
    let runningBalance = account.initialBalance;

    const handleTransactionClick = (transaction: TransactionForm) => {
        navigate('/dashboard/chart-of-accounts/update-transaction', {
            state: {
                transaction,
                account,
                origin: location.pathname.includes('chart-of-accounts') ? 'chart-of-accounts' : 'general-ledger'
            }
        });
    };

    return (
        <>
            <h1 style={{ margin: 'unset' }}>
                Account Ledger: {account.accountName}<br />
            </h1>
            <div
                style={{
                    marginTop: 'unset',
                    right: 'unset',
                    position: 'relative',
                    top: 'unset',
                    height: 'unset',
                    width: '100%',
                    maxWidth: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
                className="button-container"
            >
                <div
                    className="button-container"
                    style={{
                        position: 'relative',
                        width: 'unset',
                        height: 'unset',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        right: 'unset',
                        marginTop: 'unset',
                    }}
                >
                    <button
                        style={{ position: 'relative', right: '0', height: '2rem', width: 'auto' }}
                        onClick={onBack}
                        className="control-button add-account-button"
                    >
                        Go Back
                    </button>
                    {account.isActive ? (
                        <button
                            style={{ position: 'relative', right: '0', height: '2rem' }}
                            onClick={onUpdateActivation}
                            className="control-button add-account-button"
                        >
                            Deactivate Account
                        </button>
                    ) : (
                        <button
                            style={{ position: 'relative', right: '0', height: '2rem' }}
                            onClick={onUpdateActivation}
                            className="control-button add-account-button"
                        >
                            Activate Account
                        </button>
                    )}
                    <button
                        style={{ position: 'relative', right: '0', height: '2rem' }}
                        onClick={() => navigate('/dashboard/chart-of-accounts/update-account', { state: { selectedAccount: account } })}
                        className="control-button add-account-button"
                    >
                        Update Account
                    </button>
                    <button
                        style={{ position: 'relative', right: '0', height: '2rem' }}
                        onClick={() => navigate('/dashboard/chart-of-accounts/event-logs', { state: { token: account.accountNumber } })}
                        className="control-button add-account-button"
                    >
                        Account Logs
                    </button>
                </div>
                <div
                    className="button-container"
                    style={{
                        position: 'relative',
                        width: 'unset',
                        height: 'unset',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        right: 'unset',
                        marginTop: 'unset',
                    }}
                >
                    <button
                        onClick={onDeleteTransactions}
                        style={{ width: "2rem", height: "2rem" }}
                        className="control-button transaction-button"
                        disabled={selectedTransactions.length === 0}
                    >
                        <img
                            src={trashCanIcon}
                            alt="Delete"
                            style={{ width: '20px', height: '20px', position: "absolute", left: "7px", top: "18px" }}
                        />
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/chart-of-accounts/add-transaction', { state: { account } })}
                        style={{ aspectRatio: "1/1", width: "2rem", height: "2rem" }}
                        className="control-button transaction-button"
                    >
                        +
                    </button>
                </div>
            </div>
            <table id="transactionTable">
                <thead>
                <tr>
                    <th style={{ width: 'min-content' }}>Select</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Balance</th>
                    <th>PR</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map((transaction) => {
                    // Update running balance based on account's normal balance type
                    if (account.normalSide === "DEBIT") {
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
                        <tr
                            key={transaction.transactionId}
                            onClick={() => handleTransactionClick(transaction)}
                        >
                            <td>
                                <input
                                    type="checkbox"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => onTransactionSelect(transaction, e.target.checked)}
                                />
                            </td>
                            <td>{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                            <td>{transaction.transactionDescription}</td>
                            <td>{transaction.transactionType === "DEBIT" ? formatCurrency(transaction.transactionAmount) : '$0.00'}</td>
                            <td>{transaction.transactionType === "CREDIT" ? formatCurrency(transaction.transactionAmount) : '$0.00'}</td>
                            <td>{formatCurrency(runningBalance)}</td>
                            <td
                                className="pr-column"
                                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/dashboard/journal-entry-detail', { state: { token: transaction.pr } });
                                }}
                            >
                                {transaction.pr ? transaction.pr : 'N/A'}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </>
    );
};

export default AccountLedger;
