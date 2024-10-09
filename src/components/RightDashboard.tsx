import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../Types'; // Assuming you have a User type defined

interface RightDashboardProps {
    loggedInUser: User;
    csrfToken: string | null;
}

const RightDashboard: React.FC<RightDashboardProps> = ({ loggedInUser, csrfToken }) => {
    const navigate = useNavigate();

    return (
        <div className="right-dashboard">
            <div style={{marginRight: "unset", marginBottom: "1vh"}} className="label large-font">{loggedInUser.username}</div>
            <div className="profile-container"
                 onClick={() => navigate('/upload-image', { state: { csrfToken, loggedInUser } })}>
                <img
                    className="profile-icon"
                    src={`https://synergyaccounting.app/api/dashboard/uploads/${loggedInUser.username}.jpg`}
                    alt="Profile Picture"
                />
            </div>
            {loggedInUser.userType === "ADMINISTRATOR" && (
                <>
                    <div style={{marginRight: "unset"}} className="label large-font">Admin Panel</div>
                    <button
                        onClick={() => navigate('/dashboard/admin/add-user', { state: { csrfToken, loggedInUser } })}
                        className="control-button">Add User
                    </button>
                    <button onClick={() => navigate('/dashboard/admin/update-user-search', {
                        state: { csrfToken, loggedInUser }
                    })} className="control-button">Update User
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/admin/inbox', { state: { csrfToken, loggedInUser } })}
                        className="control-button">Mailbox
                    </button>
                    <div className="extra-margin"></div>
                </>
            )}
            <div style={{marginRight: "unset"}} className="label large-font">User Panel</div>
            <button className="control-button"
                    onClick={() => navigate("/dashboard", { state: { csrfToken, loggedInUser } })}>Home
            </button>
            <button className="control-button">Settings</button>
            <button className="control-button" onClick={() => navigate("/logout")}>Log Out</button>
        </div>
    );
};

export default RightDashboard;
