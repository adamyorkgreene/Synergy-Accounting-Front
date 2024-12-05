import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import {Email, MessageResponse} from "../Types";
import EmailPopup from "./EmailPopup";
import RightDashboard from "./RightDashboard";

const AdminInbox: React.FC = () => {

    const navigate = useNavigate();

    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [emails, setEmails] = useState<Email[] | null>([]);
    const [selectedEmails, setSelectedEmails] = useState<Email[]>([]);
    const [clickedEmail, setClickedEmail] = useState<Email | null>();
    const [isEmailOpen, setIsEmailOpen] = useState(false);

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
            } else {
                getEmails().then();
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    const getEmails = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        try {
            const response = await fetch(`https://synergyaccounting.app/api/email/emails/${loggedInUser?.username}`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });

            if (response.status === 403) {
                alert('You do not have permission to view these emails.');
                navigate('/dashboard');
                return;
            } else if (response.status === 204) {
                setEmails(null);
                return;
            } else if (response.ok) {
                const emails: Email[] = await response.json();
                const sortedEmails = emails.sort((a, b) => {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                });
                setEmails(sortedEmails);
            } else {
                const message: MessageResponse = await response.json();
                alert(message.message);
            }

        } catch (error) {
            alert('An error has occurred. Please try again.');
            console.log(error);
            navigate('/dashboard');
        }
    };

    const handleChange = async (email: Email, isChecked: boolean) => {
        if (emails) {
            if (isChecked) {
                setSelectedEmails(prev => [...prev, email]);
            } else {
                setSelectedEmails(prev => prev.filter(id => id !== email));
            }
        }
    }

    const openEmail = async (email: Email) => {
        try {
            if (!csrfToken) {
                console.error('CSRF token is not available.');
                return;
            }
            const response = await fetch(`https://synergyaccounting.app/api/email/mark-as-read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({ username: loggedInUser?.username, id: email.id }),
            });

            if (response.ok) {
                console.log(`Email ${email.id} marked as read.`);

                setEmails((prevEmails) =>
                    prevEmails
                        ? prevEmails.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
                        : prevEmails // Return null if prevEmails is null
                );

            } else {
                console.error(`Failed to mark email ${email.id} as read:`, response.statusText);
            }
        } catch (error) {
            console.error('Error marking email as read:', error);
        }
        setClickedEmail(email);
        setIsEmailOpen(true);
    };

    const closeEmail = () => {
        setIsEmailOpen(false);
        setClickedEmail(null);
    };

    const handleDelete = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        try {
            const response = await fetch('https://synergyaccounting.app/api/email/emails/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(selectedEmails)
            });

            if (response.status === 403) {
                alert('You do not have permission to delete these emails.');
                return;
            }

            const responseMsg: MessageResponse = await response.json();
            alert(responseMsg.message)

            if (!(response.status === 204) && emails && selectedEmails) {
                if (response.ok) {
                    setEmails(emails.filter(email => !selectedEmails.includes(email)));
                    setSelectedEmails([]);
                }
            }

        } catch (error) {
            alert('An error occurred while deleting emails.');
            console.log(error);
        }
    };

    const handleSort = (key: keyof Email) => {
        if (emails) {
            const sortedEmails = [...emails].sort((a, b) => {
                const aValue = a[key] ?? "";
                const bValue = b[key] ?? "";

                if (key === 'date') {
                    const aDate = new Date(aValue as string).getTime();
                    const bDate = new Date(bValue as string).getTime();
                    return bDate - aDate; // Sort by most recent date
                }

                if (aValue < bValue) return -1;
                if (aValue > bValue) return 1;
                return 0;
            });
            setEmails(sortedEmails);
        }
    };

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    return (
            <RightDashboard propUnreadCount={emails ? emails.filter((email) => !email.isRead).length : 0}>
                <div style={{display: 'flex', justifyContent: 'flex-start', flexDirection: 'column'}}
                    className="chart-container">
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center',
                        justifyContent: 'space-between'}}>
                        <button className="control-button add-account-button"
                                onClick={handleDelete}
                                disabled={selectedEmails?.length === 0}
                                style={{right: "unset", left: "unset", position: 'relative', margin: 'unset',
                                    height: '5vmin'
                                }}>Delete Selected Emails
                        </button>
                        <h1 style={{margin: 'unset'}}>Inbox</h1>
                        <button className="control-button add-account-button"
                                style={{right: "unset", left: "unset", position: 'relative', margin: 'unset',
                                    height: '5vmin'}}
                                onClick={() => navigate("/dashboard/admin/send-email")}>Compose New Email
                        </button>
                    </div>
                    <table id="chartOfAccountsTable">
                        <thead>
                        <tr>
                            <th>Select</th>
                            <th onClick={() => handleSort('date')}>Date</th>
                            <th onClick={() => handleSort('from')}>From</th>
                            <th onClick={() => handleSort('subject')}>Subject</th>
                        </tr>
                        </thead>
                        <tbody>
                        {emails?.map((email) => {
                            console.log(`Email ID: ${email.id}, isRead: ${email.isRead}`);
                            return (
                                <tr
                                    key={email.date}
                                    onClick={() => openEmail(email)}
                                    className={email.isRead ? 'read-email' : 'unread-email'} // Apply conditional class
                                >
                                    <td>
                                        <input
                                            type="checkbox"
                                            id={email.id}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleChange(email, e.target.checked)}
                                        />
                                    </td>
                                    <td>{new Date(email.date).toLocaleString()}</td>
                                    <td>{email.from}</td>
                                    <td>{email.subject}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    {isEmailOpen && clickedEmail && (
                        <EmailPopup email={clickedEmail} onClose={closeEmail}/>
                    )}
                </div>
            </RightDashboard>
        );
    };
export default AdminInbox;
