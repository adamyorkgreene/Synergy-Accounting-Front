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
    const [comments, setComments] = useState<string>("");
    const [filterDate, setFilterDate] = useState<string>(""); // State for selected filter date

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
            } else if (loggedInUser.userType !== "MANAGER" && loggedInUser.userType !== "ADMINISTRATOR") {
                navigate('/dashboard');
                alert('You do not have permission to view journal entry requests.');
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
            const [approvedRes, rejectedRes, pendingRes] = await Promise.all([
                fetch(`https://synergyaccounting.app/api/manager/journal-entry-requests/approved`, {
                    method: 'GET',
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    credentials: 'include'
                }),
                fetch(`https://synergyaccounting.app/api/manager/journal-entry-requests/rejected`, {
                    method: 'GET',
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    credentials: 'include'
                }),
                fetch(`https://synergyaccounting.app/api/manager/journal-entry-requests/pending`, {
                    method: 'GET',
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    credentials: 'include'
                })
            ]);

            if (approvedRes.ok) {
                setApprovedJournalEntries(await approvedRes.json());
            }
            if (rejectedRes.ok) {
                setRejectedJournalEntries(await rejectedRes.json());
            }
            if (pendingRes.ok) {
                setPendingJournalEntries(await pendingRes.json());
            }
        } catch (error) {
            alert('An error has occurred. Please try again!');
            navigate('/dashboard');
        }
    };

    const handleApprove = async () => {
        if (!selectedJournalEntry || !csrfToken) return;
        const ids = selectedJournalEntry.transactions.map(t => t.transactionId);
        try {
            const response = await fetch('https://synergyaccounting.app/api/manager/approve-journal-entry', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ids, comments: comments || "" })
            });
            const message: MessageResponse = await response.json();
            alert(message.message);
            setSelectedJournalEntry(null);
            setComments("");
            getJournalEntries().then();
        } catch (error) {
            alert('Failed to approve journal entry.');
        }
    };

    const handleReject = async () => {
        if (!selectedJournalEntry || !csrfToken) return;
        if (comments.trim() === "") {
            alert("Comments are required when rejecting a journal entry.");
            return;
        }
        const ids = selectedJournalEntry.transactions.map(t => t.transactionId);
        try {
            const response = await fetch('https://synergyaccounting.app/api/manager/reject-journal-entry', {
                method: 'POST',
                headers: { 'X-CSRF-TOKEN': csrfToken, 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ ids, comments })
            });
            const message: MessageResponse = await response.json();
            alert(message.message);
            setSelectedJournalEntry(null);
            setComments("");
            getJournalEntries().then();
        } catch (error) {
            alert('Failed to reject journal entry.');
        }
    };

    // Filter entries by selected date
    const filterEntriesByDate = (entries: JournalEntry[]) => {
        if (!filterDate) return entries;
        return entries.filter(entry =>
            entry.transactions.some(transaction => {
                const transactionDate = new Date(transaction.transactionDate).toLocaleDateString('en-CA');
                return transactionDate === filterDate;
            })
        );
    };

    useEffect(() => {
        console.log("Updated Approved Entries:", approvedJournalEntries);
        console.log("Updated Rejected Entries:", rejectedJournalEntries);
        console.log("Updated Pending Entries:", pendingJournalEntries);
    }, [approvedJournalEntries, rejectedJournalEntries, pendingJournalEntries]);

    if (isLoading || !csrfToken || !approvedJournalEntries || !rejectedJournalEntries || !pendingJournalEntries) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            <div style={{marginTop: '2vmin'}} className="filter-section">
                <label htmlFor="filterDate">Filter by Date: </label>
                <input
                    type="date"
                    id="filterDate"
                    className="custom-input"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
            </div>
            <div className="journal-entry-requests">
                <div className="journal-entries-column">
                    <h2>Approved Journal Entries</h2>
                    {filterEntriesByDate(approvedJournalEntries).map((entry, index) => (
                        <div key={index} className="journal-entry">
                            <h3>User: {entry.user.username}</h3>
                            <ul className="transactions-list">
                                {entry.transactions.map((transaction, idx) => (
                                    <li key={idx} className="transaction">
                                        <p><strong>Account:</strong> {transaction.account?.accountName}</p>
                                        <p><strong>Transaction
                                            Date:</strong> {new Date(transaction.transactionDate).toLocaleDateString()}
                                        </p>
                                        <p><strong>Description:</strong> {transaction.transactionDescription}</p>
                                        <p><strong>Amount:</strong> ${transaction.transactionAmount.toFixed(2)}</p>
                                        <p><strong>Type:</strong> {transaction.transactionType}</p>
                                    </li>
                                ))}
                            </ul>
                            {entry.comments && entry.comments.trim() !== "" && (
                                <p><strong>Comments:</strong> {entry.comments}</p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="journal-entries-column">
                    <h2>Pending Journal Entries</h2>
                    {filterEntriesByDate(pendingJournalEntries).map((entry, index) => (
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
                                        <p><strong>Transaction
                                            Date:</strong> {new Date(transaction.transactionDate).toLocaleDateString()}
                                        </p>
                                        <p><strong>Description:</strong> {transaction.transactionDescription}</p>
                                        <p><strong>Amount:</strong> ${transaction.transactionAmount.toFixed(2)}</p>
                                        <p><strong>Type:</strong> {transaction.transactionType}</p>
                                    </li>
                                ))}
                            </ul>
                            {selectedJournalEntry === entry && (
                                <div className="action-buttons">
                                    <textarea
                                        placeholder="Leave comments here..."
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                    />
                                    <button className="control-button" onClick={handleApprove}>Approve</button>
                                    <button className="control-button" onClick={handleReject}>Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="journal-entries-column">
                    <h2>Rejected Journal Entries</h2>
                    {filterEntriesByDate(rejectedJournalEntries).map((entry, index) => (
                        <div key={index} className="journal-entry">
                            <h3>User: {entry.user.username}</h3>
                            <ul className="transactions-list">
                                {entry.transactions.map((transaction, idx) => (
                                    <li key={idx} className="transaction">
                                        <p><strong>Account:</strong> {transaction.account?.accountName}</p>
                                        <p><strong>Transaction
                                            Date:</strong> {new Date(transaction.transactionDate).toLocaleDateString()}
                                        </p>
                                        <p><strong>Description:</strong> {transaction.transactionDescription}</p>
                                        <p><strong>Amount:</strong> ${transaction.transactionAmount.toFixed(2)}</p>
                                        <p><strong>Type:</strong> {transaction.transactionType}</p>
                                    </li>
                                ))}
                            </ul>
                            {entry.comments && entry.comments.trim() !== "" && (
                                <p><strong>Comments:</strong> {entry.comments}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </RightDashboard>
    );
};

export default JournalEntryRequests;
