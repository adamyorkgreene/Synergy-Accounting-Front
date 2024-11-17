import React, { useEffect, useState } from 'react';
import RightDashboard from "./RightDashboard";
import {
    Account,
    AccountCategory,
    AccountSubCategory,
    AccountType,
    JournalEntryResponseDTO,
    TransactionForm,
    UserType
} from "../Types";
import { useCsrf } from "../utilities/CsrfContext";
import { useUser } from "../utilities/UserContext";
import { useNavigate } from "react-router-dom";

const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "image/jpeg",
    "image/png"
];

const JournalEntryForm: React.FC = () => {
    const [transactions, setTransactions] = useState<TransactionForm[]>([
        {
            account: undefined,
            transactionDate: new Date(),
            transactionDescription: '',
            transactionAmount: 0,
            transactionType: AccountType.DEBIT,
            transactionId: undefined,
            pr: undefined
        },
        {
            account: undefined,
            transactionDate: new Date(),
            transactionDescription: '',
            transactionAmount: 0,
            transactionType: AccountType.CREDIT,
            transactionId: undefined,
            pr: undefined
        }
    ]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

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
        init();
    }, [loggedInUser, fetchUser]);

    useEffect(() => {
        if (!isLoading) {
            if (!loggedInUser) {
                navigate('/login');
            } else if (loggedInUser.userType === "USER" || loggedInUser.userType === "DEFAULT") {
                navigate('/dashboard');
                alert('You do not have permission to create journal entries.');
            } else {
                getAccounts();
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    const getAccounts = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        if (!loggedInUser || loggedInUser.userType === UserType.USER) {
            alert('You do not have permission to make a journal entry.');
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
            } else {
                alert('An error has occurred. Please try again.');
            }
        } catch (error) {
            console.error('An error occurred while fetching accounts:', error);
            alert('An error has occurred. Please try again.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => allowedFileTypes.includes(file.type));

        if (validFiles.length !== files.length) {
            alert("Some files were not allowed and were not added.");
        }

        setAttachedFiles(validFiles);
    };

    const handleAddTransaction = () => {
        setTransactions([
            ...transactions,
            {
                account: undefined,
                transactionDate: new Date(),
                transactionDescription: '',
                transactionAmount: 0,
                transactionType: AccountType.DEBIT,
                transactionId: undefined,
                pr: undefined
            },
            {
                account: undefined,
                transactionDate: new Date(),
                transactionDescription: '',
                transactionAmount: 0,
                transactionType: AccountType.CREDIT,
                transactionId: undefined,
                pr: undefined
            }
        ]);
    };

    const handleRemoveTransaction = (index: number) => {
        setTransactions(transactions.filter((_, i) => i !== index));
    };

    const handleAccountChange = (index: number, accountNumber: string) => {
        const selectedAccount = accounts.find(acc => acc.accountNumber.toString() === accountNumber);
        setTransactions(
            transactions.map((tx, i) => (i === index ? { ...tx, account: selectedAccount } : tx))
        );
    };

    const handleInputChange = (index: number, field: string, value: any) => {
        setTransactions(
            transactions.map((tx, i) => (i === index ? { ...tx, [field]: value } : tx))
        );
    };

    const clearTransactions = () => {
        setTransactions([
            {
                account: undefined,
                transactionDate: new Date(),
                transactionDescription: '',
                transactionAmount: 0,
                transactionType: AccountType.DEBIT,
                transactionId: undefined,
                pr: undefined
            },
            {
                account: undefined,
                transactionDate: new Date(),
                transactionDescription: '',
                transactionAmount: 0,
                transactionType: AccountType.CREDIT,
                transactionId: undefined,
                pr: undefined
            }
        ]);
    };

    const handleSubmit = async () => {
        if (!validateBalance()) {
            return;
        }
        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }
        if (transactions.length === 0) {
            alert('You cannot submit an empty set of transactions.');
            return;
        }
        if (!loggedInUser || loggedInUser.userType === UserType.USER) {
            alert('You do not have permission to make a journal entry.');
            return;
        }

        const formData = new FormData();
        transactions.forEach((tx, index) => formData.append(`transactions[${index}]`, JSON.stringify(tx)));
        formData.append("user", JSON.stringify(loggedInUser));

        const endpoint = loggedInUser.userType === UserType.ACCOUNTANT
            ? 'https://synergyaccounting.app/api/accounts/chart-of-accounts/request-journal-entry'
            : 'https://synergyaccounting.app/api/accounts/chart-of-accounts/add-journal-entry';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    transactions: transactions,
                    user: loggedInUser,
                }),
            });

            if (!response.ok) throw new Error("Failed to submit journal entry.");

            const jeResponse: JournalEntryResponseDTO = await response.json();
            alert(jeResponse.messageResponse.message);

            if (attachedFiles.length > 0) {
                const uploadFormData = new FormData();
                attachedFiles.forEach(file => uploadFormData.append("files", file));
                uploadFormData.append("journalEntryId", jeResponse.id.toString());

                const uploadResponse = await fetch('https://synergyaccounting.app/api/accounts/upload-attachments', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    },
                    credentials: 'include',
                    body: uploadFormData
                });

                if (!uploadResponse.ok) {
                    alert("Journal entry created, but failed to upload attachments.");
                } else {
                    alert("Attachments uploaded successfully.");
                }
            }
            // Clear transactions after submission
            clearTransactions();
        } catch (error) {
            console.error('Error:', error);
            alert("An error has occurred. Please try again later.");
        }
    };

    const validateBalance = () => {

        if (!transactions) {
            alert("Transactions cannot be empty.");
            return false;
        }

        // Rule #1: Total debits must equal total credits
        const totalDebit = transactions
            .filter(tx => tx.transactionType === AccountType.DEBIT)
            .reduce((sum, tx) => sum + tx.transactionAmount, 0);

        const totalCredit = transactions
            .filter(tx => tx.transactionType === AccountType.CREDIT)
            .reduce((sum, tx) => sum + tx.transactionAmount, 0);

        if (totalDebit !== totalCredit) {
            alert("Total debits and credits must be equal.");
            return false;
        }

        // Categorize transactions by AccountCategory and AccountSubCategory
        const hasRevenue = transactions.some(tx => tx.account && tx.account.accountCategory === AccountCategory.REVENUE);
        const hasExpense = transactions.some(tx => tx.account && tx.account.accountCategory === AccountCategory.EXPENSE);
        const hasAsset = transactions.some(tx => tx.account && tx.account.accountCategory === AccountCategory.ASSET);
        const hasEquity = transactions.some(tx => tx.account && tx.account.accountCategory === AccountCategory.EQUITY);
        const hasLiability = transactions.some(tx => tx.account && tx.account.accountCategory === AccountCategory.LIABILITY);

        // Check Rule #2: Asset Transfer Restrictions (only if all transactions involve assets)
        const assetTransactions = transactions.filter(tx => tx?.account?.accountCategory === AccountCategory.ASSET);

        if (assetTransactions.length === transactions.length) {
            // Only apply the rule if all transactions are assets with mixed subcategories
            const hasInvalidAssetTransfer = assetTransactions.some((tx, _, arr) =>
                arr.some(otherTx =>
                    otherTx !== tx &&
                    otherTx?.account?.accountSubCategory !== tx?.account?.accountSubCategory
                )
            );
            if (hasInvalidAssetTransfer) {
                alert("Asset transfers are only allowed within the same subcategory (e.g., Current or Long-term).");
                return false;
            }
        }

        const operationalExpense = transactions.some(tx =>
            tx?.account?.accountCategory === AccountCategory.EXPENSE &&
            tx?.account?.accountSubCategory === AccountSubCategory.OPERATING
        );
        const operationalRevenue = transactions.some(tx =>
            tx?.account?.accountCategory === AccountCategory.REVENUE &&
            tx?.account?.accountSubCategory === AccountSubCategory.OPERATING
        );
        const hasAssetOrLiability = transactions.some(tx =>
            tx?.account?.accountCategory === AccountCategory.ASSET ||
            tx?.account?.accountCategory === AccountCategory.LIABILITY
        );

        if (operationalExpense && !operationalRevenue && !hasAssetOrLiability) {
            alert("Operational expenses can only balance with operational revenue, assets, or liabilities.");
            return false;
        }
        if (operationalRevenue && !operationalExpense && !hasAssetOrLiability) {
            alert("Operational revenue can only balance with operational expenses, assets, or liabilities.");
            return false;
        }

        // Allow operational expense or revenue to balance with each other, or with assets or liabilities.
        if (operationalExpense && !operationalRevenue && !hasAssetOrLiability) {
            alert("Operational expenses can only balance with operational revenue, assets, or liabilities.");
            return false;
        }
        if (operationalRevenue && !operationalExpense && !hasAssetOrLiability) {
            alert("Operational revenue can only balance with operational expenses, assets, or liabilities.");
            return false;
        }

        // Rule #4: Non-operational Expense and Revenue Restrictions
        /*const nonOperating = transactions.some(tx =>
            (tx?.account?.accountCategory === AccountCategory.REVENUE || tx?.account?.accountCategory === AccountCategory.EXPENSE) &&
            tx?.account?.accountSubCategory === AccountSubCategory.NONOPERATING
        );

        if (nonOperating && hasAsset) {
            alert("Non-operational expenses/revenue cannot be directly balanced with assets.");
            return false;
        }*/

        // Check Rule #5: Liability to Revenue/Expense Restrictions

        if (hasLiability && hasRevenue && !hasAsset && !hasEquity) {
            alert("Liabilities cannot be directly balanced with revenues.");
            return false;
        }
        if (hasLiability && hasExpense && !hasAsset && !hasEquity) {
            alert("Liabilities cannot be directly balanced with expenses.");
            return false;
        }

        // Check Rule #6: Equity Restriction with Expense and Revenue
        if (hasEquity && hasRevenue && !hasAsset && !hasLiability) {
            alert("Equity accounts cannot be directly balanced with revenue accounts.");
            return false;
        }
        if (hasEquity && hasExpense && !hasAsset && !hasLiability) {
            alert("Equity accounts cannot be directly balanced with expense accounts.");
            return false;
        }

        // Check Rule #7: Owner’s Equity Withdrawals and Investments
        const hasOwnersEquity = transactions.some(tx =>
            tx?.account?.accountCategory === AccountCategory.EQUITY &&
            tx?.account?.accountSubCategory === AccountSubCategory.OWNERS
        );
        const hasInvalidOwnersEquityBalance = hasOwnersEquity && !hasAsset;
        if (hasInvalidOwnersEquityBalance) {
            alert("Owner's equity transactions should only balance with assets (withdrawals or investments).");
            return false;
        }

        // If conditions are met, allow the transaction
        return true;

    };


    return (
        <RightDashboard>
            <div className="update-user-dash" style={{
                alignItems: "center",
                display: 'flex', width: '100%',
                flexFlow: 'column wrap',
                height: "inherit",
                padding: "unset",
                justifyContent: "space-evenly"
            }}>
                <h1 style={{margin: 'unset', marginTop: '2vmin', marginBottom: '2vmin'}}>Add Journal Entry</h1>

                <div style={{
                    marginBottom: '2vmin', display: 'flex', flexDirection: 'row', alignItems: 'center',
                    position: 'relative'
                }}>
                    <label>Attach Source Documents:</label>
                    <label style={{
                        position: 'relative', width: '20vmin', textAlign: 'center', fontSize: '2.5vmin',
                        marginLeft: '2vmin'
                    }} htmlFor="file-upload" className="custom-button custom-file-upload">
                        Select Files
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept={allowedFileTypes.join(",")}
                        style={{display: 'none'}}
                    />
                </div>

                {transactions.map((tx, index) => (
                    <div style={{display: 'flex', alignItems: 'center', width: '90vmin'}} key={index} className="transaction-row">
                        <select
                            value={tx.account?.accountNumber || ''}
                            onChange={(e) => handleAccountChange(index, e.target.value)}
                            className="dropdown-custom"
                        >
                            <option value="">Select Account</option>
                            {accounts.map(account => (
                                <option key={account.accountNumber} value={account.accountNumber}>
                                    {account.accountName}
                                </option>
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
                        <button
                            style={{height: '4.167vmin'}}
                            className="control-button"
                            onClick={() => handleRemoveTransaction(index)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                        <button style={{marginRight: '2vmin'}} className="control-button" onClick={clearTransactions}>Clear Transactions</button>
                        <button className="control-button" onClick={handleAddTransaction}>Add Transactions</button>
                    </div>
                    <button style={{width: '100%'}} className="control-button" onClick={handleSubmit}>Submit Journal Entry</button>
                </div>
            </div>
        </RightDashboard>
    );
};

export default JournalEntryForm;
