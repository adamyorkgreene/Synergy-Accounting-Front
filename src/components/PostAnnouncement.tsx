import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import { useCsrf } from '../utilities/CsrfContext';
import { useUser } from '../utilities/UserContext';
import RightDashboard from './RightDashboard';

const PostAnnouncement: React.FC = () => {

    const navigate = useNavigate();

    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [message, setMessage] = useState<string>('');

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
            } else if (loggedInUser.userType === 'DEFAULT' || loggedInUser.userType === 'ACCOUNTANT') {
                navigate('/dashboard');
                alert('You do not have permission to post announcements.');
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!message) {
            alert('The announcement message cannot be empty.');
            return;
        }

        if (!csrfToken || !loggedInUser) {
            alert('Failed to get CSRF token. Please try again.');
            return;
        }

        try {
            const response = await fetch('https://synergyaccounting.app/api/manager/post-announcement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: loggedInUser.username,
                    message: message,
                    date: formatDate(Date.now()),
                }),
            });
            if (response.ok) {
                alert('Announcement has been successfully posted.');
                navigate('/dashboard');
            } else {
                const errorResponse = await response.json();
                alert(`Failed to send email: ${errorResponse.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    if (isLoading || !csrfToken) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            <div style={{ position: 'relative' }} className="send-admin-email">
                <form
                    style={{width: '100%', display: 'flex', flexDirection: 'column', margin: '2vmin'}}
                    className="email-form"
                    onSubmit={handleSubmit}
                >
                    <h1 style={{margin: 'unset'}}>Post an Announcement</h1>
                    <div style={{width: '100%'}} className="input-group">
                        <textarea
                            className="custom-textarea"
                            value={message}
                            style={{width: '100%'}}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Message Body"
                            rows={10}
                        />
                    </div>
                    <div style={{width: '100%', marginBottom: '0'}} className="input-group">
                        <button
                            style={{width: '100%', padding: 'unset', marginBottom: '0'}}
                            type="submit"
                            className="control-button"
                        >
                            Post Announcement
                        </button>
                    </div>
                </form>
            </div>
        </RightDashboard>
    );
};

export default PostAnnouncement;
