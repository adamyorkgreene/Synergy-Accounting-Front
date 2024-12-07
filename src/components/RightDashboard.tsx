import React, {useEffect, useState, ReactNode, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
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
    const { user: loggedInUser, fetchUser } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSticky, setIsSticky] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdown1, setShowDropdown1] = useState(false);
    const [showDropdown2, setShowDropdown2] = useState(false);
    const [showLeftDropdown, setShowLeftDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState<number>(propUnreadCount ?? 0);
    const [pendingJournalCount, setPendingJournalCount] = useState<number>(0);

    const initCalled = useRef(false);
    const dataFetched = useRef(false);

    useEffect(() => {
        const init = async () => {
            if (!loggedInUser) {
                await fetchUser();
            }
            setIsLoading(false);
        };
        if (!initCalled.current) {
            initCalled.current = true;
            init();
        }
    }, [loggedInUser, fetchUser]);

    useEffect(() => {
        if (!isLoading) {
            if (!loggedInUser) {
                navigate('/login');
            } else if (loggedInUser.userType === 'DEFAULT') {
                navigate('/login');
                alert('You do not have permission to view this page.');
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    useEffect(() => {
        if (!isLoading && loggedInUser && !dataFetched.current) {
            dataFetched.current = true;
        }
    }, [isLoading, loggedInUser]);

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
    }, [dataFetched]);

    useEffect(() => {
        if (propUnreadCount !== undefined) {
            setUnreadCount(propUnreadCount);
            return;
        }
        const fetchUnreadCount = async () => {
            if (!loggedInUser) {
                console.error('User has been logged out, please log in and try again.');
                navigate('/')
                return;
            }
            try {
                const response = await fetch(
                    `https://synergyaccounting.app/api/email/emails/unread/${loggedInUser.username}`,
                    {
                        method: 'GET',
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
        const interval = setInterval(fetchUnreadCount, 60000);
        return () => clearInterval(interval);
    }, [propUnreadCount, loggedInUser, dataFetched]);

    useEffect(() => {
        const fetchPendingJournalEntries = async () => {
            if (!loggedInUser) {
                console.error('User has been logged out, please log in and try again.');
                navigate('/')
                return;
            }
            try {
                const response = await fetch(
                    'https://synergyaccounting.app/api/manager/journal-entry-requests/pending',
                    {
                        method: 'GET',
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

        if (loggedInUser?.userType !== "ACCOUNTANT") {
            fetchPendingJournalEntries();
        }

        const interval = setInterval(fetchPendingJournalEntries, 60000);
        return () => clearInterval(interval);
    }, [loggedInUser, dataFetched]);

    if (isLoading) {
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
                        <button onClick={() => navigate('/dashboard/admin/add-user')}
                                className="control-button" style={{position: 'relative'}}>
                            Add New User
                        </button>
                        <button onClick={() => navigate('/dashboard/admin/update-user-search')}
                                className="control-button">
                            Update User
                        </button>
                        <div className="dropdown"
                             style={{marginRight: 'unset'}}
                             onMouseEnter={() => setShowLeftDropdown(true)}
                             onMouseLeave={() => setShowLeftDropdown(false)}>
                            <button className="control-button"
                                    style={{height: '5.355vh'}}>
                                User Reports
                            </button>
                            {showLeftDropdown && (
                                <div className="dropdown-content left-aligned">
                                    <button onClick={() => navigate("/dashboard/admin/user-report")}>All Users</button>
                                    <button onClick={() => navigate("/dashboard/admin/expired-passwords")}>Expired
                                        Passwords
                                    </button>
                                </div>
                            )}
                        </div>
                        <button onClick={() => navigate('/dashboard/manager/journal-entry-requests')}
                                className="control-button" style={{position: 'relative'}}>
                            Journal Entries
                            {pendingJournalCount > 0 && (
                                <span className="badge">{pendingJournalCount}</span>
                            )}
                        </button>
                        <button onClick={() => navigate('/dashboard/manager/post-announcement')}
                                className="control-button">
                            Announcements
                        </button>
                    </>
                )}
                {loggedInUser?.userType !== "DEFAULT" && (
                    <>
                        <div style={{marginRight: "unset"}} className="label large-font">User Panel</div>
                        <button onClick={() => navigate('/dashboard/inbox')} className="control-button"
                                style={{position: 'relative'}}>
                            Mailbox
                            {unreadCount > 0 && (
                                <span className="badge">{unreadCount}</span>
                            )}
                        </button>
                    </>
                )}
                <button className="control-button" onClick={() => navigate("/logout")}>Log Out</button>
            </div>
        </div>
    );
};

export default RightDashboard;
