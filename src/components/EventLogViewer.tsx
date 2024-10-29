import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

    useEffect(() => {
        fetchEventLogs();
    }, []);

    const fetchEventLogs = async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors before making a request
            const response = await axios.get('/api/accounts/logs');
            setLogs(response.data);
        } catch (err) {
            console.error('Error fetching event logs:', err);
            setError('Failed to load event logs. Please try again.');
        } finally {
            setLoading(false);
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
        <div>
            <h1>Event Logs</h1>
            <button onClick={exportLogsToTxt}>Export Logs to .txt</button>
            {loading ? (
                <p>Loading event logs...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : logs.length === 0 ? (
                <p>No event logs available.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>Account ID</th>
                        <th>Action</th>
                        <th>Before</th>
                        <th>After</th>
                        <th>User ID</th>
                        <th>Timestamp</th>
                    </tr>
                    </thead>
                    <tbody>
                    {logs.map((log) => (
                        <tr key={log.id}>
                            <td>{log.accountId}</td>
                            <td>{log.action}</td>
                            <td>{log.beforeState || 'N/A'}</td>
                            <td>{log.afterState}</td>
                            <td>{log.userId}</td>
                            <td>{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default EventLogViewer;
