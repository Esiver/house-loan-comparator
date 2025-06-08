// src/components/ComparisonSummary/EnhancedComparisonSummary.tsx

import React, { useState } from 'react';
import { EnhancedScenarioResults, findBestScenario, calculateSavings } from '../../utils/scenarioCalculations';
import './style.css';

interface EnhancedComparisonSummaryProps {
  results: EnhancedScenarioResults[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercentage = (value: number, decimals: number = 2) => {
  return `${value.toFixed(decimals)}%`;
};

export const EnhancedComparisonSummary: React.FC<EnhancedComparisonSummaryProps> = ({ results }) => {
  const [showDetails, setShowDetails] = useState<string | null>(null);
  
  if (results.length === 0) {
    return null;
  }

  const bestScenario = findBestScenario(results);
  const resultsWithSavings = calculateSavings(results);

  const toggleDetails = (scenarioId: string) => {
    setShowDetails(showDetails === scenarioId ? null : scenarioId);
  };

  return (
    <div className="enhanced-summary-container">
      <h2>Detailed Loan Comparison</h2>
      
      {/* Quick Overview Cards */}
      <div className="overview-cards">
        <div className="overview-card best-deal">
          <h3>💰 Best Deal</h3>
          <p className="scenario-name">{bestScenario?.scenarioName}</p>
          <p className="total-cost">{formatCurrency(bestScenario?.totalCost || 0)}</p>
        </div>
        
        <div className="overview-card total-scenarios">
          <h3>📊 Scenarios</h3>
          <p className="count">{results.length}</p>
          <p className="subtitle">Compared</p>
        </div>
        
        <div className="overview-card max-savings">
          <h3>💸 Max Savings</h3>
          <p className="savings">
            {formatCurrency(Math.max(...resultsWithSavings.map(r => r.savingsVsMostExpensive)))}
          </p>
          <p className="subtitle">vs Most Expensive</p>
        </div>
      </div>

      {/* Main Comparison Table */}
      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Monthly Payment</th>
              <th>Total Cost</th>
              <th>Savings</th>
              <th>Avg. Interest</th>
              <th>Kurstab Loss</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {resultsWithSavings.map((result) => (
              <React.Fragment key={result.scenarioId}>
                <tr className={result.scenarioId === bestScenario?.scenarioId ? 'best-scenario' : ''}>
                  <td>
                    <div className="scenario-cell">
                      <strong>{result.scenarioName}</strong>
                      {result.scenarioId === bestScenario?.scenarioId && (
                        <span className="best-badge">BEST</span>
                      )}
                    </div>
                  </td>
                  <td className="currency-cell">{formatCurrency(result.monthlyPayment)}</td>
                  <td className="currency-cell total-cost">
                    <strong>{formatCurrency(result.totalCost)}</strong>
                  </td>
                  <td className="savings-cell">
                    {result.savingsVsMostExpensive > 0 ? (
                      <div className="savings-positive">
                        {formatCurrency(result.savingsVsMostExpensive)}
                        <span className="savings-percentage">
                          ({formatPercentage(result.savingsPercentage, 1)})
                        </span>
                      </div>
                    ) : (
                      <span className="no-savings">-</span>
                    )}
                  </td>
                  <td>{formatPercentage(result.averageInterestRate)}</td>
                  <td>
                    <div className="kurstab-cell">
                      {formatCurrency(result.totalKurstab)}
                      <span className="kurstab-percentage">
                        ({formatPercentage(result.kurstabPercentage, 1)})
                      </span>
                    </div>
                  </td>
                  <td>
                    <button 
                      className="details-btn"
                      onClick={() => toggleDetails(result.scenarioId)}
                    >
                      {showDetails === result.scenarioId ? '▼ Hide' : '▶ Show'}
                    </button>
                  </td>
                </tr>
                
                {/* Detailed breakdown row */}
                {showDetails === result.scenarioId && (
                  <tr className="details-row">
                    <td colSpan={7}>
                      <div className="loan-details">
                        <h4>Loan breakdown for {result.scenarioName}:</h4>
                        <div className="loan-grid">
                          {result.loanDetails.map((detail) => (
                            <div key={detail.loan.id} className="loan-detail-card">
                              <h5>{detail.loan.name}</h5>
                              <div className="detail-stats">
                                <div className="stat">
                                  <span className="label">Principal:</span>
                                  <span className="value">{formatCurrency(detail.loan.principal)}</span>
                                </div>
                                <div className="stat">
                                  <span className="label">Interest Rate:</span>
                                  <span className="value">{formatPercentage(detail.loan.interestRate)}</span>
                                </div>
                                <div className="stat">
                                  <span className="label">Kurs:</span>
                                  <span className="value">{detail.loan.kurs}%</span>
                                </div>
                                <div className="stat">
                                  <span className="label">Term:</span>
                                  <span className="value">{detail.loan.termInYears} years</span>
                                </div>
                                <div className="stat">
                                  <span className="label">Monthly Payment:</span>
                                  <span className="value">{formatCurrency(detail.monthlyPayment)}</span>
                                </div>
                                <div className="stat">
                                  <span className="label">Total Interest:</span>
                                  <span className="value">{formatCurrency(detail.totalInterest)}</span>
                                </div>
                                <div className="stat">
                                  <span className="label">Kurstab Loss:</span>
                                  <span className="value">{formatCurrency(detail.kurstab)}</span>
                                </div>
                                <div className="stat">
                                  <span className="label">Effective Rate:</span>
                                  <span className="value">{formatPercentage(detail.effectiveInterestRate)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Summary stats for this scenario */}
                        <div className="scenario-summary">
                          <div className="summary-stat">
                            <span className="label">Total Principal:</span>
                            <span className="value">{formatCurrency(result.totalPrincipal)}</span>
                          </div>
                          <div className="summary-stat">
                            <span className="label">Total Interest:</span>
                            <span className="value">{formatCurrency(result.totalInterest)}</span>
                          </div>
                          <div className="summary-stat">
                            <span className="label">Total Kurstab:</span>
                            <span className="value">{formatCurrency(result.totalKurstab)}</span>
                          </div>
                          <div className="summary-stat">
                            <span className="label">Weighted Avg Term:</span>
                            <span className="value">{result.totalLoanTerm.toFixed(1)} years</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Additional insights */}
      <div className="insights-section">
        <h3>💡 Key Insights</h3>
        <div className="insights-grid">
          <div className="insight">
            <strong>Interest Rate Range:</strong> 
            {formatPercentage(Math.min(...results.map(r => r.averageInterestRate)))} - 
            {formatPercentage(Math.max(...results.map(r => r.averageInterestRate)))}
          </div>
          <div className="insight">
            <strong>Monthly Payment Range:</strong> 
            {formatCurrency(Math.min(...results.map(r => r.monthlyPayment)))} - 
            {formatCurrency(Math.max(...results.map(r => r.monthlyPayment)))}
          </div>
          <div className="insight">
            <strong>Total Kurstab Impact:</strong> 
            {formatCurrency(Math.min(...results.map(r => r.totalKurstab)))} - 
            {formatCurrency(Math.max(...results.map(r => r.totalKurstab)))}
          </div>
        </div>
      </div>
    </div>
  );
};