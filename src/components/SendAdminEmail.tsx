import React, { useEffect, useState } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import RightDashboard from './RightDashboard';

const SendAdminEmail: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [to, setTo] = useState<string>('');
    const [subject, setSubject] = useState<string>('');
    const [body, setBody] = useState<string>('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [accountantEmails, setAccountantEmails] = useState<string[]>([]);
    const [managerEmails, setManagerEmails] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (!loggedInUser) {
                await fetchUser();
            }
            setIsLoading(false);
            if (location.state && location.state.attachment) {
                const { attachment } = location.state;
                setAttachments([attachment]);
            }
        };
        init();
    }, [loggedInUser, fetchUser]);

    useEffect(() => {
        if (!isLoading) {
            if (!loggedInUser) {
                navigate('/login');
            } else if (loggedInUser.userType === 'USER' || loggedInUser.userType === 'DEFAULT') {
                navigate('/dashboard');
                alert('You do not have permission to send emails.');
            } else {
                getEmails();
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    const getEmails = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        try {
            const accountantResponse = await fetch('https://synergyaccounting.app/api/email/get-all-emails/accountant', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
            });
            if (accountantResponse.ok) {
                const emails: string[] = await accountantResponse.json();
                setAccountantEmails(emails);
            }

            const managerResponse = await fetch('https://synergyaccounting.app/api/email/get-all-emails/manager', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
            });
            if (managerResponse.ok) {
                const emails: string[] = await managerResponse.json();
                setManagerEmails(emails);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files)); // Convert FileList to Array
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
            const formData = new FormData();
            formData.append('to', to);
            formData.append('from', loggedInUser?.username || '');
            formData.append('subject', subject);
            formData.append('body', body);
            attachments.forEach((file) => formData.append('attachments', file));

            const response = await fetch('https://synergyaccounting.app/api/email/send-email', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken, // CSRF token is still required
                },
                credentials: 'include',
                body: formData,
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
            <div style={{ position: 'relative', width: '90%', marginRight: '2vmin' }} className="send-admin-email">
                <div style={{ fontSize: '1.5vmin', width: '25%' }} className="email-column">
                    <h2>Accountant Emails</h2>
                    <ul className="email-list">
                        {accountantEmails.map((email, index) => (
                            <li
                                key={index}
                                className="email-item"
                                style={{ fontSize: 'calc(5px + 0.4vmin)' }}
                                onClick={() => handleEmailClick(email)}
                            >
                                {email}
                            </li>
                        ))}
                    </ul>
                </div>
                <form
                    style={{width: '50%', display: 'flex', flexDirection: 'column'}}
                    className="email-form"
                    onSubmit={handleSubmit}
                >
                    <h1 style={{margin: 'unset'}}>Send an Email</h1>
                    <div style={{width: '100%'}} className="input-group">
                        <input
                            type="text"
                            className="custom-input"
                            value={to}
                            style={{width: '100%'}}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="Recipient email address"
                        />
                    </div>
                    <div style={{width: '100%'}} className="input-group">
                        <input
                            type="text"
                            className="custom-input"
                            value={subject}
                            style={{width: '100%'}}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email subject"
                        />
                    </div>
                    <div style={{width: '100%'}} className="input-group">
                        <textarea
                            className="custom-textarea"
                            value={body}
                            style={{width: '100%'}}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Email body"
                            rows={10}
                        />
                    </div>
                    <div style={{ width: '100%', justifyContent: 'flex-start', display: 'flex', alignItems: 'center', gap: '1rem' }} className="input-group">
                        <label htmlFor="attachments" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Attachments</label>
                        <label
                            style={{
                                position: 'relative',
                                width: '20vmin',
                                textAlign: 'center',
                                fontSize: '1rem',
                                marginLeft: '1rem',
                                padding: '0.3rem',
                                backgroundColor: '#fff',
                                cursor: 'pointer',
                            }}
                            htmlFor="file-upload"
                            className="custom-button custom-file-upload"
                        >
                            Select Files
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    {attachments.length > 0 && (
                        <div style={{ marginTop: '1rem', fontSize: '1rem', color: '#fff', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 'bold' }}>Selected Files:</span>
                            {attachments.map((file, index) => (
                                <span key={index} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '20vw' }}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                </span>
                            ))}
                        </div>
                    )}
                    <div style={{width: '100%', marginBottom: '0'}} className="input-group">
                        <button
                            style={{width: '100%', padding: 'unset', marginBottom: '0'}}
                            type="submit"
                            className="control-button"
                        >
                            Send Email
                        </button>
                    </div>
                </form>
                <div style={{fontSize: '1.5vmin', width: '25%'}} className="email-column">
                    <h2>Manager Emails</h2>
                    <ul className="email-list">
                        {managerEmails.map((email, index) => (
                            <li
                                key={index}
                                style={{fontSize: 'calc(5px + 0.4vmin)'}}
                                className="email-item"
                                onClick={() => handleEmailClick(email)}
                            >
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
