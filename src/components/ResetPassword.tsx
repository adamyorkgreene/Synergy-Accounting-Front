import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageResponse } from "../Types";
import { useCsrf } from '../utilities/CsrfContext';
import Logo from "../assets/synergylogo.png";

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
                body: JSON.stringify({email}),
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
        <header className="app-header">
            <img src={Logo} alt="Synergy" className="logo"/>
            <div className="container" style={{paddingTop: "20vh"}}>
                <div className="content" style={{scale: "1.3"}}>
                    <label className="center-text">Reset your Password</label>
                    <div className="extra-margin"></div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="label">Enter your Email </label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="custom-input"
                            />
                        </div>
                        <div className="extra-margin"></div>
                        <div className="input-group">
                            <button type="submit" className="custom-button">Send Reset Link</button>
                        </div>
                    </form>
                </div>
            </div>
        </header>
    );
};

export default ResetPassword;
