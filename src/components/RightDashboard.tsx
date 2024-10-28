import React, { useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from "../utilities/CsrfContext";
import { useUser } from "../utilities/UserContext";
import Logo from "../assets/synergylogo.png";
import Calendar from "./Calandar";
import HelpButton, { helpContent } from "./HelpButton";

interface RightDashboardProps {
    children?: ReactNode;
}

const RightDashboard: React.FC<RightDashboardProps> = ({ children }) => {
    const navigate = useNavigate();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSticky, setIsSticky] = useState(false);
    const [currentPage, setCurrentPage] = useState<"dashboard" | "chart-of-accounts" | "journal-entry-form" | "general-ledger" | "inbox" | "send-email" | "journal-entry-requests" | "add-user" | "update-user-search">('dashboard'); // Default to 'dashboard'

    useEffect(() => {
        const init = async () => {
            if (!loggedInUser) {
                await fetchUser();
            }
            setIsLoading(false);
        };
        init().then();
    }, [loggedInUser, fetchUser]);

    useEffect(() => {
        if (!isLoading && (!loggedInUser || loggedInUser.userType === "DEFAULT")) {
            navigate('/login');
        }
    }, [loggedInUser, isLoading, navigate]);

    useEffect(() => {
        const handleScroll = () => {
            const controlPanel = document.querySelector('.control-panel') as HTMLElement;
            if (controlPanel) {
                let offsetTop = controlPanel.getBoundingClientRect().top;
                console.log("ScrollY: ", window.scrollY);
                console.log("Offset Top: ", offsetTop);
                if (window.scrollY > 169) {
                    setIsSticky(true);
                } else if (window.scrollY <= 169) {
                    setIsSticky(false);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

      useEffect(() => {
        // Update current page
        const path = window.location.pathname;
        if (path.includes("chart-of-accounts")) {
          setCurrentPage("chart-of-accounts");
        } else if (path.includes("journal-entry-form")) {
          setCurrentPage("journal-entry-form");
        } else if (path.includes("general-ledger")) {
          setCurrentPage("general-ledger");
        } else if (path.includes("inbox")) {
        setCurrentPage("inbox");
        } else if (path.includes("send-email")) {
        setCurrentPage("send-email");
        } else if (path.includes("journal-entry-requests")) {
        setCurrentPage("journal-entry-requests");
        } else if (path.includes("add-user")) {
        setCurrentPage("add-user");
        } else if (path.includes("update-user-search")) {
        setCurrentPage("update-user-search");
        } else {
          setCurrentPage("dashboard");
        }
      }, [window.location.pathname]);

    if (isLoading || !csrfToken) {
        return null;
    }

    return (
        <div className="dashboard">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Calendar />
                <HelpButton /> {/* Added HelpButton here */}
                <img src={Logo} alt="Synergy" className="dashboard-logo" />
            </div>
            <div style={{ flexDirection: "row", padding: "1.5625vmin" }} className={`control-panel ${isSticky ? 'sticky' : ''}`}>
                <button style={{ marginRight: "1.5625vmin" }} className="control-button" onClick={() => navigate("/dashboard")}>
                    Home
                </button>
                <button style={{ marginRight: "1.5625vmin" }} className="control-button" onClick={() => navigate("/dashboard/chart-of-accounts")}>
                    Chart of Accounts
                </button>
                <button style={{ marginRight: "1.5625vmin" }} className="control-button" onClick={() => navigate("/dashboard/journal-entry-form")}>
                    Journal Entry
                </button>
                <button style={{ marginRight: "1.5625vmin" }} className="control-button" onClick={() => navigate("/dashboard/general-ledger")}>
                    General Ledger
                </button>
            </div>
            <div className={`dashboard-center ${isSticky ? 'margined' : ''}`}>
                {children}
            </div>
            <div className="right-dashboard">
                <div style={{ marginRight: "unset", marginBottom: "1vh" }} className="label large-font">{loggedInUser?.username}</div>
                <div className="profile-container" onClick={() => navigate('/upload-image')}>
                    <img
                        className="profile-icon"
                        src={`https://synergyaccounting.app/api/dashboard/uploads/${loggedInUser?.userid.toString()}.jpg`}
                        alt="Profile Picture"
                    />
                </div>
                <div style={{ marginRight: "unset" }} className="label large-font">User Panel</div>
                <button className="control-button">Settings</button>
                <button className="control-button" onClick={() => navigate("/logout")}>Log Out</button>
                {loggedInUser?.userType !== "USER" && loggedInUser?.userType !== "DEFAULT" && (
                    <>
                        <div style={{ marginRight: "unset" }} className="label large-font">Email Panel</div>
                        <button onClick={() => navigate('/dashboard/admin/inbox')} className="control-button">Mailbox</button>
                    </>
                )}
                {(loggedInUser?.userType === "MANAGER" || loggedInUser?.userType === "ADMINISTRATOR") && (
                    <>
                        <div style={{ marginRight: "unset" }} className="label large-font">Manager Panel</div>
                        <button onClick={() => navigate('/dashboard/manager/journal-entry-requests')} className="control-button">Pending Journal Entries</button>
                    </>
                )}
                {loggedInUser?.userType === "ADMINISTRATOR" && (
                    <>
                        <div style={{ marginRight: "unset" }} className="label large-font">Admin Panel</div>
                        <button onClick={() => navigate('/dashboard/admin/add-user')} className="control-button">Add User</button>
                        <button onClick={() => navigate('/dashboard/admin/update-user-search')} className="control-button">Update User</button>
                        <div className="extra-margin"></div>
                    </>
                )}
            </div>
        </div>
    );
};

export default RightDashboard;
