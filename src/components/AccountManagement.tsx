import React, { useEffect, useState } from "react";
import axios from 'axios';

interface Account {
    id: number;
    name: string;
    status: string;
}

const AccountManagement: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [newAccountName, setNewAccountName] = useState('');
    const [emailContent, setEmailContent] = useState('');
    const [emailRecipient, setEmailRecipient] = useState('');

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get('/api/accounts');
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
            alert('Failed to fetch accounts. Please try again later.');
        }
    };

    const addAccount = async () => {
        if (!newAccountName.trim()) {
            alert('Please enter a valid account name.');
            return;
        }

        try {
            const response = await axios.post('/api/accounts/add', { name: newAccountName });
            setAccounts([...accounts, response.data]);
            setNewAccountName('');
        } catch (error) {
            console.error('Error adding account:', error);
            alert('Failed to add account. Please try again later.');
        }
    };

    const editAccount = async (account: Account) => {
        const updatedName = prompt('Enter new name for the account', account.name);
        if (updatedName && updatedName.trim()) {
            try {
                const response = await axios.put(`/api/accounts/edit/${account.id}`, { name: updatedName });
                setAccounts(accounts.map(a => a.id === account.id ? response.data : a));
            } catch (error) {
                console.error('Error editing account:', error);
                alert('Failed to edit account. Please try again later.');
            }
        } else {
            alert('Please enter a valid name.');
        }
    };

    const deactivateAccount = async (accountId: number) => {
        try {
            await axios.put(`/api/accounts/deactivate/${accountId}`);
            setAccounts(accounts.map(a => a.id === accountId ? { ...a, status: 'deactivated' } : a));
        } catch (error) {
            console.error('Error deactivating account:', error);
            alert('Failed to deactivate account. Please try again later.');
        }
    };

    const sendEmail = async () => {
        if (!emailRecipient.trim() || !emailContent.trim()) {
            alert('Please enter a valid recipient and content.');
            return;
        }

        try {
            await axios.post('/api/accounts/email', {
                recipient: emailRecipient,
                content: emailContent,
            });
            setEmailContent('');
            setEmailRecipient('');
            alert('Email sent successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email. Please try again later.');
        }
    };

    return (
        <div>
            <h1>Account Management</h1>
            <div>
                <input
                    type="text"
                    placeholder="New Account Name"
                    value={newAccountName}
                    onChange={e => setNewAccountName(e.target.value)}
                />
                <button onClick={addAccount}>Add Account</button>
            </div>
            <ul>
                {accounts.map(account => (
                    <li key={account.id}>
                        {account.name} - {account.status}
                        <button onClick={() => editAccount(account)}>Edit</button>
                        <button onClick={() => deactivateAccount(account.id)}>Deactivate</button>
                    </li>
                ))}
            </ul>

            <div>
                <h2>Send Email</h2>
                <input
                    type="email"
                    placeholder="Recipient Email"
                    value={emailRecipient}
                    onChange={e => setEmailRecipient(e.target.value)}
                />
                <textarea
                    placeholder="Email Content"
                    value={emailContent}
                    onChange={e => setEmailContent(e.target.value)}
                />
                <button onClick={sendEmail}>Send Email</button>
            </div>
        </div>
    );
};

export default AccountManagement;
