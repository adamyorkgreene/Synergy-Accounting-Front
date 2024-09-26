// src/components/VerifyUser.tsx
import React, {useEffect, useState} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {User} from "../Types";

const VerifyUser: React.FC = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch(`/api/users/verify?token=${token}`);
                if (!response.ok) {
                    alert('Invalid or expired verification token!');
                    navigate('/')
                } else {
                    const user: User = await response.json();
                    const response1 = await fetch('/api/users/request-confirm-user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userid: user.userid, // Pass the userId as part of the request body
                        }),
                    });
                    if (response1.ok) {
                        alert('Your account has been verified. You will receive an email when your account has been ' +
                            'approved by an administrator. You may close this window.');
                    } else {
                        alert('Your account has been verified, but there was a problem confirming your account with' +
                            'administration. Please contact administration at: support@synergyaccounting.app')
                    }
                }
            } catch (error) {
                console.error('Error Validating Token:', error);
                alert('Error validating verification token! Please try again.')
                navigate('/');
            }
        }
        validateToken().then();
    }, [token, navigate]);

    return null;
};

export default VerifyUser;
