import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RightDashboard from "./RightDashboard";
import { useLocation } from "react-router-dom";

interface EventLog {
    id: number;
    accountId: number;
    action: string;
    beforeState: string | null;
    afterState: string;
    userId: number;
    timestamp: string;
}

const EventLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<EventLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const location = useLocation();
    const token = location.state?.token;

    useEffect(() => {
        if (token) fetchEventLogs(token);
    }, [token]);

    const fetchEventLogs = async (accountId: string) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`/api/accounts/logs/${accountId}`);
            setLogs(response.data);
        } catch (err) {
            console.error('Error fetching event logs:', err);
            setError('Failed to load event logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderState = (state: string | null) => {
        if (!state) return 'N/A';

        try {
            const parsedState = JSON.parse(state);
            return (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <tbody>
                    <tr><td><strong>Account Name:</strong></td><td>{parsedState.accountName}</td></tr>
                    <tr><td><strong>Account Number:</strong></td><td>{parsedState.accountNumber}</td></tr>
                    <tr><td><strong>Description:</strong></td><td>{parsedState.accountDescription}</td></tr>
                    <tr><td><strong>Balance:</strong></td><td>{parsedState.initialBalance}</td></tr>
                    <tr><td><strong>Category:</strong></td><td>{parsedState.accountCategory}</td></tr>
                    </tbody>
                </table>
            );
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            return 'Invalid JSON Format';
        }
    };

    const exportLogsToTxt = () => {
        const logText = logs.map(log =>
            `ID: ${log.id}, AccountID: ${log.accountId}, Action: ${log.action}, Before: ${log.beforeState || 'N/A'}, After: ${log.afterState}, UserID: ${log.userId}, Timestamp: ${log.timestamp}`
        ).join('\n');

        const blob = new Blob([logText], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'event_logs.txt';
        link.click();
        URL.revokeObjectURL(link.href); // Clean up the URL object
    };

    return (
        <RightDashboard>
            <div>
                <h1 style={{marginBottom: '0'}}>Event Logs</h1>
                {loading ? (
                    <p>Loading event logs...</p>
                ) : error ? (
                    <p style={{color: 'red'}}>{error}</p>
                ) : logs.length === 0 ? (
                    <p>No event logs available.</p>
                ) : (
                    <table style={{scale: '90%',}}
                           id="eventLogTable">
                        <thead>
                        <tr>
                            <th>Account ID</th>
                            <th>Action</th>
                            <th style={{width: '30vmin'}}>Before State</th>
                            <th style={{width: '30vmin'}}>After State</th>
                            <th>User ID</th>
                            <th>Timestamp</th>
                        </tr>
                        </thead>
                        <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td>{log.accountId}</td>
                                <td>{log.action}</td>
                                <td>{renderState(log.beforeState)}</td>
                                <td>{renderState(log.afterState)}</td>
                                <td>{log.userId}</td>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
            <button onClick={exportLogsToTxt}>Export Logs to .txt</button>
        </RightDashboard>
    );
};

export default EventLogViewer;
