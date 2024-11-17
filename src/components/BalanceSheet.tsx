import React, { useState, useEffect } from 'react';
import { useCsrf } from "../utilities/CsrfContext";
import { useLocation, useNavigate } from "react-router-dom";
import RightDashboard from './RightDashboard';
import { Account, AccountSubCategory, AccountType, BalanceSheetDTO } from '../Types';
import { useUser } from "../utilities/UserContext";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const BalanceSheet: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [balanceSheet, setBalanceSheet] = useState<BalanceSheetDTO | null>(null);
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
                alert('You do not have permission to view or generate a balance sheet.');
            }
        }
    }, [loggedInUser, isLoading, location.key, navigate]);

    const fetchBalanceSheet = async () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        if (!csrfToken) return;

        try {
            const response = await fetch(`/api/accounts/balance-sheet?startDate=${startDate}&endDate=${endDate}`, {
                method: 'GET',
                headers: { 'X-CSRF-TOKEN': csrfToken },
                credentials: 'include'
            });
            const data: BalanceSheetDTO = await response.json();
            setBalanceSheet(data);
        } catch (error) {
            console.error("Error fetching balance sheet:", error);
            alert("An error occurred while fetching the balance sheet.");
        }
    };

    const generatePDFBlob = (): Blob | null => {
        if (!balanceSheet) {
            alert("No balance sheet data to save as PDF.");
            return null;
        }

        const doc = new jsPDF();

        // Add header text
        doc.setFontSize(18);
        doc.text("Balance Sheet", 10, 10);
        doc.setFontSize(12);
        doc.text(`From: ${startDate} To: ${endDate}`, 10, 20);

        // Prepare table data
        const headers = [["Category", "Account", "Debit", "Credit"]];
        const assetRows = balanceSheet.assets.map(entry => [
            entry.accountCategory,
            entry.accountName,
            entry.debitBalance.toFixed(2),
            entry.creditBalance.toFixed(2),
        ]);
        const liabilityRows = balanceSheet.liabilities.map(entry => [
            entry.accountCategory,
            entry.accountName,
            entry.debitBalance.toFixed(2),
            entry.creditBalance.toFixed(2),
        ]);
        const equityRows = balanceSheet.equity.map(entry => [
            entry.accountCategory,
            entry.accountName,
            entry.debitBalance.toFixed(2),
            entry.creditBalance.toFixed(2),
        ]);
        const rows = [
            ...assetRows,
            ["", "Total Assets", "", balanceSheet.totalAssets.toFixed(2)],
            ...liabilityRows,
            ["", "Total Liabilities", "", balanceSheet.totalLiabilities.toFixed(2)],
            ...equityRows,
            ["", "Total Equity", "", balanceSheet.totalEquity.toFixed(2)],
            ["", "Total Liabilities + Equity", "", (balanceSheet.totalLiabilities + balanceSheet.totalEquity).toFixed(2)],
        ];

        // Generate table
        doc.autoTable({
            head: headers,
            body: rows,
            startY: 30,
        });

        // Return PDF blob
        return doc.output("blob");
    };

    const saveAsPDF = () => {
        const pdfBlob = generatePDFBlob();
        if (!pdfBlob) return;

        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Balance_Sheet_${startDate}_to_${endDate}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const sendAsEmail = () => {
        const pdfBlob = generatePDFBlob();
        if (!pdfBlob) return;

        const file = new File(
            [pdfBlob],
            `Balance_Sheet_${startDate}_to_${endDate}.pdf`,
            { type: "application/pdf" }
        );

        navigate('/dashboard/admin/send-email', {
            state: { attachment: file },
        });
    };

    const downloadCSV = () => {
        if (!balanceSheet) return;

        const headers = ["Category", "Account", "Debit", "Credit"];
        const rows = [
            ["Assets", ""],
            ...balanceSheet.assets.map(entry => [entry.accountCategory, entry.accountName, entry.debitBalance.toFixed(2), entry.creditBalance.toFixed(2)]),
            ["Total Assets", "", "", balanceSheet.totalAssets.toFixed(2)],
            ["", ""],
            ["Liabilities", ""],
            ...balanceSheet.liabilities.map(entry => [entry.accountCategory, entry.accountName, entry.debitBalance.toFixed(2), entry.creditBalance.toFixed(2)]),
            ["Total Liabilities", "", "", balanceSheet.totalLiabilities.toFixed(2)],
            ["", ""],
            ["Equity", ""],
            ...balanceSheet.equity.map(entry => [entry.accountCategory, entry.accountName, entry.debitBalance.toFixed(2), entry.creditBalance.toFixed(2)]),
            ["Total Equity", "", "", balanceSheet.totalEquity.toFixed(2)],
            ["", ""],
            ["Total Balance", "", "", (balanceSheet.totalAssets - balanceSheet.totalLiabilities).toFixed(2)]
        ];

        const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `balance_sheet_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const printBalanceSheet = () => {
        if (!balanceSheet) {
            alert("No balance sheet data to print.");
            return;
        }

        const assetRows = balanceSheet.assets.map(entry => `
        <tr>
            <td>${entry.accountCategory}</td>
            <td>${entry.accountName}</td>
            <td>${entry.debitBalance.toFixed(2)}</td>
            <td>${entry.creditBalance.toFixed(2)}</td>
        </tr>`).join("");

        const liabilityRows = balanceSheet.liabilities.map(entry => `
        <tr>
            <td>${entry.accountCategory}</td>
            <td>${entry.accountName}</td>
            <td>${entry.debitBalance.toFixed(2)}</td>
            <td>${entry.creditBalance.toFixed(2)}</td>
        </tr>`).join("");

        const equityRows = balanceSheet.equity.map(entry => `
        <tr>
            <td>${entry.accountCategory}</td>
            <td>${entry.accountName}</td>
            <td>${entry.debitBalance.toFixed(2)}</td>
            <td>${entry.creditBalance.toFixed(2)}</td>
        </tr>`).join("");

        const printContent = `
    <html lang="en">
    <head>
        <title>Balance Sheet</title>
        <style>
            body, h1, table { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; font-size: 1.5em; }
        </style>
    </head>
    <body>
        <h1>Balance Sheet</h1>
        <p>From: ${startDate} To: ${endDate}</p>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Account</th>
                    <th>Debit</th>
                    <th>Credit</th>
                </tr>
            </thead>
            <tbody>
                <tr><td colspan="4">Assets</td></tr>
                ${assetRows}
                <tr><td colspan="3"><b>Total Assets</b></td><td>${balanceSheet.totalAssets.toFixed(2)}</td></tr>
                <tr><td colspan="4">Liabilities</td></tr>
                ${liabilityRows}
                <tr><td colspan="3"><b>Total Liabilities</b></td><td>${balanceSheet.totalLiabilities.toFixed(2)}</td></tr>
                <tr><td colspan="4">Equity</td></tr>
                ${equityRows}
                <tr><td colspan="3"><b>Total Equity</b></td><td>${balanceSheet.totalEquity.toFixed(2)}</td></tr>
            </tbody>
        </table>
    </body>
    </html>`;

        const newWindow = window.open("", "_blank");
        newWindow?.document.write(printContent);
        newWindow?.document.close();
        newWindow?.print();
    };

    const renderAccountRows = (accounts: Account[]) => (
        accounts.map((account, index) => {
            const balance = account.normalSide === AccountType.DEBIT
                ? account.debitBalance - account.creditBalance
                : account.creditBalance - account.debitBalance;

            return (
                <tr key={index}>
                    <td>{account.accountName}</td>
                    <td>{balance.toFixed(2)}</td>
                </tr>
            );
        })
    );

    const calculateTotal = (accounts: Account[]): number => {
        return accounts.reduce((sum, account) => {
            const balance = account.normalSide === AccountType.DEBIT
                ? account.debitBalance - account.creditBalance
                : account.creditBalance - account.debitBalance;
            return sum + balance;
        }, 0);
    };

    if (isLoading || !csrfToken || !loggedInUser) {
        return <div>Loading...</div>;
    }

    const currentAssets = balanceSheet?.assets.filter(account => account.accountSubCategory === AccountSubCategory.CURRENT) || [];
    const longTermAssets = balanceSheet?.assets.filter(account => account.accountSubCategory === AccountSubCategory.LONGTERM) || [];

    const currentLiabilities = balanceSheet?.liabilities.filter(account => account.accountSubCategory === AccountSubCategory.CURRENT) || [];
    const longTermLiabilities = balanceSheet?.liabilities.filter(account => account.accountSubCategory === AccountSubCategory.LONGTERM) || [];

    const equityAccounts = balanceSheet?.equity || [];
    const totalEquity = balanceSheet?.totalEquity || 0;

    const totalLiabilities = calculateTotal(currentLiabilities) + calculateTotal(longTermLiabilities);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return (
        <RightDashboard>
            <div className="chart-container">
                <h1 style={{ margin: 'unset' }}>Balance Sheet</h1>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'row' }} className="search-bar">
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
                            onClick={fetchBalanceSheet}
                            className="control-button"
                            title="Generate Balance Sheet"
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
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ width: '48%' }}>
                        <table id="chartOfAccountsTable">
                            <thead>
                            <tr>
                                <th colSpan={2} style={{
                                    textAlign: 'center',
                                    fontSize: '1.2em',
                                    backgroundColor: '#8b9ea3',
                                    color: '#ffffff'
                                }}>Assets
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>
                                <th>Current Assets</th>
                                <th>Balance</th>
                            </tr>
                            </thead>
                            <tbody>
                            {renderAccountRows(currentAssets)}
                            <tr>
                                <td><b>Total Current Assets</b></td>
                                <td>{calculateTotal(currentAssets).toFixed(2)}</td>
                            </tr>
                            </tbody>
                            <thead>
                            <tr style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>
                                <th>Long-Term Assets</th>
                                <th>Balance</th>
                            </tr>
                            </thead>
                            <tbody>
                            {renderAccountRows(longTermAssets)}
                            <tr>
                                <td><b>Total Long-Term Assets</b></td>
                                <td>{calculateTotal(longTermAssets).toFixed(2)}</td>
                            </tr>
                            </tbody>
                            <tfoot>
                            <tr>
                                <td><b>Total Assets</b></td>
                                <td>{balanceSheet?.totalAssets.toFixed(2)}</td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div style={{ width: '48%' }}>
                        <table id="chartOfAccountsTable">
                            <thead>
                            <tr>
                                <th colSpan={2} style={{
                                    textAlign: 'center',
                                    fontSize: '1.2em',
                                    backgroundColor: '#8b9ea3',
                                    color: '#ffffff'
                                }}>Liabilities & Equity
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>
                                <th>Current Liabilities</th>
                                <th>Balance</th>
                            </tr>
                            </thead>
                            <tbody>
                            {renderAccountRows(currentLiabilities)}
                            <tr>
                                <td><b>Total Current Liabilities</b></td>
                                <td>{calculateTotal(currentLiabilities).toFixed(2)}</td>
                            </tr>
                            </tbody>
                            <thead>
                            <tr style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>
                                <th>Long-Term Liabilities</th>
                                <th>Balance</th>
                            </tr>
                            </thead>
                            <tbody>
                            {renderAccountRows(longTermLiabilities)}
                            <tr>
                                <td><b>Total Long-Term Liabilities</b></td>
                                <td>{calculateTotal(longTermLiabilities).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td><b>Total Liabilities</b></td>
                                <td>{totalLiabilities.toFixed(2)}</td>
                            </tr>
                            </tbody>
                            <thead>
                            <tr style={{ backgroundColor: '#d3d3d3', fontWeight: 'bold' }}>
                                <th>Equity</th>
                                <th>Balance</th>
                            </tr>
                            </thead>
                            <tbody>
                            {renderAccountRows(equityAccounts)}
                            <tr>
                                <td><b>Total Equity</b></td>
                                <td>{totalEquity.toFixed(2)}</td>
                            </tr>
                            </tbody>
                            <tfoot>
                            <tr>
                                <td><b>Total Liabilities + Equity</b></td>
                                <td>{totalLiabilitiesAndEquity.toFixed(2)}</td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
                <div className="action-buttons"
                     style={{ display: "flex", flexDirection: "row-reverse", marginTop: "1rem" }}>
                    <button onClick={downloadCSV} className="control-button" style={{ marginLeft: "1rem" }}>
                        Download as CSV
                    </button>
                    <button onClick={printBalanceSheet} className="control-button">
                        Print
                    </button>
                    <button onClick={saveAsPDF} className="control-button" style={{ marginRight: "1rem" }}>
                        Save as PDF
                    </button>
                    <button onClick={sendAsEmail} className="control-button" style={{ marginRight: "1rem" }}>
                        Send as Email
                    </button>
                </div>
            </div>
        </RightDashboard>
    );
};

export default BalanceSheet;
