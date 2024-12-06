import React, {useEffect, useState} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageResponse } from "../Types";
import { useCsrf } from '../utilities/CsrfContext';

const ConfirmUser: React.FC = () => {

    const [searchParams] = useSearchParams();

    const token = searchParams.get('token');

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                alert('Confirmation token is missing. Please check your confirmation link.');
                navigate('/login');
                return;
            }
            try {
                const response = await fetch(`https://synergyaccounting.app/api/users/confirm-user?token=${token}`, {
                    method: 'GET',
                    credentials: 'include'
                });
                if (response.ok) {
                    navigate("/confirm-success")
                } else {
                    navigate("/confirm-fail")
                }
            } catch (error) {
                console.error('Error validating token:', error);
                alert('An error has occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
        if (token) {
            validateToken().then();
        }
    }, [token, navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    } else {
        navigate('/login');
    }

    return null;
};

export default ConfirmUser;
