import React, {useEffect, useState} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageResponse } from "../Types";
import { useCsrf } from "../utilities/CsrfContext";
import Logo from "../assets/synergylogo.png";

const ResetPasswordForm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const {csrfToken} = useCsrf();

    const [password, setPassword] = useState<string>('');
    const [confPassword, setConfPassword] = useState<string>('');
    const [tokenValid, setTokenValid] = useState<boolean>(false);

    const token = searchParams.get('token');

    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch(`/api/users/password-reset?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken || ''
                    },
                    credentials: 'include'
                });
                if (response.ok) {
                    setTokenValid(true);
                } else {
                    const message: MessageResponse = await response.json();
                    alert(message.message);
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error Validating Token:', error);
                alert('Error validating password reset token! Please try again.');
                setTokenValid(false);
                navigate('/login');
            }
        };
        if (csrfToken && token) {
            validateToken();
        }
    }, [csrfToken, token, navigate]);

    if (!tokenValid) {
        return null;
    }

    const validatePassword = (password: string): boolean => {
        const minLength = 8;
        const startsWithLetter = /^[A-Za-z]/.test(password);
        const containsLetter = /[A-Za-z]/.test(password);
        const containsNumber = /\d/.test(password);
        const containsSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return (
            password.length >= minLength &&
            startsWithLetter &&
            containsLetter &&
            containsNumber &&
            containsSpecialChar
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token) {
            alert('Invalid or missing token.');
            return;
        }

        if (password !== confPassword) {
            alert('Passwords do not match.');
            return;
        }

        if (!validatePassword(password)) {
            alert('Password must be at least 8 characters long, start with a letter, and include a letter, number, and special character.');
            return;
        }

        try {
            const response = await fetch(`https://synergyaccounting.app/api/users/password-reset?token=${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                body: JSON.stringify({password}),
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
            <div className={"container"}>
                <div className="content">
                    <label className="center-text">Reset your Password</label>
                    <div className="extra-margin"></div>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="label">New Password </label>
                            <input className="custom-input5" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        </div>
                        <div className="input-group">
                            <label className="label">Confirm Password </label>
                            <input className="custom-input5" type="password" value={confPassword}
                                   onChange={(e) => setConfPassword(e.target.value)}/>
                        </div>
                        <div className="extra-margin"></div>
                        <div className="input-group">
                            <button type="submit" className="custom-button">Change Password</button>
                        </div>
                    </form>
                </div>
            </div>
        </header>

    );
};

export default ResetPasswordForm;
