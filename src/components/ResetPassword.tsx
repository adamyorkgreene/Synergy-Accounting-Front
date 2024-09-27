import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {getCsrf} from "../utilities/csrfutility";
import {MessageResponse} from "../Types";

const ResetPassword: React.FC = () => {

    const [email, setEmail] = useState<string>('');

    const [csrfToken, setCsrfToken] = useState<string>('');

    const navigate = useNavigate();
    const location = useLocation();

    const csrfTokenPass = (location.state as { csrfTokenPass: string })?.csrfTokenPass;

    useEffect(() => {
        if (!csrfTokenPass) {
            const fetchCsrfToken = async () => {
                const token = await getCsrf();
                setCsrfToken(token);
            };
            fetchCsrfToken().then();
        } else {
            setCsrfToken(csrfTokenPass);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('https://synergyaccounting.app/api/users/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({email}),
                credentials: 'include'
            });
            const message: MessageResponse = await response.json();
            alert(message.message);
            navigate('/login');
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="content">
            <label className="center-text">Reset your Password</label>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="label">Enter your Email </label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button type="submit" className="custom-button">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ResetPassword;
