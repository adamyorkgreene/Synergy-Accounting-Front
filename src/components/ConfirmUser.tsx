import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageResponse } from "../Types";
import { useCsrf } from '../utilities/CsrfContext';

const ConfirmUser: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const { csrfToken } = useCsrf();
    const navigate = useNavigate();

    useEffect(() => {
        const validateToken = async () => {
            if (!csrfToken) {
                console.error('CSRF token is not available.');
                return;
            }

            try {
                const response = await fetch(`https://synergyaccounting.app/api/users/confirm-user?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    },
                    credentials: 'include'
                });

                if (response.ok) {
                    const message: MessageResponse = await response.json();
                    alert(message.message);
                    navigate('/login');
                } else {
                    const message: MessageResponse = await response.json();
                    alert(message.message);
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error validating token:', error);
                alert('Error validating confirmation token! Please try again.');
                navigate('/login');
            }
        };

        if (token) {
            validateToken();
        }
    }, [csrfToken, token, navigate]);

    return null;
};

export default ConfirmUser;
