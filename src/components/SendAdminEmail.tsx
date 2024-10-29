import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import RightDashboard from "./RightDashboard";

const SendAdminEmail: React.FC = () => {
    const navigate = useNavigate();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [to, setTo] = useState<string>('');
    const [subject, setSubject] = useState<string>('');
    const [body, setBody] = useState<string>('');
    const [accountantEmails, setAccountantEmails] = useState<string[]>([]);
    const [managerEmails, setManagerEmails] = useState<string[]>([]);
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
                navigate('/login');
            } else if (loggedInUser.userType === "USER" || loggedInUser.userType === "DEFAULT") {
                navigate('/dashboard');
                alert('You do not have permission to send emails.');
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
            const response = await fetch('https://synergyaccounting.app/api/email/get-all-emails/accountant', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
            });
            if (response.ok) {
                const emails: string[] = await response.json();
                setAccountantEmails(emails);
            }
            const response1 = await fetch('https://synergyaccounting.app/api/email/get-all-emails/manager', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
            });
            if (response1.ok) {
                const emails: string[] = await response1.json();
                setManagerEmails(emails);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!to || !subject || !body) {
            alert('Please fill in all fields.');
            return;
        }

        if (!csrfToken) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        try {
            const response = await fetch('https://synergyaccounting.app/api/email/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify({ to, from: loggedInUser?.username, subject, body }),
            });

            if (response.ok) {
                alert('Email has been sent successfully.');
                navigate('/dashboard/admin/inbox');
            } else {
                const errorResponse = await response.json();
                alert(`Failed to send email: ${errorResponse.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleEmailClick = (email: string) => {
        setTo(email);
    };

    if (isLoading || !csrfToken || !accountantEmails || !managerEmails) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            <div className="send-admin-email">
                <div style={{fontSize: '1.5vmin'}}
                     className="email-column">
                    <h2>Accountant Emails</h2>
                    <ul className="email-list">
                        {accountantEmails.map((email, index) => (
                            <li key={index} className="email-item" onClick={() => handleEmailClick(email)}>
                                {email}
                            </li>
                        ))}
                    </ul>
                </div>
                <form style={{width: '70vmin'}} className="email-form" onSubmit={handleSubmit}>
                    <h2>Send an Email</h2>
                    <div className="input-group">
                        <input
                            type="text"
                            className="custom-input"
                            value={to}
                            style={{width: '100%'}}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="Recipient email address"
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            className="custom-input"
                            value={subject}
                            style={{width: '100%'}}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email subject"
                        />
                    </div>
                    <div className="input-group">
                        <textarea
                            className="custom-textarea"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Email body"
                            rows={10}
                        />
                    </div>
                    <div className="input-group">
                        <button type="submit" className="control-button">Send Email</button>
                    </div>
                </form>
                <div style={{fontSize: '1.5vmin'}}
                     className="email-column">
                    <h2>Manager Emails</h2>
                    <ul className="email-list">
                        {managerEmails.map((email, index) => (
                            <li key={index} className="email-item" onClick={() => handleEmailClick(email)}>
                                {email}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </RightDashboard>
    );
};

export default SendAdminEmail;
