import React, { useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCsrf } from "../utilities/CsrfContext";
import { useUser } from "../utilities/UserContext";
import Logo from "../assets/synergylogo.png";
import Calendar from "./Calandar";
import HelpButton from "./HelpButton";

interface RightDashboardProps {
    children?: ReactNode;
    propUnreadCount?: number;
}

const RightDashboard: React.FC<RightDashboardProps> = ({ propUnreadCount, children }) => {
    const navigate = useNavigate();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSticky, setIsSticky] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false); // Track dropdown visibility
    const [showDropdown1, setShowDropdown1] = useState(false); // Track dropdown visibility
    const [showDropdown2, setShowDropdown2] = useState(false); // Track dropdown visibility
    const [unreadCount, setUnreadCount] = useState<number>(propUnreadCount ?? 0); // Fallback to prop value
    const [pendingJournalCount, setPendingJournalCount] = useState<number>(0);

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
            const scrollPercentage = window.scrollY / window.innerHeight;
            if (scrollPercentage > 0.25) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    });

    useEffect(() => {
        if (propUnreadCount !== undefined) {
            setUnreadCount(propUnreadCount);
            return; // Use the provided prop value
        }
        const fetchUnreadCount = async () => {
            if (!csrfToken || !loggedInUser) return;
            try {
                const response = await fetch(
                    `https://synergyaccounting.app/api/email/emails/unread/${loggedInUser.username}`,
                    {
                        method: 'GET',
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                        },
                        credentials: 'include',
                    }
                );
                if (response.ok) {
                    const count = await response.json();
                    setUnreadCount(count);
                } else {
                    console.error('Failed to fetch unread email count.');
                }
            } catch (error) {
                console.error('Error fetching unread email count:', error);
            }
        };

        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 60000); // 60 seconds
        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [propUnreadCount, csrfToken, loggedInUser]);

    useEffect(() => {
        const fetchPendingJournalEntries = async () => {
            if (!csrfToken || !loggedInUser) {
                console.error('CSRF token is not available or user is not logged in.');
                return;
            }

            try {
                const response = await fetch(
                    'https://synergyaccounting.app/api/manager/journal-entry-requests/pending',
                    {
                        method: 'GET',
                        headers: { 'X-CSRF-TOKEN': csrfToken },
                        credentials: 'include',
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setPendingJournalCount(data.length);
                } else {
                    console.error('Failed to fetch pending journal entries.');
                }
            } catch (error) {
                console.error('Error fetching pending journal entries:', error);
            }
        };

        fetchPendingJournalEntries();

        const interval = setInterval(fetchPendingJournalEntries, 60000); // 60 seconds
        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [csrfToken, loggedInUser]);

    if (isLoading || !csrfToken) {
        return null;
    }

    return (
        <div className="dashboard">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Calendar />
                <HelpButton />
                <img src={Logo} alt="Synergy" className="dashboard-logo" />
            </div>
            <div style={{flexDirection: "row", padding: "1.5625vmin"}}
                 className={`control-panel ${isSticky ? 'sticky' : ''}`}>
                <button style={{marginRight: "1.5625vmin"}} className="control-button"
                        onClick={() => navigate("/dashboard")}>
                    Home
                </button>
                {/* Dropdown Button for Accounts */}
                <div
                    className="dropdown"
                    onMouseEnter={() => setShowDropdown1(true)}
                    onMouseLeave={() => setShowDropdown1(false)}
                >
                    <button className="control-button">Accounts</button>
                    {showDropdown1 && (
                        <div className="dropdown-content">
                            <button onClick={() => navigate("/dashboard/chart-of-accounts")}>Chart of Accounts
                            </button>
                            <button onClick={() => navigate("/dashboard/chart-of-accounts/add")}>New Account</button>
                        </div>
                    )}
                </div>
                {/* Dropdown Button for Ledgers */}
                <div
                    className="dropdown"
                    onMouseEnter={() => setShowDropdown2(true)}
                    onMouseLeave={() => setShowDropdown2(false)}
                >
                    <button className="control-button">Ledgers</button>
                    {showDropdown2 && (
                        <div className="dropdown-content">
                            <button onClick={() => navigate("/dashboard/general-ledger")}>General Ledger
                            </button>
                            <button onClick={() => navigate("/dashboard/journal-entry-form")}>New Journal Entry</button>
                        </div>
                    )}
                </div>
                {/* Dropdown Button for Statements */}
                <div
                    className="dropdown"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <button className="control-button">Statements</button>
                    {showDropdown && (
                        <div className="dropdown-content">
                            <button onClick={() => navigate("/dashboard/general-ledger/trial-balance")}>Trial Balance
                            </button>
                            <button onClick={() => navigate("/dashboard/income-statement")}>Income Statement</button>
                            <button onClick={() => navigate("/dashboard/balance-sheet")}>Balance Sheet</button>
                            <button onClick={() => navigate("/dashboard/retained-earnings")}>Retained Earnings</button>
                        </div>
                    )}
                </div>
            </div>
            <div className={`dashboard-center ${isSticky ? 'margined' : ''}`}>
                {children}
            </div>
            <div className="right-dashboard">
                <div style={{marginRight: "unset", marginBottom: "1vh"}}
                     className="label large-font">{loggedInUser?.username}</div>
                <div className="profile-container" onClick={() => navigate('/upload-image')}>
                    <img
                        className="profile-icon"
                        src={`https://synergyaccounting.app/api/dashboard/uploads/${loggedInUser?.userid.toString()}.jpg`}
                        alt="Profile Picture"
                    />
                </div>
                {(loggedInUser?.userType === "MANAGER" || loggedInUser?.userType === "ADMINISTRATOR") && (
                    <>
                        <div style={{marginRight: "unset"}} className="label large-font">Manager Panel</div>
                        <button onClick={() => navigate('/dashboard/manager/journal-entry-requests')}
                                className="control-button" style={{position: 'relative'}}>
                            Pending Journal Entries
                            {pendingJournalCount > 0 && (
                                <span className="badge">{pendingJournalCount}</span>
                            )}
                        </button>
                        <button onClick={() => navigate('/dashboard/manager/post-announcement')}
                                className="control-button">
                            Post Announcement
                        </button>
                    </>
                )}
                {loggedInUser?.userType !== "USER" && loggedInUser?.userType !== "DEFAULT" && (
                    <>
                        <div style={{marginRight: "unset"}} className="label large-font">User Panel</div>
                        <button onClick={() => navigate('/dashboard/admin/inbox')} className="control-button"
                                style={{position: 'relative'}}>
                            Mailbox
                            {unreadCount > 0 && (
                                <span className="badge">{unreadCount}</span>
                            )}
                        </button>
                    </>
                )}
                <button className="control-button">Settings</button>
                <button className="control-button" onClick={() => navigate("/logout")}>Log Out</button>
            </div>
        </div>
    );
};

export default RightDashboard;
