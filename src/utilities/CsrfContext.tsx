import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface CsrfContextType {
    csrfToken: string | null;
    fetchCsrfToken: () => Promise<void>;
    isReady: boolean;
}

const CsrfContext = createContext<CsrfContextType | undefined>(undefined);

interface CsrfProviderProps {
    children: ReactNode;
}

export const CsrfProvider: React.FC<CsrfProviderProps> = ({ children }) => {
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);

    const fetchCsrfToken = async () => {
        console.log("Fetching CSRF Token...");
        try {
            const response = await fetch('https://synergyaccounting.app/api/csrf', {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const csrfData = await response.json();
                setCsrfToken(csrfData.token);
                console.log("CSRF Token fetched successfully:", csrfData.token);
                setIsReady(true); // Set to true after fetching CSRF token
            } else {
                console.error('Failed to fetch CSRF token:', response.status);
            }
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
        }
    };

    useEffect(() => {
        console.log("CsrfProvider mounting...");
        fetchCsrfToken().then(() => {
            console.log("CsrfProvider mounted successfully.");
        });
    }, []);

    if (!isReady) {
        return <div>Loading...</div>; // Show loading until CSRF token is ready
    }

    return (
        <CsrfContext.Provider value={{ csrfToken, fetchCsrfToken, isReady }}>
            {children}
        </CsrfContext.Provider>
    );
};

export const useCsrf = (): CsrfContextType => {
    const context = useContext(CsrfContext);
    if (!context) {
        console.error("useCsrf was called outside of a CsrfProvider.");
        throw new Error("useCsrf must be used within a CsrfProvider");
    }
    console.log("useCsrf called successfully, context:", context);
    return context;
};
