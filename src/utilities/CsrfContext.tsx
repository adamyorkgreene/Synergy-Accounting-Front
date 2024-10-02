import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface CsrfContextType {
    csrfToken: string | null;
    fetchCsrfToken: () => Promise<void>;
}

const CsrfContext = createContext<CsrfContextType | undefined>(undefined);

interface CsrfProviderProps {
    children: ReactNode;
}

export const CsrfProvider: React.FC<CsrfProviderProps> = ({ children }) => {
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

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

    return (
        <CsrfContext.Provider value={{ csrfToken, fetchCsrfToken}}>
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
