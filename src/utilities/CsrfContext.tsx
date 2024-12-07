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
        try {
            const response = await fetch("https://synergyaccounting.app/api/csrf", {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const { token } = await response.json();
                setCsrfToken(token);
            } else {
                console.error("Failed to fetch CSRF token:", response.status);
                setCsrfToken(null);
            }
        } catch (error) {
            console.error("Error fetching CSRF token:", error);
            setCsrfToken(null);
        }
    };

    useEffect(() => {
        fetchCsrfToken();
    }, []);

    return (
        <CsrfContext.Provider value={{ csrfToken, fetchCsrfToken }}>
            {children}
        </CsrfContext.Provider>
    );
};

export const useCsrf = (): CsrfContextType => {
    const context = useContext(CsrfContext);
    if (!context) {
        throw new Error("useCsrf must be used within a CsrfProvider");
    }
    return context;
};