import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ResetPasswordForm: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [securityAnswer, setSecurityAnswer] = useState<string>('');
    const [step, setStep] = useState<number>(1); // Track the step in the process
    const [question, setQuestion] = useState<string>(''); // Security question
    const navigate = useNavigate();

    const handleNextStep = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/users/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, userId }),
            });

            if (response.ok) {
                const data = await response.json();
                setQuestion(data.securityQuestion); // Assume backend sends back a security question
                setStep(2); // Move to the next step for security answer
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/users/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, userId, securityAnswer }),
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
                <form onSubmit={handleNextStep}>
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
                        <label className="label">{question}</label>
                        <input 
                            type="text" 
                            value={securityAnswer} 
                            onChange={(e) => setSecurityAnswer(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="custom-button">Reset Password</button>
                </form>
            )}
        </div>
    );
};

export default ResetPasswordForm;
