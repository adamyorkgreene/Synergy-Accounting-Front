import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Account, AccountCategory, AccountSubCategory, AccountType, MessageResponse} from '../Types';
import {useCsrf} from '../utilities/CsrfContext';
import {useUser} from "../utilities/UserContext";
import RightDashboard from "./RightDashboard";

const AddAccount: React.FC = () => {

    const [accountName, setAccountName] = useState<string>('');
    const [accountDescription, setAccountDescription] = useState<string>('');
    const [normalSide, setNormalSide] = useState<AccountType>(AccountType.DEBIT);
    const [accountCategory, setAccountCategory] = useState<AccountCategory>(AccountCategory.ASSET);
    const [accountSubCategory, setAccountSubcategory] = useState<AccountSubCategory>(AccountSubCategory.CURRENT);
    const [initialBalance, setInitialBalance] = useState<number>();

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);

    const { csrfToken} = useCsrf(); // Ensure the CSRF context includes refresh logic
    const { user: loggedInUser, fetchUser } = useUser(); // Updated for consistency with the new context API

    useEffect(() => {
        const init = async () => {
            await fetchUser(); // Refresh user instead of fetchUser for updated logic
            setIsLoading(false);
        };
        init();
    }, [fetchUser]); // Updated dependency array to match the new function

    useEffect(() => {
        if (!isLoading) {
            if (!loggedInUser) {
                navigate('/login');
            } else if (loggedInUser.userType !== "ADMINISTRATOR") {
                navigate('/dashboard/chart-of-accounts');
                alert('You do not have permission to create accounts.');
            }
        }
    }, [loggedInUser, isLoading, navigate]);


    const handleTypeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNormalSide(e.target.value as AccountType);
    }

    const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAccountCategory(e.target.value as AccountCategory);
    }

    const handleSubCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAccountSubcategory(e.target.value as AccountSubCategory);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!accountName || !accountDescription || !normalSide || !accountCategory || !accountSubCategory
                || initialBalance === undefined) {
            alert('All fields must be filled out!');
            return;
        }

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        try {

            const response = await fetch('https://synergyaccounting.app/api/accounts/chart-of-accounts/add-account', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({
                    accountName,
                    accountDescription,
                    normalSide,
                    accountCategory,
                    accountSubCategory,
                    initialBalance: initialBalance || null,
                    creator: loggedInUser?.userid || null
                }),
            });
            if (response.ok) {
                const accountResponse: Account = await response.json();
                alert("Account: " + accountResponse.accountName + " has been added!");
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

    return (
            <RightDashboard>
                <div className="dashboard-center-container">
                    <h1 style={{margin: 'unset'}}>Add a New Account</h1>
                    <div className="extra-margin"></div>
                    <form onSubmit={handleSubmit}>
                        {[
                            {label: 'Account Name', value: accountName, setValue: setAccountName},
                            {
                                label: 'Account Description',
                                value: accountDescription,
                                setValue: setAccountDescription
                            },
                        ].map(({label, value, setValue}, index) => (
                            <div className="input-group" key={index}>
                                <label htmlFor={"addaccount" + label} className="label">{label}</label>
                                <input type="text" className="custom-input" name={label} value={value}
                                       id={"addaccount" + label}
                                       autoComplete={label.toString()} onChange={(e) => setValue(e.target.value)}/>
                            </div>
                        ))}
                        <div className="input-group">
                            <label htmlFor="addaccountinitialbal" className="label">Initial Balance</label>
                            <input type='number' className="custom-input" name="Initial Balance"
                                   value={initialBalance}
                                   id="addaccountinitialbal"
                                   autoComplete="Initial Balance"
                                   onChange={(e) => setInitialBalance(e.target.valueAsNumber)}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="addaccounttype" className="label">Account Type </label>
                            <select
                                id="addaccounttype"
                                value={normalSide}
                                onChange={handleTypeChange}
                                className="custom-input"
                                name="accountType"
                            >
                                <option value={AccountType.DEBIT}>Debit</option>
                                <option value={AccountType.CREDIT}>Credit</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor="addaccountcategory" className="label">Account Category </label>
                            <select
                                id="addaccountcategory"
                                value={accountCategory}
                                onChange={handleCategoryChange}
                                className="custom-input"
                                name="accountCategory"
                            >
                                <option value={AccountCategory.ASSET}>Asset</option>
                                <option value={AccountCategory.EQUITY}>Equity</option>
                                <option value={AccountCategory.EXPENSE}>Expense</option>
                                <option value={AccountCategory.REVENUE}>Revenue</option>
                                <option value={AccountCategory.LIABILITY}>Liability</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor="addaccountsubcategory" className="label">Account Subcategory </label>
                            <select
                                id="addaccountsubcategory"
                                value={accountSubCategory}
                                onChange={handleSubCategoryChange}
                                className="custom-input"
                                name="accountSubCategory"
                            >
                                <option value={AccountSubCategory.CURRENT}>Current</option>
                                <option value={AccountSubCategory.LONGTERM}>Long-term</option>
                                <option value={AccountSubCategory.OPERATING}>Operating</option>
                                <option value={AccountSubCategory.NONOPERATING}>Non-Operating</option>
                                <option value={AccountSubCategory.SHAREHOLDERS}>Shareholders</option>
                                <option value={AccountSubCategory.OWNERS}>Owners</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label htmlFor="statementType" className="label">Statement Type</label>
                            <input
                                type="text"
                                className="custom-input"
                                id="statementType"
                                value={getStatementType(accountCategory)}
                                readOnly
                            />
                        </div>
                        <div className="extra-margin"></div>
                        <div className="input-group">
                            <button type="submit" className="custom-button">Add Account</button>
                        </div>
                        <div className="input-group">
                            <button onClick={() => navigate('/dashboard/chart-of-accounts/')}
                                    className="custom-button">Go Back
                            </button>
                        </div>
                    </form>
                </div>
            </RightDashboard>
    );

};

export default AddAccount;



