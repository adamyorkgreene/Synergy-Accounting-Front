import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "../Types";

interface UserContextProps {
    user: User | null;
    setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (user) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
        } else {
            sessionStorage.removeItem('loggedInUser');
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextProps => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
