import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import RightDashboard from "./RightDashboard";
import { JournalEntry, MessageResponse, UserType } from "../Types";

const JournalEntryRequests: React.FC = () => {
    const navigate = useNavigate();

    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [isLoading, setIsLoading] = useState(true);
    const [approvedJournalEntries, setApprovedJournalEntries] = useState<JournalEntry[]>([]);
    const [pendingJournalEntries, setPendingJournalEntries] = useState<JournalEntry[]>([]);
    const [rejectedJournalEntries, setRejectedJournalEntries] = useState<JournalEntry[]>([]);
    const [selectedJournalEntry, setSelectedJournalEntry] = useState<JournalEntry | null>(null);

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
            } else if (loggedInUser.userType !== "MANAGER" && loggedInUser.userType !== "ADMINISTRATOR") {
                navigate('/dashboard');
                alert('You do not have permission to view journal entry requests.')
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
        if (!loggedInUser || (loggedInUser.userType !== UserType.ADMINISTRATOR && loggedInUser.userType !== UserType.MANAGER)) {
            alert('You do not have permission to view journal entry requests.');
            return;
        }
        try {
            const response = await fetch(`https://synergyaccounting.app/api/manager/journal-entry-requests/approved`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });
            if (response.ok) {
                const journalEntries: JournalEntry[] = await response.json();
                setApprovedJournalEntries(journalEntries);
            }
            const response1 = await fetch(`https://synergyaccounting.app/api/manager/journal-entry-requests/rejected`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });
            if (response1.ok) {
                const journalEntries: JournalEntry[] = await response1.json();
                setRejectedJournalEntries(journalEntries);
            }
            const response2 = await fetch(`https://synergyaccounting.app/api/manager/journal-entry-requests/pending`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });
            if (response2.ok) {
                const journalEntries: JournalEntry[] = await response2.json();
                setPendingJournalEntries(journalEntries);
            }
        } catch (error) {
            alert('An error has occurred. Please try again!');
            navigate('/dashboard');
        }
    };

    const handleApprove = async () => {
        if (!selectedJournalEntry || !csrfToken) {
            return;
        }
        const ids = selectedJournalEntry.transactions.map(t => t.transactionId);
        try {
            const response = await fetch('https://synergyaccounting.app/api/manager/approve-journal-entry', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(ids)
            });
            const message: MessageResponse = await response.json();
            alert(message.message);
            setSelectedJournalEntry(null);
            getJournalEntries().then();
        } catch (error) {
            alert('Failed to approve journal entry.');
        }
    };

    const handleReject = async () => {
        if (!selectedJournalEntry || !csrfToken) {
            return;
        }
        const ids = selectedJournalEntry.transactions.map(t => t.transactionId);
        try {
            const response = await fetch('https://synergyaccounting.app/api/manager/reject-journal-entry', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(ids)
            });
            const message: MessageResponse = await response.json();
            alert(message.message);
            setSelectedJournalEntry(null);
            getJournalEntries().then();
        } catch (error) {
            alert('Failed to reject journal entry.');
        }
    };

    if (isLoading || !csrfToken || !approvedJournalEntries || !rejectedJournalEntries || !pendingJournalEntries) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            <div className="journal-entry-requests">
                <div className="journal-entries-column">
                    <h2 style={{marginTop: "unset"}}>Approved Journal Entries</h2>
                    {approvedJournalEntries.map((entry, index) => (
                        <div key={index} className="journal-entry">
                            <h3>User: {entry.user.username}</h3>
                            <ul className="transactions-list">
                                {entry.transactions.map((transaction, idx) => (
                                    <li key={idx} className="transaction">
                                        <p><strong>Account:</strong> {transaction.account?.accountName}</p>
                                        <p><strong>Transaction
                                            Date:</strong> {new Date(transaction.transactionDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit'
                                        })}</p>
                                        <p><strong>Description:</strong> {transaction.transactionDescription}</p>
                                        <p><strong>Amount:</strong> ${transaction.transactionAmount.toFixed(2)}</p>
                                        <p><strong>Type:</strong> {transaction.transactionType}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="journal-entries-column">
                    <h2 style={{marginTop: "unset"}}>Pending Journal Entries</h2>
                    {pendingJournalEntries.map((entry, index) => (
                        <div
                            key={index}
                            className={`journal-entry ${selectedJournalEntry === entry ? 'selected' : ''}`}
                            onClick={() => setSelectedJournalEntry(entry)}
                        >
                            <h3>User: {entry.user.username}</h3>
                            <ul className="transactions-list">
                                {entry.transactions.map((transaction, idx) => (
                                    <li key={idx} className="transaction">
                                        <p><strong>Account:</strong> {transaction.account?.accountName}</p>
                                        <p><strong>Transaction Date:</strong> {new Date(transaction.transactionDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit'
                                        })}</p>
                                        <p><strong>Description:</strong> {transaction.transactionDescription}</p>
                                        <p><strong>Amount:</strong> ${transaction.transactionAmount.toFixed(2)}</p>
                                        <p><strong>Type:</strong> {transaction.transactionType}</p>
                                    </li>
                                ))}
                            </ul>
                            {selectedJournalEntry === entry && (
                                <div className="action-buttons">
                                    <button className="control-button" onClick={handleApprove}>Approve</button>
                                    <button className="control-button" onClick={handleReject}>Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="journal-entries-column">
                    <h2 style={{marginTop: "unset"}}>Rejected Journal Entries</h2>
                    {rejectedJournalEntries.map((entry, index) => (
                        <div key={index} className="journal-entry">
                            <h3>User: {entry.user.username}</h3>
                            <ul className="transactions-list">
                                {entry.transactions.map((transaction, idx) => (
                                    <li key={idx} className="transaction">
                                        <p><strong>Account:</strong> {transaction.account?.accountName}</p>
                                        <p><strong>Transaction Date:</strong> {new Date(transaction.transactionDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                                        <p><strong>Description:</strong> {transaction.transactionDescription}</p>
                                        <p><strong>Amount:</strong> ${transaction.transactionAmount.toFixed(2)}</p>
                                        <p><strong>Type:</strong> {transaction.transactionType}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </RightDashboard>
    );
};

export default JournalEntryRequests;
