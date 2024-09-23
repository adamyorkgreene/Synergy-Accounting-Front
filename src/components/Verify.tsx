// src/components/Verify.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Verify: React.FC = () => {
    const location = useLocation(); // Get the state passed by navigate
    const navigate = useNavigate();

    // Extract userId from location.state
    const userId = (location.state as { userId: bigint })?.userId;

    const [verificationCodeInput, setVerificationCodeInput] = useState<string>('');

    // Redirect to login if userId is missing, but do it in useEffect to avoid issues in the render cycle
    useEffect(() => {
        if (!userId) {
            navigate('/'); // Redirect to login
        }
    }, [userId, navigate]);

    // Early return while navigating to avoid rendering empty component
    if (!userId) {
        return null; // Prevent rendering when navigating away
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Send the user ID and verification code to the backend
        try {
            const response = await fetch('/api/users/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId, // Pass the userId as part of the request body
                    verificationCode: verificationCodeInput, // User-entered verification code
                }),
            });

            if (response.ok) {
                alert('Verification Successful!');
                //navigate('/dashboard'); // Uncomment and replace this to redirect after verification
            } else {
                alert('Verification Failed!');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="content">
            <label className="center-text">Enter Verification Code</label>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <input
                        type="text"
                        value={verificationCodeInput}
                        onChange={(e) => setVerificationCodeInput(e.target.value)}
                    />
                </div>
                <button type="submit" className="custom-button">Verify</button>
            </form>
        </div>
    );
};

export default Verify;
