import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [securityQuestion, setSecurityQuestion] = useState<string>('');
    const [securityAnswer, setSecurityAnswer] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confPassword, setConfPassword] = useState<string>('');
    const [step, setStep] = useState<number>(1); // Step management
    const [errorMessage, setErrorMessage] = useState<string>(''); // Error message state

    const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            // Fetch the security question based on the user's email and user ID
            const response = await fetch('/api/users/request-security-question', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, userId }),
            });

            if (response.ok) {
                const data = await response.json();
                setSecurityQuestion(data.securityQuestion);
                setStep(2); // Move to security question step
            } else {
                alert('That account does not exist or user ID is incorrect.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

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

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check if passwords match
        if (newPassword !== confPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        // Validate the new password
        if (!validatePassword(newPassword)) {
            setErrorMessage('Password must be at least 8 characters long, start with a letter, and include a letter, number, and special character.');
            return;
        }

        try {
            const response = await fetch('/api/users/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, userId, securityAnswer, newPassword }),
            });

            if (response.ok) {
                alert('Password reset successfully. You can now log in.');
                navigate('/login'); // Redirect to login page after successful reset
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="content">
            {step === 1 ? (
                <form onSubmit={handleRequestReset}>
                    <label className="center-text">Forgot Password</label>
                    <div className="input-group">
                        <label className="label">Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">User ID</label>
                        <input 
                            type="text" 
                            value={userId} 
                            onChange={(e) => setUserId(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="custom-button">Next</button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword}>
                    <label className="center-text">Security Question</label>
                    <div className="input-group">
                        <label className="label">{securityQuestion}</label>
                        <input 
                            type="text" 
                            value={securityAnswer} 
                            onChange={(e) => setSecurityAnswer(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">New Password</label>
                        <input 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">Confirm Password</label>
                        <input 
                            type="password" 
                            value={confPassword} 
                            onChange={(e) => setConfPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}
                    <button type="submit" className="custom-button">Reset Password</button>
                </form>
            )}
        </div>
    );
};

export default ResetPassword;
