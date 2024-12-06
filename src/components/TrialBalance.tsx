import React, { useEffect, useState } from 'react';
import { TrialBalanceDTO } from '../Types';
import RightDashboard from './RightDashboard';
import { useLocation, useNavigate } from "react-router-dom";
import { useCsrf } from "../utilities/CsrfContext";
import { useUser } from "../utilities/UserContext";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {formatCurrency} from "../utilities/Formatter";

const TrialBalance: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [trialBalance, setTrialBalance] = useState<TrialBalanceDTO[]>([]);

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
                alert('You do not have permission to view or generate a trial balance.');
            }
        }
    }, [loggedInUser, isLoading, location.key, navigate]);

    const fetchTrialBalance = async () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }
        try {
            const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
            const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
            const response = await fetch(`/api/accounts/trial-balance?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
                method: 'GET',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });
            const data: TrialBalanceDTO[] = await response.json();
            setTrialBalance(data);
        } catch (error) {
            console.error("Error fetching trial balance:", error);
            alert("An error occurred while fetching the trial balance.");
        }
    };

    // Calculate the totals for debit and credit columns
    const debitTotal = trialBalance.reduce((total, entry) => total + entry.debit, 0);
    const creditTotal = trialBalance.reduce((total, entry) => total + entry.credit, 0);

    // Generate a PDF blob for reusability
    const generatePDFBlob = (): Blob | null => {
        if (trialBalance.length === 0) {
            alert("No trial balance data to save as PDF.");
            return null;
        }

        const doc = new jsPDF();

        // Add header text
        doc.setFontSize(18);
        doc.text("Trial Balance", 10, 10);
        doc.setFontSize(12);
        doc.text(`From: ${startDate} To: ${endDate}`, 10, 20);

        // Prepare table data
        const headers = [["Account", "Debit", "Credit"]];
        const rows = trialBalance.map(entry => [
            entry.accountName,
            formatCurrency(entry.debit),
            formatCurrency(entry.credit),
        ]);

        rows.push(["Totals", formatCurrency(debitTotal), formatCurrency(creditTotal)]);

        // Generate table
        doc.autoTable({
            head: headers,
            body: rows,
            startY: 30,
        });

        // Return PDF as a Blob
        return doc.output("blob");
    };

    // Save as PDF
    const saveAsPDF = () => {
        const pdfBlob = generatePDFBlob();
        if (!pdfBlob) return;

        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Trial_Balance_${startDate}_to_${endDate}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Send as Email
    const sendAsEmail = () => {
        const pdfBlob = generatePDFBlob();
        if (!pdfBlob) return;

        const file = new File(
            [pdfBlob],
            `Trial_Balance_${startDate}_to_${endDate}.pdf`,
            { type: "application/pdf" }
        );

        // Navigate to SendAdminEmail with attachment
        navigate('/dashboard/admin/send-email', {
            state: { attachment: file }
        });
    };

    // Download CSV
    const downloadCSV = () => {
        const headers = ["Account", "Debit", "Credit"];
        const rows = trialBalance.map(entry => [entry.accountName, entry.debit.toFixed(2), entry.credit.toFixed(2)]);
        rows.push(["Totals", debitTotal.toFixed(2), creditTotal.toFixed(2)]);

        const csvContent = [headers, ...rows]
            .map(row => row.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `trial_balance_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Print trial balance
    const printTrialBalance = () => {
        const printContent = document.getElementById("chartOfAccountsTable")?.outerHTML;
        if (!printContent) {
            console.error("Print content not found");
            alert("An error occurred while preparing the content for printing.");
            return;
        }

        const newWindow = window.open("", "_blank");
        newWindow?.document.write(`
        <html lang="en">
        <head>
            <title>Trial Balance</title>
            <style>
                /* Print-specific styling */
                body, h1, table { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { text-align: center; font-size: 1.5em; }
                .date-range { text-align: center; font-size: 1em; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>Trial Balance</h1>
            <div class="date-range">From: ${startDate} To: ${endDate}</div>
            ${printContent}
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
                <h1 style={{ margin: 'unset' }}>Trial Balance</h1>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'row', marginBottom: '1rem' }}
                     className="search-bar">
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
                            onClick={fetchTrialBalance}
                            className="control-button"
                            title="Generate Trial Balance"
                            style={{
                                height: 'auto',
                                alignSelf: 'flex-end',
                                padding: '8px 16px',
                                margin: 'unset',
                                marginLeft: '1rem'
                            }}
                        >
                            Generate
                        </button>
                    </div>
                </div>

                <table id="chartOfAccountsTable">
                    <thead>
                    <tr>
                        <th>Account</th>
                        <th>Debit</th>
                        <th>Credit</th>
                    </tr>
                    </thead>
                    <tbody>
                    {trialBalance.map((entry: TrialBalanceDTO, index: number) => (
                        <tr key={index} className="chart-of-accounts-row">
                            <td>{entry.accountName}</td>
                            <td>{formatCurrency(entry.debit)}</td>
                            <td>{formatCurrency(entry.credit)}</td>
                        </tr>
                    ))}
                    <tr className="chart-of-accounts-row" style={{ fontWeight: 'bold' }}>
                        <td style={{ textAlign: 'right' }}>Totals</td>
                        <td>{formatCurrency(debitTotal)}</td>
                        <td>{formatCurrency(creditTotal)}</td>
                    </tr>
                    </tbody>
                </table>

                <div className="action-buttons" style={{ display: 'flex', flexDirection: 'row-reverse', marginTop: '1rem' }}>
                    <button
                        onClick={downloadCSV}
                        className="control-button"
                        style={{ marginLeft: '1rem' }}
                    >
                        Download as CSV
                    </button>
                    <button
                        onClick={printTrialBalance}
                        className="control-button"
                    >
                        Print
                    </button>
                    <button
                        onClick={saveAsPDF}
                        className="control-button"
                        style={{ marginRight: '1rem' }}
                    >
                        Save as PDF
                    </button>
                    <button
                        onClick={sendAsEmail}
                        className="control-button"
                        style={{ marginRight: '1rem' }}
                    >
                        Send as Email
                    </button>
                </div>
            </div>
        </RightDashboard>
    );
};

export default TrialBalance;
