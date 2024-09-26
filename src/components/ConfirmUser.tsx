// src/components/ResetPasswordForm.tsx
import React, {useEffect, useState} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ConfirmUser: React.FC = () => {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch(`/api/users/confirm-user?token=${token}`);
                if (!response.ok) {
                    alert('Invalid or expired confirmation token!');
                    navigate('/')
                } else {
                    alert('This user has been confirmed. You may close this window.');
                }
            } catch (error) {
                console.error('Error Validating Token:', error);
                alert('Error validating password reset token! Please try again.')
                navigate('/');
            }
        }
        validateToken().then();
    }, [token, navigate]);

    return null;
};

export default ConfirmUser;
