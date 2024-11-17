import React, { useState, useEffect } from 'react';
import { useCsrf } from "../utilities/CsrfContext";
import { useLocation, useNavigate } from "react-router-dom";
import RightDashboard from './RightDashboard';
import { useUser } from "../utilities/UserContext";
import { RetainedEarningsDTO } from "../Types";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const RetainedEarningsStatement: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [retainedEarnings, setRetainedEarnings] = useState<RetainedEarningsDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
        if (!isLoading) {
            if (!loggedInUser) {
                navigate('/login');
            } else if (loggedInUser.userType !== "ADMINISTRATOR" && loggedInUser.userType !== "MANAGER") {
                navigate('/dashboard');
                alert('You do not have permission to view or generate a retained earnings statement.');
            }
        }
    }, [loggedInUser, isLoading, location.key, navigate]);

    const fetchRetainedEarnings = async () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }

        try {
            const response = await fetch(`/api/accounts/retained-earnings?startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                headers: { 'X-CSRF-TOKEN': csrfToken },
                credentials: 'include',
            });
            const data: RetainedEarningsDTO = await response.json();
            setRetainedEarnings(data);
        } catch (error) {
            console.error("Error fetching retained earnings statement:", error);
            alert("An error occurred while fetching the retained earnings statement.");
        }
    };

    const saveAsPDF = () => {
        if (!retainedEarnings) {
            alert("No retained earnings data to save as PDF.");
            return;
        }

        const doc = new jsPDF();

        // Add header
        doc.setFontSize(18);
        doc.text("Retained Earnings Statement", 10, 10);
        doc.setFontSize(12);
        doc.text(`From: ${startDate} To: ${endDate}`, 10, 20);

        // Prepare table data
        const headers = [["Description", "Amount"]];
        const rows = retainedEarnings.rows.map(row => [
            row.description,
            row.amount.toFixed(2),
        ]);

        // Generate table
        doc.autoTable({
            head: headers,
            body: rows,
            startY: 30,
        });

        // Save the PDF
        doc.save(`Retained_Earnings_Statement_${startDate}_to_${endDate}.pdf`);
    };

    const downloadCSV = () => {
        if (!retainedEarnings) return;

        const rows = [
            ["Description", "Amount"],
            ...retainedEarnings.rows.map(row => [row.description, row.amount.toFixed(2)]),
        ];

        const csvContent = rows.map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `retained_earnings_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printRetainedEarnings = () => {
        if (!retainedEarnings) return;

        const rows = retainedEarnings.rows.map(row => `
            <tr><td>${row.description}</td><td>${row.amount.toFixed(2)}</td></tr>
        `).join("");

        const newWindow = window.open("", "_blank");
        newWindow?.document.write(`
        <html lang="en">
        <head>
            <title>Retained Earnings Statement</title>
            <style>
                body, h1, table { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { text-align: center; font-size: 1.5em; }
            </style>
        </head>
        <body>
            <h1>Retained Earnings Statement</h1>
            <p>From: ${startDate} To: ${endDate}</p>
            <table>
                <thead>
                    <tr><th>Description</th><th>Amount</th></tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </body>
        </html>
    `);
        newWindow?.document.close();
        newWindow?.print();
    };

    if (isLoading || !csrfToken || !loggedInUser) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            <div className="chart-container">
                <h1 style={{ margin: 'unset' }}>Retained Earnings Statement</h1>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginBottom: '1rem' }} className="search-bar">
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <label>Start Date:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ marginBottom: '1rem', width: '100%', padding: '8px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginLeft: '1rem' }}>
                        <label>End Date:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ marginBottom: '1rem', width: '100%', padding: '8px' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', width: 'unset', marginLeft: '1rem' }}>
                        <label style={{ height: 'calc(10px + 2vmin)' }}> </label>
                        <button
                            onClick={fetchRetainedEarnings}
                            className="control-button"
                            title="Generate Retained Earnings Statement"
                            style={{
                                height: 'auto',
                                alignSelf: 'flex-end',
                                padding: '8px 16px',
                                margin: 'unset',
                                marginLeft: '1rem',
                            }}
                        >
                            Generate
                        </button>
                    </div>
                </div>

                <table id="chartOfAccountsTable">
                    <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {retainedEarnings?.rows.map((row, index) => (
                        <tr key={index}>
                            <td>{row.description}</td>
                            <td>{row.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="action-buttons" style={{ display: 'flex', flexDirection: 'row-reverse', marginTop: '1rem' }}>
                    <button onClick={downloadCSV} className="control-button" style={{ marginLeft: '1rem' }}>Download as CSV</button>
                    <button onClick={printRetainedEarnings} className="control-button">Print</button>
                    <button onClick={saveAsPDF} className="control-button" style={{ marginRight: '1rem' }}>Save as PDF</button>
                </div>
            </div>
        </RightDashboard>
    );
};

export default RetainedEarningsStatement;
