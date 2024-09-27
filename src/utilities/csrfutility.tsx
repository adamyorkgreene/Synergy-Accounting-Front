import {MessageResponse} from "../Types";

export const validateUser = async (csrfToken: string, fetchLink: string) => {
    try {
        const response = await fetch('https://synergyaccounting.app/api/users' + fetchLink, {
            method: 'GET',
            headers: {
                'X-CSRF-TOKEN': csrfToken
            },
            credentials: 'include'
        });
        if (!response.ok) {
            const message: MessageResponse = await response.json();
            alert(message.message);
        }
    } catch (error) {
        console.error('Error validating user:', error);
    }
};

export const getCsrf = async (): Promise<string> => {
    try {
        const response = await fetch('https://synergyaccounting.app/api/csrf', {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            console.error(`Failed to fetch CSRF token: ${response.status}`);
            return '';
        }
        const csrfData = await response.json();
        return csrfData.token;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return '';
    }
};
