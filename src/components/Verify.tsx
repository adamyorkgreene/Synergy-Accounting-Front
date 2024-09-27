// src/components/Verify.tsx
import React, {useEffect, useState} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {MessageResponse} from "../Types";
import {getCsrf} from "../utilities/csrfutility";

const Verify: React.FC = () => {

    const [searchParams] = useSearchParams();

    const [csrfToken, setCsrfToken] = useState<string>('');

    const navigate = useNavigate();

    // Fetch the CSRF token when the component mounts
    useEffect(() => {
        const fetchCsrfToken = async () => {
            const token = await getCsrf();
            setCsrfToken(token);
        };
        fetchCsrfToken().then(); // Fetch the CSRF token
    }, []);

    const token = searchParams.get('token');

    useEffect(() => {
        const validateToken = async () => {
            try {
                const response = await fetch(`https://synergyaccounting.app/api/users/verify?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    },
                    credentials: 'include'
                });
                const message: MessageResponse = await response.json();
                alert(message.message);
                navigate('/login');
            } catch (error) {
                console.error('Error Validating Token:', error);
                alert('Error validating verification token! Please try again.')
                navigate('/login');
            }
        }
        validateToken().then();
    }, [token, navigate]);

    return null;
};

export default Verify;
