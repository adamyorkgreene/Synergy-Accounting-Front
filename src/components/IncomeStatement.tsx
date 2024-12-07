import React, { useEffect, useState } from 'react';
import RightDashboard from './RightDashboard';
import { Account, IncomeStatementDTO, AccountType } from '../Types';
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../utilities/UserContext";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {formatCurrency} from "../utilities/Formatter";

const IncomeStatement: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const { user: loggedInUser, fetchUser } = useUser();

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [incomeStatement, setIncomeStatement] = useState<IncomeStatementDTO>({
        revenue: [],
        expenses: [],
        totalRevenue: 0,
        totalExpenses: 0,
        netIncome: 0,
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (!loggedInUser) {
                await fetchUser();
            }
            setIsLoading(false);
        };
        init();
    }, [loggedInUser, fetchUser]);

    useEffect(() => {
        if (!isLoading) {
            if (!loggedInUser) {
                navigate('/login');
            } else if (loggedInUser.userType !== "ADMINISTRATOR" && loggedInUser.userType !== "MANAGER") {
                navigate('/dashboard');
                alert('You do not have permission to view or generate an income statement.');
            }
        }
    }, [loggedInUser, isLoading, location.key, navigate]);

    const fetchIncomeStatement = async () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }
        try {
            const response = await fetch(`/api/accounts/income-statement?startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data: IncomeStatementDTO = await response.json();

            data.revenue = data.revenue.map(calculateCurrentBalance);
            data.expenses = data.expenses.map(calculateCurrentBalance);

            // Calculate totals and net income
            data.totalRevenue = data.revenue.reduce((sum, acc) => sum + acc.currentBalance, 0);
            data.totalExpenses = data.expenses.reduce((sum, acc) => sum + acc.currentBalance, 0);
            data.netIncome = data.totalRevenue - data.totalExpenses;

            setIncomeStatement(data);
        } catch (error) {
            console.error("Error fetching income statement:", error);
            alert("An error occurred while fetching the income statement.");
        }
    };

    const calculateCurrentBalance = (account: Account): Account => {
        const balance =
            account.normalSide === AccountType.CREDIT
                ? account.creditBalance - account.debitBalance
                : account.debitBalance - account.creditBalance;
        return { ...account, currentBalance: balance };
    };

    // Generate PDF Blob
    const generatePDFBlob = (): Blob | null => {
        if (!incomeStatement) {
            alert("No income statement data to save as PDF.");
            return null;
        }

        const doc = new jsPDF();

        // Add header
        doc.setFontSize(18);
        doc.text("Income Statement", 10, 10);
        doc.setFontSize(12);
        doc.text(`From: ${startDate} To: ${endDate}`, 10, 20);

        // Prepare table data
        const headers = [["Account", "Amount"]];
        const revenueRows = incomeStatement.revenue.map(entry => [
            entry.accountName,
            formatCurrency(entry.currentBalance),
        ]);
        const expenseRows = incomeStatement.expenses.map(entry => [
            entry.accountName,
            formatCurrency(entry.currentBalance),
        ]);

        const rows = [
            ["Revenue", ""],
            ...revenueRows,
            ["Total Revenue", formatCurrency(incomeStatement.totalRevenue)],
            ["", ""],
            ["Expenses", ""],
            ...expenseRows,
            ["Total Expenses", formatCurrency(incomeStatement.totalExpenses)],
            ["", ""],
            ["Net Income", formatCurrency(incomeStatement.netIncome)],
        ];

        // Generate table
        doc.autoTable({
            head: headers,
            body: rows,
            startY: 30,
        });

        // Return PDF as Blob
        return doc.output("blob");
    };

    // Save as PDF
    const saveAsPDF = () => {
        const pdfBlob = generatePDFBlob();
        if (!pdfBlob) return;

        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Income_Statement_${startDate}_to_${endDate}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Send as Email
    const sendAsEmail = () => {
        const pdfBlob = generatePDFBlob();
        if (!pdfBlob) return;

        const file = new File(
            [pdfBlob],
            `Income_Statement_${startDate}_to_${endDate}.pdf`,
            { type: "application/pdf" }
        );

        // Navigate to SendAdminEmail with attachment
        navigate('/dashboard/send-email', {
            state: { attachment: file }
        });
    };

    // Download CSV
    const downloadCSV = () => {
        const headers = ["Account", "Amount"];
        const rows = [
            ["Revenue", ""],
            ...incomeStatement.revenue.map(entry => [
                entry.accountName,
                entry.currentBalance.toFixed(2),
            ]),
            ["Total Revenue", incomeStatement.totalRevenue.toFixed(2)],
            ["", ""],
            ["Expenses", ""],
            ...incomeStatement.expenses.map(entry => [
                entry.accountName,
                entry.currentBalance.toFixed(2),
            ]),
            ["Total Expenses", incomeStatement.totalExpenses.toFixed(2)],
            ["", ""],
            ["Net Income", incomeStatement.netIncome.toFixed(2)],
        ];

        const csvContent = [headers, ...rows]
            .map(row => row.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `income_statement_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printIncomeStatement = () => {
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
            <title>Income Statement</title>
            <style>
                /* Print-specific styling */
                body, h1, table { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { text-align: center; font-size: 1.5em; }
            </style>
        </head>
        <body>
            <h1>Income Statement</h1>
            <div class="date-range">From: ${startDate} To: ${endDate}</div>
            ${printContent}
        </body>
        </html>
    `);
        newWindow?.document.close();
        newWindow?.print();
    };

    if (isLoading || !loggedInUser) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            <div className="chart-container">
                <h1 style={{ margin: 'unset' }}>Income Statement</h1>

                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        marginBottom: '1rem',
                    }}
                    className="search-bar"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <label>Start Date:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ marginBottom: '1rem', width: '100%', padding: '8px' }}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            marginLeft: '1rem',
                        }}
                    >
                        <label>End Date:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ marginBottom: '1rem', width: '100%', padding: '8px' }}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: 'unset',
                            marginLeft: '1rem',
                        }}
                    >
                        <label style={{ height: 'calc(10px + 2vmin)' }}> </label>
                        <button
                            onClick={fetchIncomeStatement}
                            className="control-button"
                            title="Generate Income Statement"
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
                        <th>Account</th>
                        <th>Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <th colSpan={2}>Revenue</th>
                    </tr>
                    {incomeStatement.revenue.map((entry, index) => (
                        <tr key={`revenue-${index}`}>
                            <td>{entry.accountName}</td>
                            <td>{formatCurrency(entry.currentBalance)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td>
                            <b>Total Revenue</b>
                        </td>
                        <td>{formatCurrency(incomeStatement.totalRevenue)}</td>
                    </tr>
                    <tr>
                        <th colSpan={2}>Expenses</th>
                    </tr>
                    {incomeStatement.expenses.map((entry, index) => (
                        <tr key={`expense-${index}`}>
                            <td>{entry.accountName}</td>
                            <td>{formatCurrency(entry.currentBalance)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td>
                            <b>Total Expenses</b>
                        </td>
                        <td>{formatCurrency(incomeStatement.totalExpenses)}</td>
                    </tr>
                    <tr>
                        <td>
                            <b>Net Income</b>
                        </td>
                        <td>{formatCurrency(incomeStatement.netIncome)}</td>
                    </tr>
                    </tbody>
                </table>

                <div
                    className="action-buttons"
                    style={{
                        display: 'flex',
                        flexDirection: 'row-reverse',
                        marginTop: '1rem',
                    }}
                >
                    <button
                        onClick={downloadCSV}
                        className="control-button"
                        style={{ marginLeft: '1rem' }}
                    >
                        Download as CSV
                    </button>
                    <button
                        onClick={printIncomeStatement}
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

export default IncomeStatement;
