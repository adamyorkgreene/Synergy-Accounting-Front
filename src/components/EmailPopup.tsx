import React from "react";
import { Email, Attachment } from "../Types";

const EmailPopup: React.FC<{ email: Email, onClose: () => void }> = ({ email, onClose }) => {
    if (!email) {
        console.log("Email is missing...");
        return null;
    }

    const downloadAttachment = (attachment: Attachment) => {
        console.log("Attachment Object:", attachment);
        if (!attachment.contentBase64) console.error("Missing content");
        if (!attachment.fileName) console.error("Missing fileName");
        if (!attachment.contentType) console.error("Missing contentType");
        if (!attachment.contentBase64 || !attachment.fileName || !attachment.contentType) {
            alert("Attachment data is missing or invalid.");
            return;
        }

        try {
            // Create a Blob from the Base64 data
            const byteCharacters = atob(attachment.contentBase64); // Decode Base64
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: attachment.contentType });

            // Create a URL for the Blob and trigger download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = attachment.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Revoke the object URL to free up memory
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download attachment:", error);
            alert("An error occurred while downloading the attachment.");
        }
    };


    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2 style={{ margin: "2vh" }}>{email.subject}</h2>
                <p style={{ margin: "0.5vh", fontSize: "medium" }}>
                    <strong>From:</strong> {email.from}
                </p>
                <p>
                    <strong>Date:</strong> {new Date(email.date).toLocaleString()}
                </p>
                <pre
                    style={{
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                    }}
                >
                    {email.body}
                </pre>

                {email.attachments && email.attachments.length > 0 && (
                    <div style={{ marginTop: "20px" }}>
                        <h3 style={{ marginBottom: "10px" }}>Attachments</h3>
                        <ul style={{ listStyleType: "none", padding: 0 }}>
                            {email.attachments.map((attachment, index) => (
                                <li key={index} style={{ marginBottom: "10px" }}>
                                    <button
                                        onClick={() => downloadAttachment(attachment)}
                                        style={{
                                            backgroundColor: "#104d42",
                                            color: "#fff",
                                            border: "none",
                                            padding: "8px 12px",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {attachment.fileName}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailPopup;
