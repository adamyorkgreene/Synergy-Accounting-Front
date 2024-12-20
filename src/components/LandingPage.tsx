import React, {useEffect, useRef, useState} from 'react';
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
    ChartOptions
} from 'chart.js';
import RightDashboard from './RightDashboard';
import '../LandingPage.css';
import {useUser} from "../utilities/UserContext";
import {useNavigate} from "react-router-dom";
import { GeneralMessageDTO } from '../Types';
import {formatCurrency} from "../utilities/Formatter";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LandingPage: React.FC = () => {

    const navigate = useNavigate();
    const { user: loggedInUser, fetchUser } = useUser();

    const [isLoading, setIsLoading] = useState(true);

    const [ratios, setRatios] = useState({
        currentRatio: { assets: 0, liabilities: 0, ratio: 0 },
        quickRatio: { assets: 0, liabilities: 0, inventory: 0, ratio: 0 },
        debtEquityRatio: { assets: 0, liabilities: 0, ratio: 0 },
        returnOnAssets: { netIncome: 0, totalAssets: 0, ratio: 0 },
        returnOnEquity: { netIncome: 0, totalEquity: 0, ratio: 0 },
    });

    const [generalMessages, setGeneralMessages] = useState<GeneralMessageDTO[]>([]);
    const [isLoadingGeneralMessages, setIsLoadingGeneralMessages] = useState(true);
    const [generalMessagesError, setGeneralMessagesError] = useState<string>('');

    const initCalled = useRef(false);
    const dataFetched = useRef(false);

    useEffect(() => {
        const init = async () => {
            if (!initCalled.current) {
                initCalled.current = true;
                if (!loggedInUser) {
                    await fetchUser();
                }
                setIsLoading(false);
            }
        };
        init();
    }, [fetchUser]);

    useEffect(() => {
        if (!isLoading) {
            if (!loggedInUser) {
                navigate('/login');
            } else if (loggedInUser.userType === 'DEFAULT') {
                navigate('/login');
                alert('You do not have permission to view this page.');
            }
        }
    }, [isLoading, loggedInUser, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            if (!dataFetched.current && loggedInUser && !isLoading) {
                dataFetched.current = true;
                await getData();
                await fetchGeneralMessages();
            }
        };
        fetchData();
    }, [loggedInUser, isLoading]);

    const ratioThresholds: { [key: string]: Thresholds } = {
        currentRatio: { good: [1.5, 2.5], warning: [1.0, 1.5], bad: [0, 1.0] },
        quickRatio: { good: [1.0, 2.0], warning: [0.8, 1.0], bad: [0, 0.8] },
        debtEquityRatio: { good: [0, 1.0], warning: [1.0, 2.0], bad: [2.0, Infinity] },
        returnOnAssets: { good: [0.15, 1.0], warning: [0.05, 0.15], bad: [0, 0.05] },
        returnOnEquity: { good: [0.15, 1.0], warning: [0.05, 0.15], bad: [0, 0.05] },
    };


    interface Thresholds {
        good: [number, number];
        warning: [number, number];
        bad: [number, number];
    }

    const getRatioColor = (value: number, thresholds: Thresholds): string => {
        if (value >= thresholds.good[0] && value <= thresholds.good[1]) {
            return '#2a9d8f';
        }
        if (value >= thresholds.warning[0] && value <= thresholds.warning[1]) {
            return '#f4a261';
        }
        return '#e63946';
    };

    const getData = async () => {
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
                    credentials: 'include',
                })
            );

            const responses = await Promise.all(requests);

            const data = await Promise.all(responses.map((response) => {
                if (!response.ok) {
                    console.error(`Failed to fetch: ${response.url}`);
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

    const fetchGeneralMessages = async () => {
        try {
            const response = await fetch('https://synergyaccounting.app/api/dashboard/messages', {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                console.error('Failed to fetch general messages..')
            }
            const data = await response.json();
            setGeneralMessages(data.reverse());
            setIsLoadingGeneralMessages(false);
        } catch (error) {
            console.error('Error fetching general messages:', error);
            setGeneralMessagesError('Could not load general messages.');
            setIsLoadingGeneralMessages(false);
        }
    };

    const currentRatioColor = getRatioColor(ratios.currentRatio.ratio, ratioThresholds.currentRatio);

    const currentRatioData = {
        labels: ['Current Assets', 'Current Liabilities'],
        datasets: [{
            data: [
                ratios.currentRatio.assets ?? 0,
                ratios.currentRatio.liabilities ?? 0,
            ],
            backgroundColor: [currentRatioColor, '#d3d3d3'],
            hoverOffset: 4,
        }],
    };

    const quickRatioColor = getRatioColor(ratios.quickRatio.ratio, ratioThresholds.quickRatio);

    const quickRatioData = {
        labels: ['Quick Assets', 'Current Liabilities'],
        datasets: [{
            data: [
                ratios.quickRatio.assets - ratios.quickRatio.inventory,
                ratios.quickRatio.liabilities,
            ],
            backgroundColor: [quickRatioColor, '#d3d3d3'],
            hoverOffset: 4,
        }],
    };


    const debtEquityValue = ratios.debtEquityRatio.ratio ?? 0;
    const debtEquityColor = getRatioColor(ratios.debtEquityRatio?.ratio ?? 0, ratioThresholds.debtEquityRatio);

    const debtEquityData = {
        labels: ['Debt-to-Equity Ratio'],
        datasets: [{
            label: 'Debt-to-Equity Ratio',
            data: [debtEquityValue],
            backgroundColor: [debtEquityColor],
            borderColor: '#333',
            borderWidth: 1,
        }],
    };

    const returnOnAssetsValue = Math.min(ratios.returnOnAssets.ratio ?? 0, 1);
    const returnOnAssetsColor = getRatioColor(returnOnAssetsValue, ratioThresholds.returnOnAssets);

    const returnOnAssetsData = {
        labels: ['Return on Assets', 'Remaining'],
        datasets: [{
            data: [
                returnOnAssetsValue,
                1 - returnOnAssetsValue,
            ],
            backgroundColor: [returnOnAssetsColor, '#d3d3d3'],
            hoverOffset: 4,
        }],
    };

    const returnOnEquityValue = Math.min(ratios?.returnOnEquity.ratio ?? 0, 1);
    const returnOnEquityColor = getRatioColor(returnOnEquityValue, ratioThresholds.returnOnEquity);

    const returnOnEquityData = {
        labels: ['Return on Equity', 'Remaining'],
        datasets: [{
            data: [
                returnOnEquityValue,
                1 - returnOnEquityValue,
            ],
            backgroundColor: [returnOnEquityColor, '#d3d3d3'],
            hoverOffset: 4,
        }],
    };

    const currentRatioOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: { raw: any; }) {
                        const value = context.raw;
                        return formatCurrency(value);
                    }
                }
            }
        }
    };

    const quickRatioOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context: { raw: any; }) {
                        const value = context.raw;
                        return formatCurrency(value);
                    }
                }
            }
        }
    };

    const debtEquityOptions = {
        responsive: true,
        plugins: {
            datalabels: {
                anchor: 'end',
                align: 'top',
                formatter: (value: number) => value.toFixed(2),
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
                        borderDash: [5, 5],
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
                            return value.toFixed(2);
                        }
                        return value;
                    },
                },
            },
        },
    } as ChartOptions<'bar'>;

    const returnOnAssetsOptions = {
        responsive: true,
        cutout: '70%',
        plugins: {
            datalabels: {
                formatter: (value: number, context: any) => {
                    if (context.dataIndex === 0) {
                        return `${(value * 100).toFixed(2)}%`;
                    }
                    return '';
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
                        const value = tooltipItem.raw as number;
                        return `${(value * 100).toFixed(2)}%`;
                    },
                },
            },
        },
    } as ChartOptions<'doughnut'>;

    const returnOnEquityOptions = {
        responsive: true,
        cutout: '70%',
        plugins: {
            datalabels: {
                formatter: (value: number, context: any) => {
                    if (context.dataIndex === 0) {
                        return `${(value * 100).toFixed(2)}%`;
                    }
                    return '';
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
                        const value = tooltipItem.raw as number;
                        return `${(value * 100).toFixed(2)}%`;
                    },
                },
            },
        },
    } as ChartOptions<'doughnut'>;

    if (
        isLoading ||
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
            <div className="landing-page-container">
                <h1 style={{margin: 'unset'}}>Announcements</h1>
                <div className="general-messages">
                    {generalMessagesError ? (
                        <p className="error-message">{generalMessagesError}</p>
                    ) : isLoadingGeneralMessages ? (
                        <p>Loading messages...</p>
                    ) : generalMessages.length > 0 ? (
                        <ul className="messages-list">
                            {generalMessages.map((message, index) => (
                                <li key={index} className="message-item">
                                    <img
                                        className="small-profile-icon"
                                        src={`https://synergyaccounting.app/api/dashboard/uploads/${message.username}.jpg`}
                                        alt={`${message.username}'s Profile`}
                                    />
                                    <div className="message-content">
                                        <p className="message-text">{message.message}</p>
                                        <small className="message-metadata">
                                            Posted by: {message.username} on{' '}
                                            {new Date(message.date).toLocaleDateString()}
                                        </small>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{color: 'black'}}>No general messages available.</p>
                    )}
                </div>
                <h1 style={{margin: 'unset'}}>Financial Overview</h1>
                <div className="landing-page-content">
                    <div className="financial-ratios">
                        <div className="ratio-card">
                            <h3>Current Ratio</h3>
                            <Pie data={currentRatioData} options={currentRatioOptions} width={120} height={120}/>
                            <div className="ratio-description">Current Assets vs Current Liabilities</div>
                        </div>
                        <div className="ratio-card">
                            <h3>Quick Ratio</h3>
                            <Pie data={quickRatioData} options={quickRatioOptions} width={120} height={120}/>
                            <div className="ratio-description">Quick Assets vs Current Liabilities</div>
                        </div>
                        <div className="ratio-card">
                            <h3>Debt-to-Equity Ratio</h3>
                            <Bar data={debtEquityData} options={debtEquityOptions} width={120} height={120}/>
                            <div className="ratio-description">Total Debt vs Shareholder Equity</div>
                        </div>
                        <div className="ratio-card">
                            <h3>Return on Assets</h3>
                            <Doughnut data={returnOnAssetsData} options={returnOnAssetsOptions} width={120}
                                      height={120}/>
                            <div className="ratio-description">Net Income vs Average Total Assets</div>
                        </div>
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
