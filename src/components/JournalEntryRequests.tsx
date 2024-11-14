import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import RightDashboard from "./RightDashboard";
import { JournalEntry, MessageResponse } from "../Types";

const JournalEntryRequests: React.FC = () => {
    const navigate = useNavigate();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [isLoading, setIsLoading] = useState(true);
    const [approvedJournalEntries, setApprovedJournalEntries] = useState<JournalEntry[]>([]);
    const [pendingJournalEntries, setPendingJournalEntries] = useState<JournalEntry[]>([]);
    const [rejectedJournalEntries, setRejectedJournalEntries] = useState<JournalEntry[]>([]);
    const [attachmentLinks, setAttachmentLinks] = useState<{ [key: number]: string[] }>({});
    const [selectedJournalEntry, setSelectedJournalEntry] = useState<JournalEntry | null>(null);
    const [comments, setComments] = useState<string>("");
    const [filterDate, setFilterDate] = useState<string>("");

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
            } else if (loggedInUser.userType !== "MANAGER" && loggedInUser.userType !== "ADMINISTRATOR") {
                navigate('/dashboard');
                alert('You do not have permission to view journal entry requests.');
            } else {
                getJournalEntries();
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

            const approvedEntries = approvedRes.ok ? await approvedRes.json() : [];
            const rejectedEntries = rejectedRes.ok ? await rejectedRes.json() : [];
            const pendingEntries = pendingRes.ok ? await pendingRes.json() : [];

            setApprovedJournalEntries(approvedEntries);
            setRejectedJournalEntries(rejectedEntries);
            setPendingJournalEntries(pendingEntries);

            // Fetch attachments for all entries
            await fetchAllAttachments([...approvedEntries, ...rejectedEntries, ...pendingEntries]);
        } catch (error) {
            alert('An error has occurred. Please try again!');
            navigate('/dashboard');
        }
    };

    const fetchAllAttachments = async (entries: JournalEntry[]) => {
        for (const entry of entries) {
            await fetchAttachments(entry.pr);
        }
    };

    const fetchAttachments = async (journalEntryId: number) => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        try {
            const response = await fetch(`https://synergyaccounting.app/api/accounts/uploads/${journalEntryId}`, {
                method: 'GET',
                headers: { 'X-CSRF-TOKEN': csrfToken },
                credentials: 'include'
            });
            if (response.ok) {
                const attachmentNames = await response.json();
                setAttachmentLinks(prev => ({ ...prev, [journalEntryId]: attachmentNames }));
            } else {
                setAttachmentLinks(prev => ({ ...prev, [journalEntryId]: [] }));
            }
        } catch (error) {
            console.error("Error fetching attachments:", error);
            setAttachmentLinks(prev => ({ ...prev, [journalEntryId]: [] }));
        }
    };

    const renderAttachmentLinks = (entryId: number) => {
        const attachments = attachmentLinks[entryId] || [];
        return attachments.map((fileName, index) => (
            <li key={index}>
                <a
                    href={`https://synergyaccounting.app/api/accounts/uploads/${entryId}/${encodeURIComponent(fileName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {fileName}
                </a>
            </li>
        ));
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
            getJournalEntries();
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
            getJournalEntries();
        } catch (error) {
            alert('Failed to reject journal entry.');
        }
    };

    const filterEntriesByDate = (entries: JournalEntry[]) => {
        if (!filterDate) return entries;
        return entries.filter(entry =>
            entry.transactions.some(transaction => {
                const transactionDate = new Date(transaction.transactionDate).toLocaleDateString('en-CA');
                return transactionDate === filterDate;
            })
        );
    };

    if (isLoading || !csrfToken || !approvedJournalEntries || !rejectedJournalEntries || !pendingJournalEntries) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            <div style={{display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent: 'center',
            padding: '20px', position: 'relative', marginRight: '2vmin'}}>
                <div style={{position: 'relative', width: '95%', display: 'flex', alignItems: 'center',
                justifyContent: 'flex-end'}} className="filter-section">
                    <label style={{marginRight: '2vmin'}} htmlFor="filterDate">Filter by Date:</label>
                    <input
                        type="date"
                        id="filterDate"
                        className="custom-input"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <div style={{gridGap: 'unset', gap: 'unset', padding: 'unset', width: '95%', paddingTop: '20px',
                justifyContent: 'flex-end'}} className="journal-entry-requests">
                    <div style={{margin: 'unset'}} className="journal-entries-column">
                        <h2>Approved Journal Entries</h2>
                        {filterEntriesByDate(approvedJournalEntries).map((entry, index) => (
                            <div onClick={() => {
                                navigate('/dashboard/journal-entry-detail', {state: {token: entry.pr}})
                            }}
                                 key={index} className="journal-entry">
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
                                <div className="attachments-section">
                                    <h5 style={{marginBottom: '0', marginTop: '0'}}>Source Documents:</h5>
                                    <ul style={{
                                        fontSize: '1.5vmin',
                                        listStyleType: 'decimal',
                                        paddingLeft: '1.5em',
                                        textAlign: 'left',
                                        margin: '2.5vmin'
                                    }}>
                                        {renderAttachmentLinks(entry.pr)}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{margin: 'unset', marginRight: '20px', marginLeft: '20px'}}  className="journal-entries-column">
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
                                <div className="attachments-section">
                                    <h5 style={{marginBottom: '0', marginTop: '0'}}>Source Documents:</h5>
                                    <ul style={{
                                        fontSize: '1.5vmin',
                                        listStyleType: 'decimal',
                                        paddingLeft: '1.5em',
                                        textAlign: 'left',
                                        margin: '2.5vmin'
                                    }}>
                                        {renderAttachmentLinks(entry.pr)}
                                    </ul>
                                </div>
                                {selectedJournalEntry === entry && (
                                    <div style={{display: 'flex', flexDirection: 'column'}}
                                         className="action-buttons">
                                    <textarea
                                        placeholder="Leave comments here..."
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                    />
                                        <button style={{width: '100%'}}
                                                className="control-button" onClick={handleApprove}>Approve
                                        </button>
                                        <button style={{width: '100%'}}
                                                className="control-button" onClick={handleReject}>Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{margin: 'unset'}} className="journal-entries-column">
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
                                <div className="attachments-section">
                                    <h5 style={{marginBottom: '0', marginTop: '0'}}>Source Documents:</h5>
                                    <ul style={{
                                        fontSize: '1.5vmin',
                                        listStyleType: 'decimal',
                                        paddingLeft: '1.5em',
                                        textAlign: 'left',
                                        margin: '2.5vmin'
                                    }}>
                                        {renderAttachmentLinks(entry.pr)}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </RightDashboard>
    )
        ;
};

export default JournalEntryRequests;
