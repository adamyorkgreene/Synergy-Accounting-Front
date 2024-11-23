import React from 'react';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import RightDashboard from './RightDashboard';
import '../LandingPage.css';

// Register chart components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LandingPage: React.FC = () => {
    // Fake data for financial ratios
    const financialRatios = {
        currentRatio: 1.45,
        quickRatio: 0.98,
        debtEquityRatio: 0.45,
        returnOnAssets: 0.12,
        returnOnEquity: 0.08,
    };

    // Helper function to determine color based on value
    const getColor = (value: number) => {
        if (value > 1) {
            return '#2a9d8f'; // Green for favorable
        } else if (value > 0.5) {
            return '#f4a261'; // Yellow for moderate
        } else {
            return '#e63946'; // Red for unfavorable
        }
    };

    // Chart data for Current Ratio (Pie Chart)
    const currentRatioData = {
        labels: ['Current Assets', 'Current Liabilities'],
        datasets: [{
            data: [financialRatios.currentRatio, 1 - financialRatios.currentRatio],
            backgroundColor: [getColor(financialRatios.currentRatio), getColor(1 - financialRatios.currentRatio)],
            hoverOffset: 4,
        }],
    };

    // Chart data for Quick Ratio (Pie Chart)
    const quickRatioData = {
        labels: ['Quick Assets', 'Current Liabilities'],
        datasets: [{
            data: [financialRatios.quickRatio, 1 - financialRatios.quickRatio],
            backgroundColor: [getColor(financialRatios.quickRatio), getColor(1 - financialRatios.quickRatio)],
            hoverOffset: 4,
        }],
    };

    // Chart data for Debt to Equity Ratio (Bar Chart)
    const debtEquityData = {
        labels: ['Debt-to-Equity Ratio'],
        datasets: [{
            label: 'Debt-to-Equity Ratio',
            data: [financialRatios.debtEquityRatio],
            backgroundColor: [getColor(financialRatios.debtEquityRatio)],
            borderColor: '#333',
            borderWidth: 1,
        }],
    };

    // Chart data for Return on Assets (Doughnut Chart)
    const returnOnAssetsData = {
        labels: ['Return on Assets', 'Other'],
        datasets: [{
            data: [financialRatios.returnOnAssets, 1 - financialRatios.returnOnAssets],
            backgroundColor: [getColor(financialRatios.returnOnAssets), getColor(1 - financialRatios.returnOnAssets)],
            hoverOffset: 4,
        }],
    };

    // Chart data for Return on Equity (Doughnut Chart)
    const returnOnEquityData = {
        labels: ['Return on Equity', 'Other'],
        datasets: [{
            data: [financialRatios.returnOnEquity, 1 - financialRatios.returnOnEquity],
            backgroundColor: [getColor(financialRatios.returnOnEquity), getColor(1 - financialRatios.returnOnEquity)],
            hoverOffset: 4,
        }],
    };

    return (
        <RightDashboard>
            {/* Landing Page Container */}
            <div className="landing-page-container">
                {/* Landing Page Content */}
                <div className="landing-page-content">
                    <h2>Financial Ratios</h2>
                    {/* Financial Ratios Section */}
                    <div className="financial-ratios">
                        {/* Current Ratio */}
                        <div className="ratio-card">
                            <h3>Current Ratio</h3>
                            <Pie data={currentRatioData} width={120} height={120} />
                            <div className="ratio-description">Current Assets vs Current Liabilities</div>
                        </div>

                        {/* Quick Ratio */}
                        <div className="ratio-card">
                            <h3>Quick Ratio</h3>
                            <Pie data={quickRatioData} width={120} height={120} />
                            <div className="ratio-description">Quick Assets vs Current Liabilities</div>
                        </div>

                        {/* Debt-to-Equity Ratio */}
                        <div className="ratio-card">
                            <h3>Debt-to-Equity Ratio</h3>
                            <Bar data={debtEquityData} width={120} height={120} />
                            <div className="ratio-description">Total Debt vs Shareholder Equity</div>
                        </div>

                        {/* Return on Assets */}
                        <div className="ratio-card">
                            <h3>Return on Assets</h3>
                            <Doughnut data={returnOnAssetsData} width={120} height={120} />
                            <div className="ratio-description">Net Income vs Average Total Assets</div>
                        </div>

                        {/* Return on Equity */}
                        <div className="ratio-card">
                            <h3>Return on Equity</h3>
                            <Doughnut data={returnOnEquityData} width={120} height={120} />
                            <div className="ratio-description">Net Income vs Shareholder Equity</div>
                        </div>
                    </div>
                </div>
            </div>
        </RightDashboard>
    );
};

export default LandingPage;
