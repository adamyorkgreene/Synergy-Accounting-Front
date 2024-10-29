import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import { JournalEntry, TransactionForm, AccountType } from "../Types";
import RightDashboard from "./RightDashboard";

const JournalEntryDetail: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [isLoading, setIsLoading] = useState(true);
    const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
    const [attachments, setAttachments] = useState<string[]>([]);

    const token = location.state?.token;

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
                fetchJournalEntry().then(fetchAttachments);
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    const fetchJournalEntry = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        try {
            const response = await fetch(`/api/accounts/journal-entry/${token}`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });

            if (response.ok) {
                const data: JournalEntry = await response.json();
                setJournalEntry(data);
            } else {
                alert('Failed to fetch journal entry.');
            }
        } catch (error) {
            console.error("Error fetching journal entry:", error);
            alert('An error occurred. Please try again.');
        }
    };

    const fetchAttachments = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        try {
            const response = await fetch(`/api/accounts/uploads/${token}`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });
            if (response.ok) {
                const attachmentNames = await response.json();
                setAttachments(attachmentNames);
            } else {
                setAttachments([]);
            }
        } catch (error) {
            console.error("Error fetching attachments:", error);
            setAttachments([]);
        }
    };

    if (isLoading || !csrfToken || !journalEntry) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            <div style={{ padding: '2vmin 5vmin 5vmin', position: 'absolute', top: '0' }}
                 className="journal-entry-container">
                <h1 style={{margin: 'unset'}}>Journal Entry Details - PR #{token}</h1>
                <table id="chartOfAccountsTable">
                    <thead>
                    <tr>
                        <th>Account</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Debit</th>
                        <th>Credit</th>
                    </tr>
                    </thead>
                    <tbody>
                    {journalEntry.transactions.map((transaction: TransactionForm, index) => (
                        <tr key={index}>
                            <td>{transaction.account?.accountName || 'Unknown Account'}</td>
                            <td>{new Date(transaction.transactionDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            })}</td>
                            <td>{transaction.transactionDescription}</td>
                            <td>{transaction.transactionType === AccountType.DEBIT ? transaction.transactionAmount.toFixed(2) : ''}</td>
                            <td>{transaction.transactionType === AccountType.CREDIT ? transaction.transactionAmount.toFixed(2) : ''}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {attachments.length > 0 && (
                    <div style={{ marginTop: '3vmin', padding: '2vmin', color: 'black', background: '#f9f9f9',
                    border: '10px solid #aabdb8'}}>
                        <h5 style={{margin: 'unset'}}>Source Documents:</h5>
                        <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5em', fontSize: '2vmin' }}>
                            {attachments.map((fileName, index) => (
                                <li style={{textAlign: 'left'}} key={index}>
                                    <a
                                        href={`/api/accounts/uploads/${token}/${encodeURIComponent(fileName)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: 'underline', color: '#317a6b'}}
                                    >
                                        {fileName}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </RightDashboard>
    );
};

export default JournalEntryDetail;
