import React, {useEffect, useState} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Verify: React.FC = () => {

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

                const response = await fetch(`https://synergyaccounting.app/api/users/verify?token=${token}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    navigate("/verify-success")
                } else {
                    navigate("/verify-fail")
                }

            } catch (error) {

                console.error('Error validating verification token:', error);
                alert('An error has occurred. Please try again.');

            } finally {

                setIsLoading(false);

            }
        };
        if (token) {
            validateToken().then();
        }
    }, [token, navigate]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return null;
};

export default Verify;
