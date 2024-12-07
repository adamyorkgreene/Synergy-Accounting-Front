import React, {useEffect, useState} from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MessageResponse } from "../Types";

const ApproveJournalEntry: React.FC = () => {

    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                alert('Journal entry token is missing. Please check your link.');
                navigate('/login');
                return;
            }
            try {
                const response = await fetch(`https://synergyaccounting.app/api/accounts/approve-journal-entry?token=${token}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                const message: MessageResponse = await response.json();
                alert(message.message);
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
    } else {
        navigate('/login');
    }

    return null;
};

export default ApproveJournalEntry;
