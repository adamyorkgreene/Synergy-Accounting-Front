import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageResponse } from "../Types";
import { useCsrf } from "../utilities/CsrfContext"

const Verify: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const  {csrfToken}  = useCsrf();

    const token = searchParams.get('token');

    useEffect(() => {
        const validateToken = async () => {
            if (!csrfToken) {
                console.error('CSRF token is missing');
                return;
            }

            if (!token) {
                console.error('Verification token is missing');
                return;
            }

            try {
                const response = await fetch(`https://synergyaccounting.app/api/users/verify?token=${token}`, {
                    method: 'GET',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    credentials: 'include'
                });

                const message: MessageResponse = await response.json();
                if (response.ok) {
                    alert(message.message);
                    navigate('/login');
                } else {
                    alert(`Verification failed: ${message.message}`);
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error validating verification token:', error);
                alert('Error validating verification token! Please try again.');
                navigate('/login');
            }
        };

        if (csrfToken && token) {
            validateToken().then();
        }
    }, [csrfToken, token, navigate]);

    return null;
};

export default Verify;
