import DOMPurify from 'dompurify';

import React from "react";
import {User} from "../Types";

const ConfirmPopup: React.FC<{ user: User, onClose: () => void, onConfirm: () => void}> = ({ user, onClose, onConfirm }) => {

    if (!user) {
        console.log("User is missing...");
        return null;
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2 style={{margin: "2vh"}}>Delete user {user.username}?</h2>
                <div style={{display: 'flex', alignContent: 'center', flexDirection: 'column', flexWrap: 'wrap' }}>
                    <button onClick={onConfirm} className="control-button">Confirm</button>
                    <button onClick={onClose} className="control-button">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPopup;