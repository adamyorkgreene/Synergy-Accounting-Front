import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageResponse } from "../Types";
import { useCsrf } from '../utilities/CsrfContext';

const ResetPassword: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const {csrfToken} = useCsrf();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('https://synergyaccounting.app/api/users/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                body: JSON.stringify({ email }),
                credentials: 'include'
            });

            if (response.ok) {
                const message: MessageResponse = await response.json();
                alert(message.message);
                navigate('/login');
            } else {
                const message: MessageResponse = await response.json();
                alert(message.message);
            }
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
