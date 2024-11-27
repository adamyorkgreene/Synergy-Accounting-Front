import React, {useEffect, useState} from 'react';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData, ChartOptions
} from 'chart.js';
import RightDashboard from './RightDashboard';
import '../LandingPage.css';
import {useCsrf} from "../utilities/CsrfContext";
import {useUser} from "../utilities/UserContext";
import {useNavigate} from "react-router-dom";

// Register chart components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LandingPage: React.FC = () => {

    const navigate = useNavigate();

    const { csrfToken } = useCsrf();
    const { user: loggedInUser, fetchUser } = useUser();

    const [isLoading, setIsLoading] = useState(true);

    const [ratios, setRatios] = useState({
        currentRatio: { assets: 0, liabilities: 0, ratio: 0 },
        quickRatio: { assets: 0, liabilities: 0, inventory: 0, ratio: 0 },
        debtEquityRatio: { assets: 0, liabilities: 0, ratio: 0 },
        returnOnAssets: { netIncome: 0, totalAssets: 0, ratio: 0 },
        returnOnEquity: { netIncome: 0, totalEquity: 0, ratio: 0 },
    });

    const [pendingJournalCount, setPendingJournalCount] = useState(0); // Journal entries count
    const [generalMessages, setGeneralMessages] = useState([]); // General messages
    const [isLoadingGeneralMessages, setIsLoadingGeneralMessages] = useState(true);
    const [generalMessagesError, setGeneralMessagesError] = useState(null);

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
                navigate('/login')
            }
            else if (loggedInUser.userType === "DEFAULT"){
                navigate('/login');
                alert('You do not have permission to view this page.')
            } else {
                getData().then();  {
                  // Fetch additional data for journal entries and general messages
                     fetchPendingJournalEntries();
                     fetchGeneralMessages();
                      };
            }
        }
    }, [loggedInUser, isLoading, navigate]);

    const getData = async () => {
        if (!csrfToken) {
            console.error('CSRF token is not available.');
            return;
        }

        try {
            const urls = [
                'https://synergyaccounting.app/api/accounts/current-ratio',
                'https://synergyaccounting.app/api/accounts/quick-ratio',
                'https://synergyaccounting.app/api/accounts/debt-to-equity-ratio',
                'https://synergyaccounting.app/api/accounts/return-on-assets',
                'https://synergyaccounting.app/api/accounts/return-on-equity',
            ];

            const requests = urls.map((url) =>
                fetch(url, {
                    method: 'GET',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    credentials: 'include',
                })
            );

            const responses = await Promise.all(requests);

            const data = await Promise.all(responses.map((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch: ${response.url}`);
                }
                return response.json();
            }));

            setRatios({
                currentRatio: data[0],
                quickRatio: data[1],
                debtEquityRatio: data[2],
                returnOnAssets: data[3],
                returnOnEquity: data[4],
            });
        } catch (error) {
            console.error('Error fetching ratio data:', error);
        }
    };

    const fetchPendingJournalEntries = async () => {
      try {
        const response = await fetch('https://synergyaccounting.app/api/manager/journal-entry-requests/pending', {
          method: 'GET',
          headers: { 'X-CSRF-TOKEN': csrfToken },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pending journal entries.');
        }

        const data = await response.json();
        setPendingJournalCount(data.length); // Get the count of pending entries
      } catch (error) {
        console.error('Error fetching pending journal entries:', error);
      }
    };

    const fetchGeneralMessages = async () => {
      try {
        const response = await fetch('https://synergyaccounting.app/api/dashboard/messages', {
          method: 'GET',
          headers: { 'X-CSRF-TOKEN': csrfToken },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch general messages.');
        }

        const data = await response.json();
        setGeneralMessages(data); // Store the general messages
        setIsLoadingGeneralMessages(false);
      } catch (error) {
        console.error('Error fetching general messages:', error);
        setGeneralMessagesError('Could not load general messages.');
        setIsLoadingGeneralMessages(false);
      }
    };


// Chart data for Current Ratio (Pie Chart)
    const currentRatioData = {
        labels: ['Current Assets', 'Current Liabilities'],
        datasets: [{
            data: [
                ratios?.currentRatio?.assets ?? 0, // Current Assets
                ratios?.currentRatio?.liabilities ?? 0, // Current Liabilities
            ],
            backgroundColor: ['#2a9d8f', '#e63946'],
            hoverOffset: 4,
        }],
    };

// Chart data for Quick Ratio (Pie Chart)
    const quickRatioData = {
        labels: ['Quick Assets (Excludes Inventory)', 'Current Liabilities'],
        datasets: [{
            data: [
                (ratios?.quickRatio?.assets ?? 0) - (ratios?.quickRatio?.inventory ?? 0), // Quick Assets
                ratios?.quickRatio?.liabilities ?? 0, // Current Liabilities
            ],
            backgroundColor: ['#2a9d8f', '#e63946'],
            hoverOffset: 4,
        }],
    };

    const ratio = ratios?.debtEquityRatio?.ratio ?? 0;

    const debtEquityData: ChartData<'bar'> = {
        labels: ['Debt-to-Equity Ratio'],
        datasets: [{
            label: 'Debt-to-Equity Ratio',
            data: [ratio],
            backgroundColor: ratio > 0
                ? (ratio < 1 ? '#2a9d8f' : '#e63946')
                : '#d3d3d3', // Neutral color for zero values
            borderColor: '#333',
            borderWidth: 1,
        }],
    };

// Chart data for Return on Assets (Doughnut Chart)
    const returnOnAssetsData = {
        labels: ['Return on Assets', 'Remaining'],
        datasets: [{
            data: [
                Math.min(ratios?.returnOnAssets?.ratio ?? 0, 1), // Cap at 1 (100%)
                1 - Math.min(ratios?.returnOnAssets?.ratio ?? 0, 1), // Remaining proportion
            ],
            backgroundColor: ['#2a9d8f', '#d3d3d3'], // Neutral color for the "Remaining" segment
            hoverOffset: 4,
        }],
    };


// Chart data for Return on Equity (Doughnut Chart)
    const returnOnEquityData = {
        labels: ['Return on Equity', 'Remaining'],
        datasets: [{
            data: [
                Math.min(ratios?.returnOnEquity?.ratio ?? 0, 1), // Cap at 1 (100%)
                1 - Math.min(ratios?.returnOnEquity?.ratio ?? 0, 1), // Remaining proportion
            ],
            backgroundColor: ['#2a9d8f', '#d3d3d3'], // Neutral color for the "Remaining" segment
            hoverOffset: 4,
        }],
    };

    // Chart data for Debt to Equity Ratio (Bar Chart)
    const debtEquityOptions = {
        responsive: true,
        plugins: {
            datalabels: {
                anchor: 'end',
                align: 'top',
                formatter: (value: number) => value.toFixed(2), // Format datalabels to two decimal places
                color: '#333',
                font: {
                    weight: 'bold',
                },
            },
            annotation: {
                annotations: {
                    benchmark: {
                        type: 'line',
                        yMin: 1,
                        yMax: 1,
                        borderColor: '#000',
                        borderWidth: 1,
                        borderDash: [5, 5], // Dashed line for benchmark
                        label: {
                            content: 'Benchmark: 1.0',
                            enabled: true,
                            position: 'end',
                            color: '#000',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            font: {
                                size: 12,
                            },
                        },
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: string | number) => {
                        if (typeof value === 'number') {
                            return value.toFixed(2); // Format y-axis tick labels
                        }
                        return value;
                    },
                },
            },
        },
    } as ChartOptions<'bar'>;

    const returnOnAssetsOptions = {
        responsive: true,
        cutout: '70%', // Adjust the doughnut thickness
        plugins: {
            datalabels: {
                formatter: (value: number, context: any) => {
                    if (context.dataIndex === 0) { // Only for the first segment
                        return `${(value * 100).toFixed(2)}%`;
                    }
                    return ''; // Hide for other segments
                },
                color: '#000',
                font: {
                    weight: 'bold',
                    size: 14,
                },
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) => {
                        const value = tooltipItem.raw as number; // Access the raw value
                        return `${(value * 100).toFixed(2)}%`; // Convert to percentage
                    },
                },
            },
        },
    } as ChartOptions<'doughnut'>;

    const returnOnEquityOptions = {
        responsive: true,
        cutout: '70%', // Adjust the doughnut thickness
        plugins: {
            datalabels: {
                formatter: (value: number, context: any) => {
                    if (context.dataIndex === 0) { // Only for the first segment
                        return `${(value * 100).toFixed(2)}%`;
                    }
                    return ''; // Hide for other segments
                },
                color: '#000',
                font: {
                    weight: 'bold',
                    size: 14,
                },
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) => {
                        const value = tooltipItem.raw as number; // Access the raw value
                        return `${(value * 100).toFixed(2)}%`; // Convert to percentage
                    },
                },
            },
        },
    } as ChartOptions<'doughnut'>;

    if (
        isLoading ||
        !csrfToken ||
        !loggedInUser ||
        !ratios.currentRatio ||
        !ratios.quickRatio ||
        !ratios.debtEquityRatio ||
        !ratios.returnOnAssets ||
        !ratios.returnOnEquity
    ) {
        return <div>Loading...</div>;
    }

    return (
        <RightDashboard>
            {/* Landing Page Container */}
            <div className="landing-page-container" style={{justifyContent: 'flex-start', padding: '2vmin 5vmin 5vmin'}}>
                <h1 style={{margin: 'unset'}}>Trial Balance</h1>
                {/* Landing Page Content */}
                <div className="landing-page-content">
                 {/* Pending Journal Entries */}
                                <div className="pending-journal-entries">
                                  <h2>Pending Journal Entries</h2>
                                  {pendingJournalCount > 0 ? (
                                    <p>
                                      <strong>{pendingJournalCount}</strong> journal entry/entries are waiting for approval.
                                    </p>
                                  ) : (
                                    <p>All journal entries are approved!</p>
                                  )}
                                </div>

                   {/* General Messages */}
                   <div className="general-messages">
                     <h2>General Messages</h2>
                     {generalMessagesError ? (
                       <p className="error-message">{generalMessagesError}</p>
                     ) : isLoadingGeneralMessages ? (
                       <p>Loading messages...</p>
                     ) : generalMessages.length > 0 ? (
                       <ul>
                         {generalMessages.map((message, index) => (
                           <li key={index}>
                             <p>{message.message}</p>
                             <small>
                               Posted by: {message.user} on {new Date(message.date).toLocaleDateString()}
                             </small>
                           </li>
                         ))}
                       </ul>
                     ) : (
                       <p>No general messages available.</p>
                     )}
                   </div>

                    {/* Financial Ratios Section */}
                    <div className="financial-ratios">
                        {/* Current Ratio */}
                        <div className="ratio-card">
                            <h3>Current Ratio</h3>
                            <Pie data={currentRatioData} width={120} height={120}/>
                            <div className="ratio-description">Current Assets vs Current Liabilities</div>
                        </div>

                        {/* Quick Ratio */}
                        <div className="ratio-card">
                            <h3>Quick Ratio</h3>
                            <Pie data={quickRatioData} width={120} height={120}/>
                            <div className="ratio-description">Quick Assets vs Current Liabilities</div>
                        </div>

                        {/* Debt-to-Equity Ratio */}
                        <div className="ratio-card">
                            <h3>Debt-to-Equity Ratio</h3>
                            <Bar data={debtEquityData} options={debtEquityOptions} width={120} height={120}/>
                            <div className="ratio-description">Total Debt vs Shareholder Equity</div>
                        </div>

                        {/* Return on Assets */}
                        <div className="ratio-card">
                            <h3>Return on Assets</h3>
                            <Doughnut data={returnOnAssetsData} options={returnOnAssetsOptions} width={120}
                                      height={120}/>
                            <div className="ratio-description">Net Income vs Average Total Assets</div>
                        </div>

                        {/* Return on Equity */}
                        <div className="ratio-card">
                            <h3>Return on Equity</h3>
                            <Doughnut data={returnOnEquityData} options={returnOnEquityOptions} width={120}
                                      height={120}/>
                            <div className="ratio-description">Net Income vs Shareholder Equity</div>
                        </div>
                    </div>
                </div>
            </div>
        </RightDashboard>
    );
};

export default LandingPage;
