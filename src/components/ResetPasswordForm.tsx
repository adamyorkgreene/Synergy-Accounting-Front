// src/components/ResetPasswordForm.tsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ResetPasswordForm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState<string>('');
    const [confPassword, setConfPassword] = useState<string>('');

    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!token) {
            alert('Invalid or missing token.');
            return;
        }

        if (password !== confPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch(`/api/users/password-reset?token=${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(password),
            });

            if (response.ok) {
                alert('Password reset successfully.');
                navigate('/login');
            } else {
                alert('Password reset failed.');
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
                    <label className="label">New Password </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className="input-group">
                    <label className="label">Confirm Password </label>
                    <input type="password" value={confPassword} onChange={(e) => setConfPassword(e.target.value)}/>
                </div>
                <button type="submit" className="custom-button">Change Password</button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;
