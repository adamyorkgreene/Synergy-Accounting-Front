// src/components/VerifyRequest.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyRequest: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const userId = (location.state as { userId: bigint })?.userId;

    useEffect(() => {
        const ValidateToken = async () => {
            try {
                const response = await fetch('/api/users/verify-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userid: userId
                    }),
                });

                if (response.ok) {
                    const message = await response.text();
                    alert(message);
                } else {
                    alert('Verification Failed!');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        }
        if (!userId) {
            navigate('/');
            return;
        }
        ValidateToken().then(() => {

        });
    }, [userId, navigate]);

    if (!userId) {
        return null;
    }

    return null;
};

export default VerifyRequest;
